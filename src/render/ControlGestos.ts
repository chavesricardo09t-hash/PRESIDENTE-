import Phaser from 'phaser';
import type { EstadoCamara } from './EstadoCamara';

interface Marca {
  x: number;
  y: number;
}

/**
 * Gestos de la cámara: un dedo arrastra, dos dedos hacen pellizco (zoom + desplazamiento).
 * La rueda del ratón también hace zoom (útil si se prueba en un ordenador).
 * Aún no hay selección de casillas: eso pertenece a la siguiente entrega.
 */
export class ControlGestos {
  private firma = '';
  private previas = new Map<number, Marca>();
  private distanciaPrevia = 0;
  private medioPrevio: Marca = { x: 0, y: 0 };

  constructor(
    private readonly escena: Phaser.Scene,
    private readonly camara: EstadoCamara,
  ) {
    escena.input.addPointer(2);
    escena.input.on('wheel', (puntero: Phaser.Input.Pointer, _objetos: unknown, _dx: number, dy: number) => {
      const factor = dy > 0 ? 0.9 : 1.1;
      this.camara.zoomHacia(this.camara.zoom * factor, puntero.x, puntero.y);
    });
  }

  private punterosActivos(): Phaser.Input.Pointer[] {
    const gestor = this.escena.input.manager;
    const lista: Phaser.Input.Pointer[] = gestor.pointers.filter((p) => p.isDown);
    const raton = gestor.mousePointer as Phaser.Input.Pointer | null | undefined;
    if (raton && raton.isDown) lista.push(raton);
    return lista;
  }

  private reiniciarReferencias(activos: Phaser.Input.Pointer[]): void {
    this.previas.clear();
    for (const p of activos) this.previas.set(p.id, { x: p.x, y: p.y });
    const a = activos[0];
    const b = activos[1];
    if (a && b) {
      this.distanciaPrevia = Math.hypot(a.x - b.x, a.y - b.y);
      this.medioPrevio = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    } else {
      this.distanciaPrevia = 0;
    }
  }

  /** Llamar una vez por fotograma. */
  actualizar(): void {
    const activos = this.punterosActivos();
    const firma = activos.map((p) => p.id).join(',');
    if (firma !== this.firma) {
      this.firma = firma;
      this.reiniciarReferencias(activos);
      return;
    }

    if (activos.length === 1) {
      const p = activos[0] as Phaser.Input.Pointer;
      const previa = this.previas.get(p.id);
      if (previa) {
        const dx = p.x - previa.x;
        const dy = p.y - previa.y;
        if (dx !== 0 || dy !== 0) this.camara.arrastrar(dx, dy);
      }
      this.previas.set(p.id, { x: p.x, y: p.y });
    } else if (activos.length >= 2) {
      const a = activos[0] as Phaser.Input.Pointer;
      const b = activos[1] as Phaser.Input.Pointer;
      const distancia = Math.hypot(a.x - b.x, a.y - b.y);
      const medio = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (this.distanciaPrevia > 4 && distancia > 4) {
        const punto = this.camara.mundoDesdePantalla(this.medioPrevio.x, this.medioPrevio.y);
        this.camara.fijarZoom(this.camara.zoom * (distancia / this.distanciaPrevia));
        this.camara.anclar(punto, medio.x, medio.y);
      }
      this.distanciaPrevia = distancia;
      this.medioPrevio = medio;
    }
  }
}
