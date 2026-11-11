import Phaser from 'phaser';
import type { EventBus } from '../core/EventBus';
import type { EventosJuego } from '../core/eventos';
import { zonaCubierta } from '../world/disposicion';
import type { MapaMundo } from '../world/mapa';
import { CapaTerreno } from './CapaTerreno';
import { ControlGestos } from './ControlGestos';
import { EstadoCamara } from './EstadoCamara';
import { MedidorFps } from './MedidorFps';

export interface DatosEscenaMapa {
  mapa: MapaMundo;
  bus: EventBus<EventosJuego>;
}

const PERIODO_PUBLICACION_MS = 500;
/** Zoom mínimo objetivo; el real se ajusta a la pantalla para no mostrar nunca espacio vacío. */
export const ZOOM_MINIMO = 0.2;
export const ZOOM_MAXIMO = 3;

export class EscenaMapa extends Phaser.Scene {
  private capa!: CapaTerreno;
  private estado!: EstadoCamara;
  private gestos!: ControlGestos;
  private readonly medidor = new MedidorFps();
  private ultimaPublicacion = 0;

  constructor(private readonly datos: DatosEscenaMapa) {
    super('EscenaMapa');
  }

  create(): void {
    const { mapa, bus } = this.datos;
    this.cameras.main.setBackgroundColor('#0b2038');

    this.capa = new CapaTerreno(this, mapa);
    this.estado = new EstadoCamara(
      this.scale.width,
      this.scale.height,
      { zona: zonaCubierta(mapa.ancho, mapa.alto), zoomMin: ZOOM_MINIMO, zoomMax: ZOOM_MAXIMO },
      1,
    );
    this.gestos = new ControlGestos(this, this.estado);

    this.scale.on('resize', (tamano: Phaser.Structs.Size) => {
      this.estado.redimensionar(tamano.width, tamano.height);
    });
    bus.on('rejilla:cambiar', ({ visible }) => this.capa.fijarRejilla(visible));

    this.aplicarCamara();
  }

  update(): void {
    const ahora = performance.now();
    this.medidor.registrar(ahora);
    this.gestos.actualizar();
    this.aplicarCamara();
    this.capa.sincronizar(this.estado.vista(), this.estado.zoom);

    if (ahora - this.ultimaPublicacion >= PERIODO_PUBLICACION_MS) {
      this.ultimaPublicacion = ahora;
      this.datos.bus.emit('rendimiento', {
        fps: this.medidor.resumen(),
        zoom: this.estado.zoom,
        zoomMinimo: this.estado.zoomMinimo(),
        tilesDibujados: this.capa.tilesDibujados,
        tilesReserva: this.capa.tilesReserva,
        renderizador: this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas',
        pantalla: `${Math.round(this.scale.width)}×${Math.round(this.scale.height)}`,
      });
    }
  }

  private aplicarCamara(): void {
    const camara = this.cameras.main;
    camara.setZoom(this.estado.zoom);
    camara.centerOn(this.estado.cx, this.estado.cy);
  }
}
