import { describe, expect, it } from 'vitest';
import { construirInformeJuego } from './informe';

describe('informe de rendimiento', () => {
  it('incluye FPS, casillas, renderizador y datos extra', () => {
    const texto = construirInformeJuego(
      {
        fps: { actual: 58.04, promedio5s: 57.5, minimo5s: 41.2, promedioTotal: 56, minimoTotal: 38, fotogramas: 1200, fotogramasLargos: 3, segundos: 20.5 },
        zoom: 1,
        zoomMinimo: 0.2,
        tilesDibujados: 412,
        tilesReserva: 450,
        renderizador: 'WebGL',
        pantalla: '360×728',
      },
      { Versión: '0.1.0' },
    );
    expect(texto.includes('FPS actual: 58.0')).toBe(true);
    expect(texto.includes('FPS mínimo (5 s): 41.2')).toBe(true);
    expect(texto.includes('Casillas dibujadas: 412 (reserva 450)')).toBe(true);
    expect(texto.includes('Zoom mínimo efectivo: 0.200')).toBe(true);
    expect(texto.includes('Renderizador: WebGL')).toBe(true);
    expect(texto.includes('Versión: 0.1.0')).toBe(true);
    expect(texto.startsWith('PRESIDENTE')).toBe(true);
  });

  it('sin datos de rendimiento lo indica claramente', () => {
    const texto = construirInformeJuego(null, {});
    expect(texto.includes('sin datos todavía')).toBe(true);
  });
});
