import type { DatosRendimiento } from '../core/eventos';
import { construirInforme } from '../verificacion';

function f1(n: number): string {
  return n.toFixed(1);
}

/** Texto del informe de rendimiento que el usuario copia y pega en el chat. */
export function construirInformeJuego(datos: DatosRendimiento | null, extra: Record<string, string>): string {
  const lineas: Record<string, string> = {};
  if (datos) {
    const f = datos.fps;
    lineas['FPS actual'] = f1(f.actual);
    lineas['FPS promedio (5 s)'] = f1(f.promedio5s);
    lineas['FPS mínimo (5 s)'] = f1(f.minimo5s);
    lineas['FPS promedio (total)'] = f1(f.promedioTotal);
    lineas['FPS mínimo (total)'] = f1(f.minimoTotal);
    lineas['Fotogramas'] = `${f.fotogramas} (largos >50 ms: ${f.fotogramasLargos})`;
    lineas['Tiempo medido'] = `${f1(f.segundos)} s`;
    lineas['Zoom'] = datos.zoom.toFixed(2);
    lineas['Zoom mínimo efectivo'] = datos.zoomMinimo.toFixed(3);
    lineas['Casillas dibujadas'] = `${datos.tilesDibujados} (reserva ${datos.tilesReserva})`;
    lineas['Renderizador'] = datos.renderizador;
    lineas['Pantalla del juego'] = datos.pantalla;
  } else {
    lineas['Rendimiento'] = 'sin datos todavía';
  }
  return 'PRESIDENTE — Informe de rendimiento\n' + construirInforme({ ...lineas, ...extra });
}
