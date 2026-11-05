// Medidor de FPS basado en marcas de tiempo reales (no en el delta suavizado de Phaser).

export interface ResumenFps {
  /** FPS de la última ventana de medición. */
  actual: number;
  promedio5s: number;
  minimo5s: number;
  /** Promedio y mínimo desde el inicio, sin contar el calentamiento. */
  promedioTotal: number;
  minimoTotal: number;
  fotogramas: number;
  /** Fotogramas cuyo intervalo superó el umbral (por defecto 50 ms). */
  fotogramasLargos: number;
  segundos: number;
}

export class MedidorFps {
  private ultimo: number | null = null;
  private inicio = 0;
  private inicioVentana = 0;
  private cuentaVentana = 0;
  private historial: number[] = [];
  private actualFps = 0;
  private fotogramas = 0;
  private largos = 0;
  private ventanasContadas = 0;
  private sumaTotal = 0;
  private minTotal = Infinity;
  private ultimaMarca = 0;

  constructor(
    private readonly ventanaMs = 500,
    private readonly umbralLargoMs = 50,
    private readonly ventanasCalentamiento = 2,
  ) {}

  registrar(ahoraMs: number): void {
    this.ultimaMarca = ahoraMs;
    if (this.ultimo === null) {
      this.ultimo = ahoraMs;
      this.inicio = ahoraMs;
      this.inicioVentana = ahoraMs;
      return;
    }
    const intervalo = ahoraMs - this.ultimo;
    this.ultimo = ahoraMs;
    this.fotogramas++;
    this.cuentaVentana++;
    if (intervalo > this.umbralLargoMs) this.largos++;

    const transcurrido = ahoraMs - this.inicioVentana;
    if (transcurrido >= this.ventanaMs) {
      const fps = (this.cuentaVentana * 1000) / transcurrido;
      this.actualFps = fps;
      this.historial.push(fps);
      const maximo = Math.ceil(5000 / this.ventanaMs);
      if (this.historial.length > maximo) this.historial.shift();
      this.ventanasContadas++;
      if (this.ventanasContadas > this.ventanasCalentamiento) {
        this.sumaTotal += fps;
        this.minTotal = Math.min(this.minTotal, fps);
      }
      this.inicioVentana = ahoraMs;
      this.cuentaVentana = 0;
    }
  }

  reiniciar(): void {
    this.ultimo = null;
    this.historial = [];
    this.actualFps = 0;
    this.fotogramas = 0;
    this.largos = 0;
    this.ventanasContadas = 0;
    this.sumaTotal = 0;
    this.minTotal = Infinity;
    this.cuentaVentana = 0;
  }

  resumen(): ResumenFps {
    const h = this.historial;
    const suma = h.reduce((a, b) => a + b, 0);
    const utiles = Math.max(0, this.ventanasContadas - this.ventanasCalentamiento);
    return {
      actual: this.actualFps,
      promedio5s: h.length ? suma / h.length : 0,
      minimo5s: h.length ? Math.min(...h) : 0,
      promedioTotal: utiles ? this.sumaTotal / utiles : 0,
      minimoTotal: utiles ? this.minTotal : 0,
      fotogramas: this.fotogramas,
      fotogramasLargos: this.largos,
      segundos: this.ultimo === null ? 0 : (this.ultimaMarca - this.inicio) / 1000,
    };
  }
}
