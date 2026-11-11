import { describe, expect, it } from 'vitest';
import { centroCasilla, construirVecinos, coordenadasSuelo, posicionCasilla, vecinosArista, zonaCubierta } from './disposicion';
import { crearAleatorio } from './ruido';

/** ¿El punto (x, y) está dentro del rombo de la casilla (c, f)? */
function dentroDeCasilla(x: number, y: number, c: number, f: number): boolean {
  const centro = centroCasilla(c, f);
  return Math.abs(x - centro.x) / 32 + Math.abs(y - centro.y) / 16 <= 1 + 1e-9;
}

function cubierto(x: number, y: number, columnas: number, filas: number): boolean {
  const f0 = Math.floor((y - 16) / 16);
  for (let f = Math.max(0, f0 - 2); f <= Math.min(filas - 1, f0 + 2); f++) {
    const c0 = Math.floor((x - 32 - (f & 1) * 32) / 64);
    for (let c = Math.max(0, c0 - 1); c <= Math.min(columnas - 1, c0 + 1); c++) {
      if (dentroDeCasilla(x, y, c, f)) return true;
    }
  }
  return false;
}

describe('disposición escalonada', () => {
  it('posiciona las casillas con filas impares desplazadas medio rombo', () => {
    expect(posicionCasilla(0, 0)).toEqual({ x: 32, y: 0 });
    expect(posicionCasilla(1, 0)).toEqual({ x: 96, y: 0 });
    expect(posicionCasilla(0, 1)).toEqual({ x: 64, y: 16 });
    expect(posicionCasilla(0, 2)).toEqual({ x: 32, y: 32 });
    expect(centroCasilla(0, 0)).toEqual({ x: 32, y: 16 });
  });

  it('la zona cubierta de 64 columnas x 256 filas es de 4064 x 4080 px', () => {
    const z = zonaCubierta(64, 256);
    expect(z).toEqual({ izq: 32, arr: 16, der: 4096, aba: 4096 });
    expect(z.der - z.izq).toBe(4064);
    expect(z.aba - z.arr).toBe(4080);
  });

  it('la zona cubierta no tiene NINGÚN hueco (muestreo de 40.000 puntos por mapa)', () => {
    const azar = crearAleatorio(77);
    for (const [columnas, filas] of [[64, 256], [10, 7], [5, 40]] as const) {
      const z = zonaCubierta(columnas, filas);
      let huecos = 0;
      for (let i = 0; i < 40000; i++) {
        const x = z.izq + azar() * (z.der - z.izq);
        const y = z.arr + azar() * (z.aba - z.arr);
        if (!cubierto(x, y, columnas, filas)) huecos++;
      }
      expect(huecos).toBe(0);
    }
  });

  it('justo fuera de la zona sí hay huecos (la zona es realmente el máximo)', () => {
    const z = zonaCubierta(64, 256);
    const azar = crearAleatorio(5);
    let huecos = 0;
    for (let i = 0; i < 4000; i++) {
      if (!cubierto(z.izq - 1 - azar() * 10, z.arr + azar() * 1000, 64, 256)) huecos++;
    }
    expect(huecos).toBeGreaterThan(500);
  });

  it('coordenadasSuelo convierte de forma coherente con la proyección isométrica', () => {
    // Una casilla del suelo (gx, gy) se proyecta a x = (gx-gy)*32, y = (gx+gy)*16.
    const s = coordenadasSuelo((3 - 1) * 32, (3 + 1) * 16);
    expect(s.x).toBeCloseTo(3, 9);
    expect(s.y).toBeCloseTo(1, 9);
  });

  it('los vecinos por arista están a (±32, ±16) del centro y la relación es simétrica', () => {
    const columnas = 9;
    const filas = 12;
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        const a = centroCasilla(c, f);
        for (const [vc, vf] of vecinosArista(c, f, columnas, filas)) {
          const b = centroCasilla(vc, vf);
          expect(Math.abs(b.x - a.x)).toBe(32);
          expect(Math.abs(b.y - a.y)).toBe(16);
          const reciprocos = vecinosArista(vc, vf, columnas, filas).some(([rc, rf]) => rc === c && rf === f);
          expect(reciprocos).toBe(true);
        }
      }
    }
  });

  it('las casillas interiores tienen 4 vecinos y las esquinas menos', () => {
    expect(vecinosArista(4, 5, 9, 12)).toHaveLength(4);
    expect(vecinosArista(0, 0, 9, 12).length).toBeLessThan(4);
  });

  it('construirVecinos coincide con vecinosArista', () => {
    const columnas = 6;
    const filas = 9;
    const tabla = construirVecinos(columnas, filas);
    expect(tabla).toHaveLength(columnas * filas * 4);
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        const esperado = vecinosArista(c, f, columnas, filas).map(([vc, vf]) => vf * columnas + vc);
        const real = Array.from(tabla.slice((f * columnas + c) * 4, (f * columnas + c) * 4 + 4)).filter((v) => v >= 0);
        expect(real).toEqual(esperado);
      }
    }
  });
});
