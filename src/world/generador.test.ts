import { describe, expect, it } from 'vitest';
import { PERCENTILES, TAMANO_MAXIMO, generarMapa } from './generador';
import { dentroDelMapa, indiceCasilla } from './mapa';
import { CANTIDAD_TERRENOS, INFO_TERRENO, Terreno, VARIANTES_POR_TERRENO } from './terreno';

function contar(terreno: Uint8Array): number[] {
  const cuenta = new Array<number>(CANTIDAD_TERRENOS).fill(0);
  for (const t of terreno) cuenta[t] = (cuenta[t] ?? 0) + 1;
  return cuenta;
}

describe('generarMapa', () => {
  it('crea arreglos del tamaño correcto', () => {
    const m = generarMapa({ ancho: 40, alto: 30, semilla: 5 });
    expect(m.terreno).toHaveLength(1200);
    expect(m.elevacion).toHaveLength(1200);
    expect(m.variante).toHaveLength(1200);
    expect(m.ancho).toBe(40);
    expect(m.alto).toBe(30);
  });

  it('es determinista: misma semilla, mismo mapa', () => {
    const a = generarMapa({ ancho: 64, alto: 64, semilla: 20261031 });
    const b = generarMapa({ ancho: 64, alto: 64, semilla: 20261031 });
    expect(a.terreno).toEqual(b.terreno);
    expect(a.elevacion).toEqual(b.elevacion);
    expect(a.variante).toEqual(b.variante);
  });

  it('semillas distintas producen mapas distintos', () => {
    const a = generarMapa({ ancho: 64, alto: 64, semilla: 1 });
    const b = generarMapa({ ancho: 64, alto: 64, semilla: 2 });
    let distintas = 0;
    for (let i = 0; i < a.terreno.length; i++) if (a.terreno[i] !== b.terreno[i]) distintas++;
    expect(distintas).toBeGreaterThan(400);
  });

  it('solo usa identificadores de terreno y variantes válidos', () => {
    const m = generarMapa({ ancho: 80, alto: 80, semilla: 9 });
    for (const t of m.terreno) expect(t).toBeLessThan(CANTIDAD_TERRENOS);
    const usadas = new Set<number>();
    for (const v of m.variante) {
      expect(v).toBeLessThan(VARIANTES_POR_TERRENO);
      usadas.add(v);
    }
    expect(usadas.size).toBe(VARIANTES_POR_TERRENO);
  });

  it('respeta las proporciones objetivo con cualquier semilla (±0,5 puntos)', () => {
    const esperado: Array<[number, number]> = [
      [Terreno.AguaProfunda, PERCENTILES.marProfundo],
      [Terreno.Agua, PERCENTILES.agua - PERCENTILES.marProfundo],
      [Terreno.Arena, PERCENTILES.arena - PERCENTILES.agua],
      [Terreno.Colina, PERCENTILES.colina - PERCENTILES.llanura],
      [Terreno.Montana, 1 - PERCENTILES.colina],
    ];
    for (const semilla of [1, 42, 777, 20261031]) {
      const m = generarMapa({ ancho: 128, alto: 128, semilla });
      const cuenta = contar(m.terreno);
      const total = m.terreno.length;
      for (const [id, objetivo] of esperado) {
        expect(Math.abs((cuenta[id] as number) / total - objetivo)).toBeLessThan(0.005);
      }
      const llanura = ((cuenta[Terreno.Pradera] as number) + (cuenta[Terreno.Bosque] as number)) / total;
      expect(Math.abs(llanura - (PERCENTILES.llanura - PERCENTILES.arena))).toBeLessThan(0.005);
    }
  });

  it('contiene tanto agua como tierra y la mayor parte de los bordes es agua', () => {
    const m = generarMapa({ ancho: 128, alto: 128, semilla: 20261031 });
    const cuenta = contar(m.terreno);
    expect(cuenta[Terreno.Agua] as number).toBeGreaterThan(0);
    expect(cuenta[Terreno.Pradera] as number).toBeGreaterThan(0);
    expect(cuenta[Terreno.Bosque] as number).toBeGreaterThan(0);
    let borde = 0;
    let agua = 0;
    for (let i = 0; i < 128; i++) {
      for (const [x, y] of [[i, 0], [i, 127], [0, i], [127, i]] as const) {
        borde++;
        if ((m.terreno[indiceCasilla(m, x, y)] as number) <= Terreno.Agua) agua++;
      }
    }
    expect(agua / borde).toBeGreaterThan(0.5);
  });

  it('acepta un mapa de una sola casilla', () => {
    const m = generarMapa({ ancho: 1, alto: 1, semilla: 3 });
    expect(m.terreno).toHaveLength(1);
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
