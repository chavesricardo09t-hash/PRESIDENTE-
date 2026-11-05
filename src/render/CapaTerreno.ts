import Phaser from 'phaser';
import type { MapaMundo } from '../world/mapa';
import { FRAMES_TOTALES, indiceFrame, nombreFrame } from './atlas';
import {
  MARGEN_CACHE,
  ORIGEN_X,
  ORIGEN_Y,
  calcularRangoVisible,
  expandir,
  gridAMundo,
  rangoVacio,
  tileVisible,
  vistaDentro,
} from './iso';
import type { RangoTiles, RectMundo } from './iso';
import { CLAVE_ATLAS } from './texturas';

const NOMBRES_FRAME: string[] = Array.from({ length: FRAMES_TOTALES }, (_, i) => nombreFrame(i));

/**
 * Dibuja SOLO las casillas de la zona visible (más un margen) usando una reserva de imágenes
 * reutilizables. Solo se reconstruye cuando la vista sale de la zona ya preparada.
 * Orden de pintor: las imágenes se asignan de atrás hacia adelante y se muestran en el
 * orden de creación, por lo que la profundidad es correcta sin ordenar cada fotograma.
 */
export class CapaTerreno {
  private readonly reserva: Phaser.GameObjects.Image[] = [];
  private readonly framesAsignados: string[] = [];
  private usadas = 0;
  private cache: RectMundo | null = null;
  private rango: RangoTiles | null = null;
  private readonly rejilla: Phaser.GameObjects.Graphics;
  private rejillaVisible = false;
  private zoomRejilla = 0;
  private ultimoZoom = 1;

  constructor(
    private readonly escena: Phaser.Scene,
    private readonly mapa: MapaMundo,
  ) {
    this.rejilla = escena.add.graphics();
    this.rejilla.setDepth(1);
    this.rejilla.setVisible(false);
  }

  get tilesDibujados(): number {
    return this.usadas;
  }

  get tilesReserva(): number {
    return this.reserva.length;
  }

  fijarRejilla(visible: boolean): void {
    this.rejillaVisible = visible;
    this.rejilla.setVisible(visible);
    if (visible) this.dibujarRejilla(this.ultimoZoom);
  }

  sincronizar(vista: RectMundo, zoom: number): void {
    this.ultimoZoom = zoom;
    if (!this.cache || !vistaDentro(vista, this.cache)) {
      this.reconstruir(vista, zoom);
      return;
    }
    if (this.rejillaVisible && Math.abs(zoom / this.zoomRejilla - 1) > 0.15) {
      this.dibujarRejilla(zoom);
    }
  }

  private obtener(k: number): Phaser.GameObjects.Image {
    let imagen = this.reserva[k];
    if (!imagen) {
      imagen = this.escena.add.image(0, 0, CLAVE_ATLAS, NOMBRES_FRAME[0]).setOrigin(ORIGEN_X, ORIGEN_Y);
      this.reserva.push(imagen);
      this.framesAsignados.push(NOMBRES_FRAME[0] as string);
    }
    return imagen;
  }

  private reconstruir(vista: RectMundo, zoom: number): void {
    const area = expandir(vista, MARGEN_CACHE);
    const rango = calcularRangoVisible(area, this.mapa.ancho, this.mapa.alto);
    const { ancho, terreno, variante } = this.mapa;
    let k = 0;

    if (!rangoVacio(rango)) {
      for (let d = rango.minX + rango.minY; d <= rango.maxX + rango.maxY; d++) {
        const x0 = Math.max(rango.minX, d - rango.maxY);
        const x1 = Math.min(rango.maxX, d - rango.minY);
        for (let x = x0; x <= x1; x++) {
          const y = d - x;
          const p = gridAMundo(x, y);
          if (!tileVisible(p.x, p.y, area)) continue;

          const imagen = this.obtener(k);
          const i = y * ancho + x;
          const nombre = NOMBRES_FRAME[indiceFrame(terreno[i] as number, variante[i] as number)] as string;
          if (this.framesAsignados[k] !== nombre) {
            imagen.setFrame(nombre);
            this.framesAsignados[k] = nombre;
          }
          imagen.setPosition(p.x, p.y);
          if (k >= this.usadas) imagen.setVisible(true);
          k++;
        }
      }
    }

    for (let j = k; j < this.usadas; j++) {
      (this.reserva[j] as Phaser.GameObjects.Image).setVisible(false);
    }
    this.usadas = k;
    this.cache = area;
    this.rango = rango;
    if (this.rejillaVisible) this.dibujarRejilla(zoom);
  }

  private dibujarRejilla(zoom: number): void {
    const r = this.rango;
    const g = this.rejilla;
    g.clear();
    this.zoomRejilla = zoom;
    if (!r || rangoVacio(r)) return;
    g.lineStyle(Math.min(2, Math.max(0.75, 1 / zoom)), 0x000000, 0.22);
    g.beginPath();
    for (let gx = r.minX; gx <= r.maxX + 1; gx++) {
      const a = gridAMundo(gx, r.minY);
      const b = gridAMundo(gx, r.maxY + 1);
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    }
    for (let gy = r.minY; gy <= r.maxY + 1; gy++) {
      const a = gridAMundo(r.minX, gy);
      const b = gridAMundo(r.maxX + 1, gy);
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
    }
    g.strokePath();
  }
}
