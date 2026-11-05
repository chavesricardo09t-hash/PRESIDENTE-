import type { DatosRendimiento } from '../core/eventos';

export interface AccionesHud {
  alternarRejilla: () => boolean;
  copiarInforme: () => void;
  abrirDiagnostico: () => void;
}

/** Superposición HTML: medidor de FPS y botones. No dibuja nada dentro de Phaser. */
export class Hud {
  private readonly texto: HTMLElement;
  private readonly mensaje: HTMLElement;
  private temporizador = 0;

  constructor(raiz: HTMLElement, mapaInfo: string, acciones: AccionesHud) {
    this.texto = document.createElement('div');
    this.texto.className = 'hud-datos';
    this.texto.textContent = `PRESIDENTE v${__APP_VERSION__}\n${mapaInfo}\nMidiendo…`;

    this.mensaje = document.createElement('div');
    this.mensaje.className = 'hud-mensaje';
    this.mensaje.hidden = true;

    const barra = document.createElement('div');
    barra.className = 'hud-botones';

    const rejilla = document.createElement('button');
    rejilla.type = 'button';
    rejilla.textContent = 'Cuadrícula: no';
    rejilla.addEventListener('click', () => {
      const activa = acciones.alternarRejilla();
      rejilla.textContent = `Cuadrícula: ${activa ? 'sí' : 'no'}`;
    });

    const informe = document.createElement('button');
    informe.type = 'button';
    informe.textContent = 'Informe';
    informe.addEventListener('click', () => acciones.copiarInforme());

    const diag = document.createElement('button');
    diag.type = 'button';
    diag.textContent = 'Diagnóstico';
    diag.addEventListener('click', () => acciones.abrirDiagnostico());

    barra.append(rejilla, informe, diag);
    raiz.replaceChildren(this.texto, this.mensaje, barra);
    this.mapaInfo = mapaInfo;
  }

  private readonly mapaInfo: string;

  actualizar(d: DatosRendimiento): void {
    const f = d.fps;
    this.texto.textContent =
      `PRESIDENTE v${__APP_VERSION__}\n` +
      `FPS ${f.actual.toFixed(0)}  (prom ${f.promedio5s.toFixed(0)} · mín ${f.minimo5s.toFixed(0)})\n` +
      `Zoom ${d.zoom.toFixed(2)} · Casillas ${d.tilesDibujados}\n` +
      `${d.renderizador} · ${d.pantalla}\n` +
      this.mapaInfo;
  }

  mostrarMensaje(texto: string): void {
    this.mensaje.textContent = texto;
    this.mensaje.hidden = false;
    window.clearTimeout(this.temporizador);
    this.temporizador = window.setTimeout(() => (this.mensaje.hidden = true), 3000);
  }
}
