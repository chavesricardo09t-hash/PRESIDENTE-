import { describe, expect, it } from 'vitest';
import { MedidorFps } from './MedidorFps';

function alimentar(m: MedidorFps, intervaloMs: number, segundos: number, inicio = 1000): number {
  let t = inicio;
  const fin = inicio + segundos * 1000;
  while (t <= fin) {
    m.registrar(t);
    t += intervaloMs;
  }
  return t;
}

describe('MedidorFps', () => {
  it('mide ~60 FPS con intervalos de 16,67 ms', () => {
    const m = new MedidorFps();
    alimentar(m, 1000 / 60, 6);
    const r = m.resumen();
    expect(r.actual).toBeCloseTo(60, 0);
    expect(r.promedio5s).toBeCloseTo(60, 0);
    expect(r.minimo5s).toBeGreaterThan(58);
    expect(r.fotogramasLargos).toBe(0);
  });

  it('mide ~30 FPS con intervalos de 33,3 ms', () => {
    const m = new MedidorFps();
    alimentar(m, 1000 / 30, 6);
    expect(m.resumen().promedio5s).toBeCloseTo(30, 0);
  });

  it('el mínimo refleja una caída y detecta fotogramas largos', () => {
    const m = new MedidorFps();
    let t = alimentar(m, 1000 / 60, 3);
    t = alimentar(m, 100, 1.5, t); // caída a ~10 FPS
    alimentar(m, 1000 / 60, 2, t);
    const r = m.resumen();
    expect(r.minimo5s).toBeLessThan(20);
    expect(r.fotogramasLargos).toBeGreaterThan(5);
    expect(r.promedio5s).toBeGreaterThan(r.minimo5s);
  });

  it('sin datos devuelve ceros y reiniciar limpia todo', () => {
    const m = new MedidorFps();
    expect(m.resumen().actual).toBe(0);
    expect(m.resumen().segundos).toBe(0);
    alimentar(m, 16.7, 3);
    expect(m.resumen().fotogramas).toBeGreaterThan(100);
    m.reiniciar();
    expect(m.resumen().fotogramas).toBe(0);
    expect(m.resumen().actual).toBe(0);
  });

  it('el calentamiento no cuenta en el mínimo y promedio totales', () => {
    const m = new MedidorFps(500, 50, 2);
    let t = alimentar(m, 200, 1); // ventanas lentas iniciales (calentamiento)
    alimentar(m, 1000 / 60, 4, t);
    const r = m.resumen();
    expect(r.minimoTotal).toBeGreaterThan(50);
    expect(r.promedioTotal).toBeCloseTo(60, 0);
    expect(r.segundos).toBeGreaterThan(4.9);
  });
});
