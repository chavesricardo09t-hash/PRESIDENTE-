import { describe, expect, it } from 'vitest';
import { crearAleatorio, fbm, hash2, ruidoValor } from './ruido';

describe('ruido determinista', () => {
  it('hash2 es estable y está en [0, 1)', () => {
    expect(hash2(3, 5, 99)).toBe(hash2(3, 5, 99));
    for (let i = 0; i < 500; i++) {
      const v = hash2(i, i * 7 - 100, 12345);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('hash2 cambia con la semilla y las coordenadas', () => {
    expect(hash2(1, 2, 3)).not.toBe(hash2(1, 2, 4));
    expect(hash2(1, 2, 3)).not.toBe(hash2(2, 1, 3));
  });

  it('crearAleatorio repite la secuencia con la misma semilla', () => {
    const a = crearAleatorio(42);
    const b = crearAleatorio(42);
    const c = crearAleatorio(43);
    const sa = [a(), a(), a()];
    expect(sa).toEqual([b(), b(), b()]);
    expect(sa[0]).not.toBe(c());
  });

  it('ruidoValor y fbm quedan en [0, 1] y son continuos', () => {
    for (let i = 0; i < 300; i++) {
      const x = i * 0.37;
      const y = i * 0.21 - 20;
      const r = ruidoValor(x, y, 7);
      const f = fbm(x, y, 7, 4);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
    // Continuidad: un paso diminuto cambia muy poco el valor.
    expect(Math.abs(fbm(5.5, 5.5, 1) - fbm(5.5001, 5.5, 1))).toBeLessThan(0.01);
  });
});
