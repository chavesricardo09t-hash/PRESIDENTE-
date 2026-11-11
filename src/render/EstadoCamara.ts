// Modelo de la cámara (puro, sin Phaser): centro en el mundo + zoom + tamaño de pantalla.
// Relación pantalla <-> mundo:  mundo = centro + (pantalla - tamaño/2) / zoom
//
// Garantía: tras CUALQUIER operación, los bordes de la VISTA quedan dentro de la zona cubierta,
// por lo que nunca se ve espacio vacío. Para ello el zoom mínimo se ajusta a la pantalla:
//   zoomMinimo = max(zoomMin nominal, ancho_pantalla / ancho_zona, alto_pantalla / alto_zona)

import type { Punto, RectMundo } from './iso';

export interface LimitesCamara {
  /** Zona totalmente cubierta del mundo (sin huecos). La vista no puede salir de ella. */
  zona: RectMundo;
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
    this.cx = (limites.zona.izq + limites.zona.der) / 2;
    this.cy = (limites.zona.arr + limites.zona.aba) / 2;
    this.zoom = 1;
    this.fijarZoom(zoomInicial);
  }

  /** Zoom mínimo efectivo para la pantalla actual (>= el nominal). */
  zoomMinimo(): number {
    const z = this.limites.zona;
    const necesario = Math.max(this.ancho / (z.der - z.izq), this.alto / (z.aba - z.arr)) * (1 + 1e-9);
    return Math.min(this.limites.zoomMax, Math.max(this.limites.zoomMin, necesario));
  }

  zoomMaximo(): number {
    return this.limites.zoomMax;
  }

  /** Cambio de tamaño o de orientación de la pantalla: se reajusta el zoom y se vuelve a limitar. */
  redimensionar(ancho: number, alto: number): void {
    this.ancho = ancho;
    this.alto = alto;
    this.fijarZoom(this.zoom);
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
    this.zoom = limitar(zoom, this.zoomMinimo(), this.limites.zoomMax);
    this.limitarCentro();
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
    const z = this.limites.zona;
    const mitadAncho = this.ancho / this.zoom / 2;
    const mitadAlto = this.alto / this.zoom / 2;
    this.cx = this.limitarEje(this.cx, z.izq + mitadAncho, z.der - mitadAncho, (z.izq + z.der) / 2);
    this.cy = this.limitarEje(this.cy, z.arr + mitadAlto, z.aba - mitadAlto, (z.arr + z.aba) / 2);
  }

  /** Si la vista fuera mayor que la zona (caso imposible salvo mundos diminutos), se centra. */
  private limitarEje(valor: number, minimo: number, maximo: number, medio: number): number {
    return minimo > maximo ? medio : limitar(valor, minimo, maximo);
  }
}
