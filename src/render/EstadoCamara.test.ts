import { describe, expect, it } from 'vitest';
import { EstadoCamara } from './EstadoCamara';

const GRANDE = { mundo: { izq: -5000, der: 5000, arr: -5000, aba: 5000 }, zoomMin: 0.4, zoomMax: 3 };

describe('EstadoCamara', () => {
  it('empieza centrada en el mundo con el zoom pedido (limitado)', () => {
    const c = new EstadoCamara(360, 728, GRANDE, 1);
    expect(c.cx).toBe(0);
    expect(c.cy).toBe(0);
    expect(c.zoom).toBe(1);
    expect(new EstadoCamara(360, 728, GRANDE, 99).zoom).toBe(3);
  });

  it('la vista del mundo mide pantalla / zoom', () => {
    const c = new EstadoCamara(360, 728, GRANDE, 2);
    const v = c.vista();
    expect(v.der - v.izq).toBeCloseTo(180, 6);
    expect(v.aba - v.arr).toBeCloseTo(364, 6);
  });

  it('arrastrar mueve el mundo con el dedo (dedo a la derecha = cámara a la izquierda)', () => {
    const c = new EstadoCamara(360, 728, GRANDE, 2);
    c.arrastrar(100, -40);
    expect(c.cx).toBeCloseTo(-50, 6);
    expect(c.cy).toBeCloseTo(20, 6);
  });

  it('el zoom con pellizco mantiene fijo el punto bajo los dedos', () => {
    const c = new EstadoCamara(360, 728, GRANDE, 1);
    c.arrastrar(-37, 55);
    const antes = c.mundoDesdePantalla(250, 500);
    c.zoomHacia(2.4, 250, 500);
    const despues = c.mundoDesdePantalla(250, 500);
    expect(c.zoom).toBeCloseTo(2.4, 6);
    expect(despues.x).toBeCloseTo(antes.x, 6);
    expect(despues.y).toBeCloseTo(antes.y, 6);
  });

  it('anclar deja el punto del mundo exactamente bajo el píxel indicado', () => {
    const c = new EstadoCamara(360, 728, GRANDE, 1.5);
    c.anclar({ x: 321, y: -123 }, 100, 200);
    const p = c.mundoDesdePantalla(100, 200);
    expect(p.x).toBeCloseTo(321, 6);
    expect(p.y).toBeCloseTo(-123, 6);
  });

  it('el zoom queda limitado entre mínimo y máximo', () => {
    const c = new EstadoCamara(360, 728, GRANDE, 1);
    c.zoomHacia(0.01, 180, 364);
    expect(c.zoom).toBe(0.4);
    c.zoomHacia(100, 180, 364);
    expect(c.zoom).toBe(3);
  });

  it('el centro no sale de los límites del mundo', () => {
    const c = new EstadoCamara(360, 728, { mundo: { izq: -100, der: 100, arr: 0, aba: 200 }, zoomMin: 0.5, zoomMax: 3 }, 1);
    c.arrastrar(-100000, -100000);
    expect(c.cx).toBe(100);
    expect(c.cy).toBe(200);
    c.arrastrar(100000, 100000);
    expect(c.cx).toBe(-100);
    expect(c.cy).toBe(0);
  });

  it('redimensionar conserva el centro y el zoom', () => {
    const c = new EstadoCamara(360, 728, GRANDE, 1.2);
    c.arrastrar(10, 20);
    const { cx, cy } = c;
    c.redimensionar(728, 360);
    expect(c.cx).toBe(cx);
    expect(c.cy).toBe(cy);
    expect(c.zoom).toBe(1.2);
    expect(c.ancho).toBe(728);
  });
});
