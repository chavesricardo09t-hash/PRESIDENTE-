import type { ResumenFps } from '../render/MedidorFps';

export interface DatosRendimiento {
  fps: ResumenFps;
  zoom: number;
  tilesDibujados: number;
  tilesReserva: number;
  renderizador: string;
  pantalla: string;
}

// Catálogo de eventos del juego. Las fases futuras añaden aquí los suyos.
export interface EventosJuego {
  rendimiento: DatosRendimiento;
  'rejilla:cambiar': { visible: boolean };
}
