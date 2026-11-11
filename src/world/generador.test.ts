import { describe, expect, it } from 'vitest';
import { construirVecinos } from './disposicion';
import { PROPORCIONES, TAMANO_MAXIMO, generarMapa, generarMapaConDetalle, tamanoMinimoAgua } from './generador';
import { dentroDelMapa, indiceCasilla } from './mapa';
import { CANTIDAD_TERRENOS, INFO_TERRENO, Terreno, VARIANTES_POR_TERRENO } from './terreno';

const COLUMNAS = 64;
const FILAS = 256;
const SEMILLAS = [1, 42, 777, 20261031, 99999];

function contar(terreno: Uint8Array): number[] {
  const cuenta = new Array<number>(CANTIDAD_TERRENOS).fill(0);
  for (const t of terreno) cuenta[t] = (cuenta[t] ?? 0) + 1;
  return cuenta;
}

function esAgua(t: number): boolean {
  return t === Terreno.AguaProfunda || t === Terreno.Agua;
}

/** Tamaños de las masas de agua conectadas por arista. */
function tamanosDeAgua(terreno: Uint8Array, vecinos: Int32Array): number[] {
  const visto = new Uint8Array(terreno.length);
  const tamanos: number[] = [];
  for (let inicio = 0; inicio < terreno.length; inicio++) {
    if (visto[inicio] || !esAgua(terreno[inicio] as number)) continue;
    const pila = [inicio];
    visto[inicio] = 1;
    let tamano = 0;
    while (pila.length) {
      const i = pila.pop() as number;
      tamano++;
      for (let k = 0; k < 4; k++) {
        const v = vecinos[i * 4 + k] as number;
        if (v >= 0 && !visto[v] && esAgua(terreno[v] as number)) {
          visto[v] = 1;
          pila.push(v);
        }
      }
    }
    tamanos.push(tamano);
  }
  return tamanos;
}

describe('generarMapa (mundo rectangular 64 x 256)', () => {
  it('crea 16.384 casillas con arreglos del tamaño correcto', () => {
    const m = generarMapa({ ancho: COLUMNAS, alto: FILAS, semilla: 5 });
    expect(m.terreno).toHaveLength(16384);
    expect(m.elevacion).toHaveLength(16384);
    expect(m.variante).toHaveLength(16384);
    expect(m.ancho).toBe(64);
    expect(m.alto).toBe(256);
  });

  it('es determinista: misma semilla, mismo mundo (incluidos los ríos)', () => {
    const a = generarMapaConDetalle({ ancho: COLUMNAS, alto: FILAS, semilla: 20261031 });
    const b = generarMapaConDetalle({ ancho: COLUMNAS, alto: FILAS, semilla: 20261031 });
    expect(a.mapa.terreno).toEqual(b.mapa.terreno);
    expect(a.mapa.elevacion).toEqual(b.mapa.elevacion);
    expect(a.mapa.variante).toEqual(b.mapa.variante);
    expect(a.casillasRio).toBe(b.casillasRio);
  });

  it('semillas distintas producen mundos distintos', () => {
    const a = generarMapa({ ancho: COLUMNAS, alto: FILAS, semilla: 1 });
    const b = generarMapa({ ancho: COLUMNAS, alto: FILAS, semilla: 2 });
    let distintas = 0;
    for (let i = 0; i < a.terreno.length; i++) if (a.terreno[i] !== b.terreno[i]) distintas++;
    expect(distintas).toBeGreaterThan(2000);
  });

  it('todas las casillas tienen un terreno válido y se usan las tres variantes', () => {
    const m = generarMapa({ ancho: COLUMNAS, alto: FILAS, semilla: 9 });
    for (const t of m.terreno) expect(t).toBeLessThan(CANTIDAD_TERRENOS);
    const usadas = new Set<number>();
    for (const v of m.variante) {
      expect(v).toBeLessThan(VARIANTES_POR_TERRENO);
      usadas.add(v);
    }
    expect(usadas.size).toBe(VARIANTES_POR_TERRENO);
  });

  it('conserva las proporciones por tipo con cualquier semilla (±0,3 puntos)', () => {
    const objetivo: Array<[number, number]> = [
      [Terreno.AguaProfunda, PROPORCIONES.marProfundo],
      [Terreno.Agua, PROPORCIONES.agua],
      [Terreno.Arena, PROPORCIONES.arena],
      [Terreno.Pradera, PROPORCIONES.pradera],
      [Terreno.Bosque, PROPORCIONES.bosque],
      [Terreno.Colina, PROPORCIONES.colina],
      [Terreno.Montana, PROPORCIONES.montana],
    ];
    for (const semilla of SEMILLAS) {
      const m = generarMapa({ ancho: COLUMNAS, alto: FILAS, semilla });
      const cuenta = contar(m.terreno);
      for (const [id, esperado] of objetivo) {
        expect(Math.abs((cuenta[id] as number) / m.terreno.length - esperado)).toBeLessThan(0.003);
      }
    }
  });

  it('AGUA COHERENTE: no hay charcas sueltas; cada masa de agua tiene un tamaño razonable', () => {
    const vecinos = construirVecinos(COLUMNAS, FILAS);
    const minimo = tamanoMinimoAgua(COLUMNAS * FILAS);
    for (const semilla of SEMILLAS) {
      const m = generarMapa({ ancho: COLUMNAS, alto: FILAS, semilla });
      const tamanos = tamanosDeAgua(m.terreno, vecinos);
      expect(tamanos.length).toBeGreaterThan(0);
      expect(tamanos.length).toBeLessThan(30); // medido: 7 a 9 masas
      for (const t of tamanos) expect(t).toBeGreaterThanOrEqual(minimo);
    }
  });

  it('HAY RÍOS, ocupan poca superficie y todos desembocan en una masa de agua grande', () => {
    for (const semilla of SEMILLAS) {
      const d = generarMapaConDetalle({ ancho: COLUMNAS, alto: FILAS, semilla });
      expect(d.rios).toBeGreaterThanOrEqual(3); // medido: 11
      expect(d.casillasRio).toBeGreaterThan(30);
      expect(d.casillasRio).toBeLessThanOrEqual(Math.floor(16384 * 0.03));
      // Como no hay masas de agua pequeñas (prueba anterior), ningún río está cortado ni aislado.
      expect(d.menorCuerpoAgua).toBeGreaterThanOrEqual(tamanoMinimoAgua(16384));
    }
  });

  it('COSTAS COHERENTES: casi toda la arena está junto al agua (medido 94 a 100 %)', () => {
    const vecinos = construirVecinos(COLUMNAS, FILAS);
    for (const semilla of SEMILLAS) {
      const m = generarMapa({ ancho: COLUMNAS, alto: FILAS, semilla });
      const dist = new Int16Array(m.terreno.length).fill(-1);
      const cola: number[] = [];
      m.terreno.forEach((t, i) => {
        if (esAgua(t)) {
          dist[i] = 0;
          cola.push(i);
        }
      });
      for (let h = 0; h < cola.length; h++) {
        const i = cola[h] as number;
        for (let k = 0; k < 4; k++) {
          const v = vecinos[i * 4 + k] as number;
          if (v >= 0 && dist[v] === -1) {
            dist[v] = (dist[i] as number) + 1;
            cola.push(v);
          }
        }
      }
      let arena = 0;
      let cerca = 0;
      m.terreno.forEach((t, i) => {
        if (t === Terreno.Arena) {
          arena++;
          if ((dist[i] as number) <= 4) cerca++;
        }
      });
      expect(arena).toBeGreaterThan(500);
      expect(cerca / arena).toBeGreaterThan(0.9);
    }
  });

  it('acepta mapas pequeños, de una casilla y de otros tamaños', () => {
    expect(generarMapa({ ancho: 1, alto: 1, semilla: 3 }).terreno).toHaveLength(1);
    expect(generarMapa({ ancho: 5, alto: 7, semilla: 3 }).terreno).toHaveLength(35);
    expect(generarMapa({ ancho: 40, alto: 40, semilla: 3 }).terreno).toHaveLength(1600);
  });

  it('rechaza tamaños inválidos', () => {
    expect(() => generarMapa({ ancho: 0, alto: 10, semilla: 1 })).toThrow();
    expect(() => generarMapa({ ancho: 10, alto: -3, semilla: 1 })).toThrow();
    expect(() => generarMapa({ ancho: 10.5, alto: 10, semilla: 1 })).toThrow();
    expect(() => generarMapa({ ancho: TAMANO_MAXIMO + 1, alto: 10, semilla: 1 })).toThrow();
  });
});

describe('terreno y mapa', () => {
  it('todos los terrenos tienen información coherente', () => {
    expect(INFO_TERRENO).toHaveLength(CANTIDAD_TERRENOS);
    INFO_TERRENO.forEach((info, indice) => {
      expect(info.id).toBe(indice);
      expect(info.nombre.length).toBeGreaterThan(0);
      expect(info.color.startsWith('#')).toBe(true);
    });
  });

  it('indiceCasilla y dentroDelMapa funcionan en los bordes', () => {
    const m = { ancho: 5, alto: 4 };
    expect(indiceCasilla(m, 0, 0)).toBe(0);
    expect(indiceCasilla(m, 4, 3)).toBe(19);
    expect(dentroDelMapa(m, 4, 3)).toBe(true);
    expect(dentroDelMapa(m, 5, 0)).toBe(false);
    expect(dentroDelMapa(m, -1, 0)).toBe(false);
    expect(dentroDelMapa(m, 0, 4)).toBe(false);
  });
});
