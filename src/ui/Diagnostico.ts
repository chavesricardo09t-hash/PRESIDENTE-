import { pwaVersionTexto } from './textos';
import type { DestinoPwa } from '../pwa/pwa';

/** Panel de diagnóstico (el del Paso 0, ahora accesible desde el juego). */
export class Diagnostico implements DestinoPwa {
  private readonly datos: Record<string, string> = {};
  private readonly orden: string[] = [];
  private readonly cuerpo: HTMLTableSectionElement;
  private readonly nota: HTMLElement;
  private readonly botonInstalar: HTMLButtonElement;
  private accionInstalar: (() => void) | null = null;

  constructor(
    private readonly raiz: HTMLElement,
    acciones: { copiarInforme: () => void },
  ) {
    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'diag-cerrar';
    cerrar.textContent = 'Cerrar';
    cerrar.addEventListener('click', () => this.ocultar());

    const titulo = document.createElement('h1');
    titulo.textContent = 'PRESIDENTE';
    const sub = document.createElement('p');
    sub.className = 'sub';
    sub.textContent = pwaVersionTexto();

    const tabla = document.createElement('table');
    this.cuerpo = document.createElement('tbody');
    tabla.append(this.cuerpo);

    const botones = document.createElement('div');
    botones.className = 'botones';
    const copiar = document.createElement('button');
    copiar.type = 'button';
    copiar.textContent = 'Copiar informe';
    copiar.addEventListener('click', () => acciones.copiarInforme());
    this.botonInstalar = document.createElement('button');
    this.botonInstalar.type = 'button';
    this.botonInstalar.textContent = 'Instalar app';
    this.botonInstalar.hidden = true;
    this.botonInstalar.addEventListener('click', () => this.accionInstalar?.());
    botones.append(copiar, this.botonInstalar);

    this.nota = document.createElement('p');
    this.nota.className = 'nota';

    this.raiz.replaceChildren(cerrar, titulo, sub, tabla, botones, this.nota);
  }

  fijar(clave: string, valor: string): void {
    if (!(clave in this.datos)) this.orden.push(clave);
    this.datos[clave] = valor;
    this.cuerpo.replaceChildren(
      ...this.orden.map((k) => {
        const fila = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = k;
        const td = document.createElement('td');
        td.textContent = this.datos[k] ?? '';
        fila.append(th, td);
        return fila;
      }),
    );
  }

  obtenerDatos(): Record<string, string> {
    return { ...this.datos };
  }

  ofrecerInstalacion(instalar: () => void): void {
    this.accionInstalar = instalar;
    this.botonInstalar.hidden = false;
  }

  ocultarInstalacion(): void {
    this.botonInstalar.hidden = true;
  }

  mostrarTexto(texto: string): void {
    this.nota.textContent = texto;
  }

  mostrar(): void {
    this.raiz.hidden = false;
  }

  ocultar(): void {
    this.raiz.hidden = true;
  }
}
