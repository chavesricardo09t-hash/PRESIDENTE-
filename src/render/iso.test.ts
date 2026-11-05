import { describe, expect, it } from 'vitest';
import { crearAleatorio } from '../world/ruido';
import {
  FRAME_ALTO,
  FRAME_ANCHO,
  MARGEN_CACHE,
  calcularRangoVisible,
  expandir,
  gridAMundo,
  limitesMundo,
  mundoAGrid,
  rangoVacio,
  tileVisible,
  vistaDentro,
} from './iso';

describe('geometría isométrica', () => {
  it('convierte casillas conocidas', () => {
    expect(gridAMundo(0, 0)).toEqual({ x: 0, y: 0 });
    expect(gridAMundo(1, 0)).toEqual({ x: 32, y: 16 });
    expect(gridAMundo(0, 1)).toEqual({ x: -32, y: 16 });
    expect(gridAMundo(1, 1)).toEqual({ x: 0, y: 32 });
  });

  it('mundoAGrid invierte a gridAMundo', () => {
    const azar = crearAleatorio(11);
    for (let i = 0; i < 200; i++) {
      const gx = azar() * 200 - 20;
      const gy = azar() * 200 - 20;
      const w = gridAMundo(gx, gy);
      const g = mundoAGrid(w.x, w.y);
      expect(g.x).toBeCloseTo(gx, 6);
      expect(g.y).toBeCloseTo(gy, 6);
    }
  });

  it('tileVisible detecta tiles dentro y fuera de la vista', () => {
    const vista = { izq: 0, arr: 0, der: 300, aba: 300 };
    expect(tileVisible(150, 150, vista)).toBe(true);
    expect(tileVisible(1000, 150, vista)).toBe(false);
    expect(tileVisible(150, -200, vista)).toBe(false);
    // Un tile cuyo borde de dibujo roza la vista cuenta como visible.
    expect(tileVisible(-30, 100, vista)).toBe(true);
    expect(tileVisible(-40, 100, vista)).toBe(false);
  });

  it('calcularRangoVisible nunca omite un tile visible (vistas aleatorias y extremas)', () => {
    const ancho = 64;
    const alto = 48;
    const mundo = limitesMundo(ancho, alto);
    const azar = crearAleatorio(2026);
    let omitidos = 0;
    let visiblesTotales = 0;
    for (let n = 0; n < 150; n++) {
      const w = 80 + azar() * 900;
      const h = 80 + azar() * 1200;
      const izq = mundo.izq - 100 + azar() * (mundo.der - mundo.izq + 200 - w);
      const arr = mundo.arr - 100 + azar() * (mundo.aba - mundo.arr + 200 - h);
      const vista = { izq, arr, der: izq + w, aba: arr + h };
      const rango = calcularRangoVisible(vista, ancho, alto);
      for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
          const p = gridAMundo(x, y);
          if (!tileVisible(p.x, p.y, vista)) continue;
          visiblesTotales++;
          const dentro = x >= rango.minX && x <= rango.maxX && y >= rango.minY && y <= rango.maxY;
          if (!dentro) omitidos++;
        }
      }
    }
    expect(visiblesTotales).toBeGreaterThan(1000);
    expect(omitidos).toBe(0);
  });

  it('el rango es eficiente con vistas de teléfono y el margen de caché real (razón medida ~3,0-3,4)', () => {
    const ancho = 128;
    const alto = 128;
    const mundo = limitesMundo(ancho, alto);
    const azar = crearAleatorio(5);
    for (const zoom of [0.4, 1, 3]) {
      const w = 360 / zoom;
      const h = 728 / zoom;
      for (let i = 0; i < 40; i++) {
        const cx = (azar() - 0.5) * (mundo.der - mundo.izq) * 0.3;
        const cy = (mundo.arr + mundo.aba) / 2 + (azar() - 0.5) * (mundo.aba - mundo.arr) * 0.3;
        const vista = expandir({ izq: cx - w / 2, der: cx + w / 2, arr: cy - h / 2, aba: cy + h / 2 }, MARGEN_CACHE);
        const rango = calcularRangoVisible(vista, ancho, alto);
        let visibles = 0;
        for (let y = rango.minY; y <= rango.maxY; y++) {
          for (let x = rango.minX; x <= rango.maxX; x++) {
            const p = gridAMundo(x, y);
            if (tileVisible(p.x, p.y, vista)) visibles++;
          }
        }
        const area = (rango.maxX - rango.minX + 1) * (rango.maxY - rango.minY + 1);
        expect(visibles).toBeGreaterThan(0);
        expect(area / visibles).toBeLessThan(4);
      }
    }
  });

  it('devuelve un rango vacío si la vista está fuera del mapa', () => {
    const r = calcularRangoVisible({ izq: 50000, arr: 50000, der: 50400, aba: 50400 }, 64, 48);
    expect(rangoVacio(r)).toBe(true);
  });

  it('vistaDentro y expandir se comportan como se espera', () => {
    const v = { izq: 10, arr: 10, der: 20, aba: 20 };
    const e = expandir(v, 5);
    expect(e).toEqual({ izq: 5, arr: 5, der: 25, aba: 25 });
    expect(vistaDentro(v, e)).toBe(true);
    expect(vistaDentro(e, v)).toBe(false);
  });

  it('limitesMundo contiene el vértice superior de todas las casillas', () => {
    const ancho = 10;
    const alto = 7;
    const l = limitesMundo(ancho, alto);
    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        const p = gridAMundo(x, y);
        expect(p.x).toBeGreaterThanOrEqual(l.izq);
        expect(p.x).toBeLessThanOrEqual(l.der);
        expect(p.y).toBeGreaterThanOrEqual(l.arr);
        expect(p.y).toBeLessThanOrEqual(l.aba);
      }
    }
  });

  it('las dimensiones del cuadro son coherentes con el rombo de 64x32', () => {
    expect(FRAME_ANCHO).toBeGreaterThanOrEqual(64);
    expect(FRAME_ALTO).toBeGreaterThanOrEqual(32);
  });
});
