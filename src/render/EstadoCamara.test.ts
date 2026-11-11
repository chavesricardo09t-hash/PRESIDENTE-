import { describe, expect, it } from 'vitest';
import { zonaCubierta } from '../world/disposicion';
import { crearAleatorio } from '../world/ruido';
import { EstadoCamara } from './EstadoCamara';

const ZONA = zonaCubierta(64, 256); // 4064 x 4080
const LIMITES = { zona: ZONA, zoomMin: 0.2, zoomMax: 3 };
const EPS = 1e-6;

function vistaDentroDeZona(c: EstadoCamara): boolean {
  const v = c.vista();
  return v.izq >= ZONA.izq - EPS && v.der <= ZONA.der + EPS && v.arr >= ZONA.arr - EPS && v.aba <= ZONA.aba + EPS;
}

describe('EstadoCamara con zona rectangular', () => {
  it('empieza centrada en la zona con el zoom pedido', () => {
    const c = new EstadoCamara(360, 728, LIMITES, 1);
    expect(c.cx).toBe((ZONA.izq + ZONA.der) / 2);
    expect(c.cy).toBe((ZONA.arr + ZONA.aba) / 2);
    expect(c.zoom).toBe(1);
  });

  it('el zoom mínimo efectivo depende de la pantalla (valores calculados en el plan)', () => {
    expect(new EstadoCamara(360, 728, LIMITES).zoomMinimo()).toBeCloseTo(0.2, 6);
    expect(new EstadoCamara(412, 915, LIMITES).zoomMinimo()).toBeCloseTo(0.2243, 3);
    expect(new EstadoCamara(390, 844, LIMITES).zoomMinimo()).toBeCloseTo(0.2069, 3);
    expect(new EstadoCamara(728, 360, LIMITES).zoomMinimo()).toBeCloseTo(0.2, 6);
    expect(new EstadoCamara(800, 1280, LIMITES).zoomMinimo()).toBeCloseTo(0.3137, 3);
    expect(new EstadoCamara(1024, 768, LIMITES).zoomMinimo()).toBeCloseTo(0.2520, 3);
  });

  it('el zoom queda limitado entre el mínimo efectivo y 3', () => {
    const c = new EstadoCamara(412, 915, LIMITES, 1);
    c.zoomHacia(0.01, 200, 400);
    expect(c.zoom).toBeCloseTo(c.zoomMinimo(), 9);
    expect(c.zoom).toBeGreaterThan(0.2);
    c.zoomHacia(100, 200, 400);
    expect(c.zoom).toBe(3);
  });

  it('con zoom mínimo la vista cabe exactamente y nunca se ve vacío', () => {
    const c = new EstadoCamara(360, 728, LIMITES, 0.2);
    expect(vistaDentroDeZona(c)).toBe(true);
    const v = c.vista();
    expect(v.der - v.izq).toBeCloseTo(1800, 6);
    expect(v.aba - v.arr).toBeCloseTo(3640, 6);
  });

  it('arrastrar hasta el tope deja la vista pegada al borde, sin salir', () => {
    const c = new EstadoCamara(360, 728, LIMITES, 1);
    c.arrastrar(-1e9, -1e9);
    expect(vistaDentroDeZona(c)).toBe(true);
    expect(c.vista().der).toBeCloseTo(ZONA.der, 6);
    expect(c.vista().aba).toBeCloseTo(ZONA.aba, 6);
    c.arrastrar(1e9, 1e9);
    expect(vistaDentroDeZona(c)).toBe(true);
    expect(c.vista().izq).toBeCloseTo(ZONA.izq, 6);
    expect(c.vista().arr).toBeCloseTo(ZONA.arr, 6);
  });

  it('arrastrar mueve el mundo con el dedo (dedo a la derecha = cámara a la izquierda)', () => {
    const c = new EstadoCamara(360, 728, LIMITES, 2);
    const { cx, cy } = c;
    c.arrastrar(100, -40);
    expect(c.cx).toBeCloseTo(cx - 50, 6);
    expect(c.cy).toBeCloseTo(cy + 20, 6);
  });

  it('el zoom con pellizco mantiene fijo el punto bajo los dedos (lejos de los bordes)', () => {
    const c = new EstadoCamara(360, 728, LIMITES, 1);
    c.arrastrar(-37, 55);
    const antes = c.mundoDesdePantalla(250, 500);
    c.zoomHacia(2.4, 250, 500);
    const despues = c.mundoDesdePantalla(250, 500);
    expect(c.zoom).toBeCloseTo(2.4, 6);
    expect(despues.x).toBeCloseTo(antes.x, 6);
    expect(despues.y).toBeCloseTo(antes.y, 6);
  });

  it('anclar deja el punto del mundo exactamente bajo el píxel indicado (lejos de los bordes)', () => {
    const c = new EstadoCamara(360, 728, LIMITES, 1.5);
    c.anclar({ x: 2100, y: 1900 }, 100, 200);
    const p = c.mundoDesdePantalla(100, 200);
    expect(p.x).toBeCloseTo(2100, 6);
    expect(p.y).toBeCloseTo(1900, 6);
  });

  it('girar la pantalla reajusta el zoom y mantiene la vista dentro de la zona', () => {
    const c = new EstadoCamara(360, 728, LIMITES, 0.2);
    c.redimensionar(800, 1280); // pasa a una pantalla mayor: el mínimo efectivo sube
    expect(c.zoom).toBeGreaterThanOrEqual(0.3137 - 1e-3);
    expect(vistaDentroDeZona(c)).toBe(true);
    c.redimensionar(728, 360); // horizontal
    expect(vistaDentroDeZona(c)).toBe(true);
    c.redimensionar(360, 728); // vertical otra vez
    expect(vistaDentroDeZona(c)).toBe(true);
  });

  it('PROPIEDAD: con operaciones aleatorias en 8 pantallas la vista NUNCA sale de la zona', () => {
    const azar = crearAleatorio(31337);
    const pantallas = [[360, 728], [412, 915], [390, 844], [728, 360], [915, 412], [800, 1280], [1024, 768], [320, 568]] as const;
    let comprobaciones = 0;
    for (const [w, h] of pantallas) {
      const c = new EstadoCamara(w, h, LIMITES, 1);
      for (let i = 0; i < 400; i++) {
        const op = Math.floor(azar() * 5);
        if (op === 0) c.arrastrar((azar() - 0.5) * 3000, (azar() - 0.5) * 3000);
        else if (op === 1) c.zoomHacia(0.05 + azar() * 4, azar() * w, azar() * h);
        else if (op === 2) c.fijarZoom(0.05 + azar() * 4);
        else if (op === 3) c.anclar({ x: azar() * 4200, y: azar() * 4200 }, azar() * w, azar() * h);
        else c.redimensionar(azar() < 0.5 ? w : h, azar() < 0.5 ? h : w);
        expect(vistaDentroDeZona(c)).toBe(true);
        expect(c.zoom).toBeGreaterThanOrEqual(c.zoomMinimo() - 1e-9);
        expect(c.zoom).toBeLessThanOrEqual(3);
        comprobaciones++;
      }
    }
    expect(comprobaciones).toBe(3200);
  });

  it('en un mundo diminuto (vista mayor que la zona) se centra en lugar de fallar', () => {
    const c = new EstadoCamara(360, 728, { zona: { izq: 0, arr: 0, der: 100, aba: 100 }, zoomMin: 0.2, zoomMax: 3 }, 1);
    c.arrastrar(500, 500);
    expect(c.cx).toBe(50);
    expect(c.cy).toBe(50);
    expect(c.zoom).toBe(3);
  });
});
