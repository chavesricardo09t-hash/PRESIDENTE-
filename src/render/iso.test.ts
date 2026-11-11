import { describe, expect, it } from 'vitest';
import { posicionCasilla, zonaCubierta } from '../world/disposicion';
import { crearAleatorio } from '../world/ruido';
import {
  FRAME_ALTO,
  FRAME_ANCHO,
  MARGEN_CACHE,
  calcularRangoVisible,
  expandir,
  interseccion,
  margenCache,
  rangoVacio,
  segmentosRejilla,
  tileVisible,
  vistaDentro,
} from './iso';

describe('geometría de dibujo', () => {
  it('tileVisible detecta casillas dentro y fuera de la vista', () => {
    const vista = { izq: 0, arr: 0, der: 300, aba: 300 };
    expect(tileVisible(150, 150, vista)).toBe(true);
    expect(tileVisible(1000, 150, vista)).toBe(false);
    expect(tileVisible(150, -200, vista)).toBe(false);
    expect(tileVisible(-30, 100, vista)).toBe(true);
    expect(tileVisible(-40, 100, vista)).toBe(false);
  });

  it('calcularRangoVisible nunca omite una casilla visible (vistas aleatorias, también fuera del mapa)', () => {
    const azar = crearAleatorio(2026);
    let omitidos = 0;
    let visiblesTotales = 0;
    for (const [columnas, filas] of [[64, 256], [10, 7]] as const) {
      const zona = zonaCubierta(columnas, filas);
      for (let n = 0; n < 120; n++) {
        const w = 60 + azar() * 1900;
        const h = 60 + azar() * 3700;
        const izq = zona.izq - 200 + azar() * (zona.der - zona.izq + 400 - w);
        const arr = zona.arr - 200 + azar() * (zona.aba - zona.arr + 400 - h);
        const vista = { izq, arr, der: izq + w, aba: arr + h };
        const rango = calcularRangoVisible(vista, columnas, filas);
        for (let f = 0; f < filas; f++) {
          for (let c = 0; c < columnas; c++) {
            const p = posicionCasilla(c, f);
            if (!tileVisible(p.x, p.y, vista)) continue;
            visiblesTotales++;
            if (c < rango.minCol || c > rango.maxCol || f < rango.minFila || f > rango.maxFila) omitidos++;
          }
        }
      }
    }
    expect(visiblesTotales).toBeGreaterThan(5000);
    expect(omitidos).toBe(0);
  });

  it('el rango es casi exacto con vistas de teléfono (medido: peor caso 1,60 a zoom 3; antes con el rombo ~3,0)', () => {
    const columnas = 64;
    const filas = 256;
    const zona = zonaCubierta(columnas, filas);
    const azar = crearAleatorio(9);
    for (const zoom of [0.2, 0.4, 1, 3]) {
      for (let i = 0; i < 25; i++) {
        const w = 360 / zoom;
        const h = 728 / zoom;
        const cx = zona.izq + w / 2 + azar() * (zona.der - zona.izq - w);
        const cy = zona.arr + h / 2 + azar() * (zona.aba - zona.arr - h);
        const vista = expandir({ izq: cx - w / 2, der: cx + w / 2, arr: cy - h / 2, aba: cy + h / 2 }, margenCache(zoom));
        const rango = calcularRangoVisible(vista, columnas, filas);
        let visibles = 0;
        for (let f = rango.minFila; f <= rango.maxFila; f++) {
          for (let c = rango.minCol; c <= rango.maxCol; c++) {
            const p = posicionCasilla(c, f);
            if (tileVisible(p.x, p.y, vista)) visibles++;
          }
        }
        const explorados = (rango.maxCol - rango.minCol + 1) * (rango.maxFila - rango.minFila + 1);
        expect(visibles).toBeGreaterThan(0);
        expect(explorados / visibles).toBeLessThan(1.7);
      }
    }
  });

  it('devuelve un rango vacío si la vista está fuera del mapa', () => {
    expect(rangoVacio(calcularRangoVisible({ izq: 90000, arr: 90000, der: 90400, aba: 90400 }, 64, 256))).toBe(true);
    expect(rangoVacio(calcularRangoVisible({ izq: -90400, arr: -90400, der: -90000, aba: -90000 }, 64, 256))).toBe(true);
  });

  it('margenCache crece al alejar el zoom y nunca baja del mínimo', () => {
    expect(margenCache(3)).toBe(MARGEN_CACHE);
    expect(margenCache(1)).toBe(MARGEN_CACHE);
    expect(margenCache(0.2)).toBeGreaterThan(margenCache(0.4));
    expect(margenCache(0.2)).toBeCloseTo(240, 6);
  });

  it('vistaDentro, expandir e interseccion se comportan como se espera', () => {
    const v = { izq: 10, arr: 10, der: 20, aba: 20 };
    const e = expandir(v, 5);
    expect(e).toEqual({ izq: 5, arr: 5, der: 25, aba: 25 });
    expect(vistaDentro(v, e)).toBe(true);
    expect(vistaDentro(e, v)).toBe(false);
    expect(interseccion(v, e)).toEqual(v);
    expect(interseccion(v, { izq: 50, arr: 50, der: 60, aba: 60 })).toBe(null);
  });

  it('las dimensiones del cuadro son coherentes con el rombo de 64x32', () => {
    expect(FRAME_ANCHO).toBeGreaterThanOrEqual(64);
    expect(FRAME_ALTO).toBeGreaterThanOrEqual(32);
  });
});

describe('cuadrícula', () => {
  const rect = { izq: 100, arr: 200, der: 700, aba: 900 };

  it('todos los segmentos quedan dentro del rectángulo', () => {
    const s = segmentosRejilla(rect);
    expect(s.length).toBeGreaterThan(100);
    expect(s.length % 4).toBe(0);
    for (let i = 0; i < s.length; i += 2) {
      expect(s[i] as number).toBeGreaterThanOrEqual(rect.izq - 1e-6);
      expect(s[i] as number).toBeLessThanOrEqual(rect.der + 1e-6);
      expect(s[i + 1] as number).toBeGreaterThanOrEqual(rect.arr - 1e-6);
      expect(s[i + 1] as number).toBeLessThanOrEqual(rect.aba + 1e-6);
    }
  });

  it('las líneas pasan por los vértices de las casillas (pendiente ±1/2 y desfase 16 + 32j)', () => {
    const s = segmentosRejilla(rect);
    for (let i = 0; i < s.length; i += 4) {
      const [x1, y1, x2, y2] = [s[i], s[i + 1], s[i + 2], s[i + 3]] as [number, number, number, number];
      const pendiente = (y2 - y1) / (x2 - x1);
      if (Math.abs(pendiente - 0.5) < 1e-9) {
        const c = y1 - x1 / 2;
        expect(Math.abs(((c - 16) / 32) - Math.round((c - 16) / 32))).toBeLessThan(1e-9);
      } else {
        expect(pendiente).toBeCloseTo(-0.5, 9);
        const t = y1 + x1 / 2;
        expect(Math.abs(((t - 16) / 32) - Math.round((t - 16) / 32))).toBeLessThan(1e-9);
      }
    }
  });

  it('cada aristas de una casilla real está sobre alguna línea de la cuadrícula', () => {
    const s = segmentosRejilla({ izq: 0, arr: 0, der: 400, aba: 400 });
    const sobreLinea = (x: number, y: number): boolean => {
      for (let i = 0; i < s.length; i += 4) {
        const [x1, y1, x2, y2] = [s[i], s[i + 1], s[i + 2], s[i + 3]] as [number, number, number, number];
        const t = (x - x1) / (x2 - x1);
        if (t >= -1e-9 && t <= 1 + 1e-9 && Math.abs(y1 + t * (y2 - y1) - y) < 1e-6) return true;
      }
      return false;
    };
    for (let f = 4; f < 12; f++) {
      for (let c = 1; c < 4; c++) {
        const p = posicionCasilla(c, f);
        if (p.x + 32 > 400 || p.y + 32 > 400) continue;
        for (const [x, y] of [[p.x, p.y], [p.x + 32, p.y + 16], [p.x, p.y + 32], [p.x - 32, p.y + 16]] as const) {
          expect(sobreLinea(x, y)).toBe(true);
        }
      }
    }
  });

  it('un rectángulo vacío no produce segmentos', () => {
    expect(segmentosRejilla({ izq: 5, arr: 5, der: 5, aba: 9 })).toHaveLength(0);
  });
});
