import './estilos.css';
import Phaser from 'phaser';
import { EventBus } from './core/EventBus';
import type { DatosRendimiento, EventosJuego } from './core/eventos';
import { iniciarPwa, esAppInstalada } from './pwa/pwa';
import { EscenaArranque } from './render/EscenaArranque';
import { EscenaMapa } from './render/EscenaMapa';
import { Diagnostico } from './ui/Diagnostico';
import { Hud } from './ui/Hud';
import { construirInformeJuego } from './ui/informe';
import { formatearFechaCompilacion } from './verificacion';
import { generarMapa } from './world/generador';

const SEMILLA = 20261031;
const ANCHO_MAPA = 128;
const ALTO_MAPA = 128;

function elemento(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (!e) throw new Error(`Falta el elemento #${id} en index.html`);
  return e;
}

function memoriaJs(): string | null {
  const memoria = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  return memoria ? `${(memoria.usedJSHeapSize / 1048576).toFixed(0)} MB` : null;
}

function arrancar(): void {
  const mapa = generarMapa({ ancho: ANCHO_MAPA, alto: ALTO_MAPA, semilla: SEMILLA });
  const bus = new EventBus<EventosJuego>();
  let ultimo: DatosRendimiento | null = null;
  let rejillaActiva = false;

  // --- Diagnóstico (Paso 0 conservado) ---
  const diagnostico = new Diagnostico(elemento('diag'), { copiarInforme: () => void copiarInforme() });
  diagnostico.fijar('Versión', __APP_VERSION__);
  diagnostico.fijar('Compilación', formatearFechaCompilacion(__BUILD_TIME__));
  diagnostico.fijar('Modo', esAppInstalada() ? 'App instalada (sin barra del navegador)' : 'Navegador');
  diagnostico.fijar('Pantalla', `${window.innerWidth}×${window.innerHeight} (×${window.devicePixelRatio})`);
  diagnostico.fijar('Conexión', navigator.onLine ? 'En línea' : 'Sin conexión');
  diagnostico.fijar('IndexedDB', 'indexedDB' in window ? 'Disponible' : 'No disponible');
  window.addEventListener('online', () => diagnostico.fijar('Conexión', 'En línea'));
  window.addEventListener('offline', () => diagnostico.fijar('Conexión', 'Sin conexión'));
  iniciarPwa(diagnostico);

  // --- Interfaz del juego ---
  const hud = new Hud(elemento('hud'), `Mapa ${ANCHO_MAPA}×${ALTO_MAPA} · semilla ${SEMILLA}`, {
    alternarRejilla: () => {
      rejillaActiva = !rejillaActiva;
      bus.emit('rejilla:cambiar', { visible: rejillaActiva });
      return rejillaActiva;
    },
    copiarInforme: () => void copiarInforme(),
    abrirDiagnostico: () => diagnostico.mostrar(),
  });
  bus.on('rendimiento', (datos) => {
    ultimo = datos;
    hud.actualizar(datos);
  });

  async function copiarInforme(): Promise<void> {
    const extra: Record<string, string> = {
      ...diagnostico.obtenerDatos(),
      'Pixel ratio': String(window.devicePixelRatio),
      Navegador: navigator.userAgent,
    };
    const memoria = memoriaJs();
    if (memoria) extra['Memoria JS'] = memoria;
    const texto = construirInformeJuego(ultimo, extra);
    try {
      await navigator.clipboard.writeText(texto);
      hud.mostrarMensaje('Informe copiado. Pégalo en el chat.');
    } catch {
      diagnostico.mostrarTexto(texto);
      diagnostico.mostrar();
      hud.mostrarMensaje('No se pudo copiar: el texto está en Diagnóstico.');
    }
  }

  // --- Juego ---
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'juego',
    backgroundColor: '#0b2038',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    render: { powerPreference: 'high-performance', antialias: true },
    disableContextMenu: true,
    scene: [new EscenaArranque(), new EscenaMapa({ mapa, bus })],
  });
}

arrancar();
