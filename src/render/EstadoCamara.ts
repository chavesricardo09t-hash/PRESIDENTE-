// Modelo de la cámara (puro, sin Phaser): centro en el mundo + zoom + tamaño de pantalla.
// Relación pantalla <-> mundo:  mundo = centro + (pantalla - tamaño/2) / zoom

import type { Punto, RectMundo } from './iso';

export interface LimitesCamara {
  /** El centro de la cámara se mantiene dentro de este rectángulo. */
  mundo: RectMundo;
  zoomMin: number;
  zoomMax: number;
}

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

export class EstadoCamara {
  cx: number;
  cy: number;
  zoom: number;

  constructor(
    public ancho: number,
    public alto: number,
    private readonly limites: LimitesCamara,
    zoomInicial = 1,
  ) {
    this.cx = (limites.mundo.izq + limites.mundo.der) / 2;
    this.cy = (limites.mundo.arr + limites.mundo.aba) / 2;
    this.zoom = limitar(zoomInicial, limites.zoomMin, limites.zoomMax);
  }

  redimensionar(ancho: number, alto: number): void {
    this.ancho = ancho;
    this.alto = alto;
  }

  mundoDesdePantalla(sx: number, sy: number): Punto {
    return { x: this.cx + (sx - this.ancho / 2) / this.zoom, y: this.cy + (sy - this.alto / 2) / this.zoom };
  }

  /** Arrastre en píxeles de pantalla: el mundo sigue al dedo. */
  arrastrar(dx: number, dy: number): void {
    this.cx -= dx / this.zoom;
    this.cy -= dy / this.zoom;
    this.limitarCentro();
  }

  fijarZoom(zoom: number): void {
    this.zoom = limitar(zoom, this.limites.zoomMin, this.limites.zoomMax);
  }

  /** Mueve la cámara para que `punto` del mundo quede bajo el píxel (sx, sy). */
  anclar(punto: Punto, sx: number, sy: number): void {
    this.cx = punto.x - (sx - this.ancho / 2) / this.zoom;
    this.cy = punto.y - (sy - this.alto / 2) / this.zoom;
    this.limitarCentro();
  }

  /** Zoom manteniendo fijo el punto del mundo que está bajo (sx, sy). */
  zoomHacia(zoom: number, sx: number, sy: number): void {
    const punto = this.mundoDesdePantalla(sx, sy);
    this.fijarZoom(zoom);
    this.anclar(punto, sx, sy);
  }

  vista(): RectMundo {
    const mitadAncho = this.ancho / this.zoom / 2;
    const mitadAlto = this.alto / this.zoom / 2;
    return { izq: this.cx - mitadAncho, der: this.cx + mitadAncho, arr: this.cy - mitadAlto, aba: this.cy + mitadAlto };
  }

  private limitarCentro(): void {
    const m = this.limites.mundo;
    this.cx = limitar(this.cx, m.izq, m.der);
    this.cy = limitar(this.cy, m.arr, m.aba);
  }
}
