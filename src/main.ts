import { construirInforme, formatearFechaCompilacion, resumenPaso0 } from './verificacion';

const NOMBRE_CACHE = 'presidente-paso0-v1';

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
}

const datos: Record<string, string> = {};
const orden: string[] = [];
let cuerpoTabla: HTMLTableSectionElement | null = null;
let ayuda: HTMLElement | null = null;
let botonInstalar: HTMLButtonElement | null = null;
let eventoInstalacion: EventoInstalacion | null = null;

function pintar(): void {
  if (!cuerpoTabla) return;
  cuerpoTabla.replaceChildren();
  for (const clave of orden) {
    const fila = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = clave;
    const td = document.createElement('td');
    td.textContent = datos[clave] ?? '';
    fila.append(th, td);
    cuerpoTabla.append(fila);
  }
}

function fijar(clave: string, valor: string): void {
  if (!(clave in datos)) orden.push(clave);
  datos[clave] = valor;
  pintar();
}

function esAppInstalada(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function construirInterfaz(): void {
  const raiz = document.getElementById('app');
  if (!raiz) return;
  const resumen = resumenPaso0();

  const titulo = document.createElement('h1');
  titulo.textContent = resumen.proyecto;

  const sub = document.createElement('p');
  sub.className = 'sub';
  sub.textContent = `Paso ${resumen.paso} — ${resumen.descripcion}`;

  const aviso = document.createElement('p');
  aviso.className = 'ok';
  aviso.textContent =
    'Si ves esta página en tu teléfono, el camino GitHub → Actions → Pages funciona. Esta página solo se publica si las pruebas y la compilación terminaron bien.';

  const tabla = document.createElement('table');
  cuerpoTabla = document.createElement('tbody');
  tabla.append(cuerpoTabla);

  const botones = document.createElement('div');
  botones.className = 'botones';

  const copiar = document.createElement('button');
  copiar.type = 'button';
  copiar.textContent = 'Copiar informe';
  copiar.addEventListener('click', () => void copiarInforme());

  botonInstalar = document.createElement('button');
  botonInstalar.type = 'button';
  botonInstalar.textContent = 'Instalar app';
  botonInstalar.hidden = true;
  botonInstalar.addEventListener('click', () => void eventoInstalacion?.prompt());

  botones.append(copiar, botonInstalar);

  ayuda = document.createElement('p');
  ayuda.className = 'nota';

  raiz.replaceChildren(titulo, sub, aviso, tabla, botones, ayuda);
}

async function copiarInforme(): Promise<void> {
  const texto = construirInforme({ ...datos, Navegador: navigator.userAgent });
  try {
    await navigator.clipboard.writeText(texto);
    if (ayuda) ayuda.textContent = 'Informe copiado. Pégalo en el chat con Claude.';
  } catch {
    if (ayuda) ayuda.textContent = texto;
  }
}

async function precargarSinConexion(): Promise<void> {
  const origen = location.origin;
  const urls = new Set<string>([location.href]);
  for (const entrada of performance.getEntriesByType('resource')) {
    if (entrada.name.startsWith(origen)) urls.add(entrada.name);
  }
  const cache = await caches.open(NOMBRE_CACHE);
  await Promise.all(
    [...urls].map(async (url) => {
      try {
        await cache.add(url);
      } catch {
        /* un recurso que falle no impide el resto */
      }
    }),
  );
}

async function iniciarServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    fijar('Service Worker', 'No compatible');
    return;
  }
  fijar('Service Worker', 'Registrando…');
  fijar('Uso sin conexión', 'Preparando…');
  try {
    const registro = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    await navigator.serviceWorker.ready;
    fijar('Service Worker', `Activo (ámbito ${new URL(registro.scope).pathname})`);
    await precargarSinConexion();
    fijar('Uso sin conexión', 'Listo: archivos guardados en caché');
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    fijar('Service Worker', `Error: ${mensaje}`);
    fijar('Uso sin conexión', 'No disponible');
  }
}

function iniciar(): void {
  construirInterfaz();

  fijar('Versión', __APP_VERSION__);
  fijar('Compilación', formatearFechaCompilacion(__BUILD_TIME__));
  fijar('Modo', esAppInstalada() ? 'App instalada (sin barra del navegador)' : 'Navegador');
  fijar('Pantalla', `${window.innerWidth}×${window.innerHeight} (×${window.devicePixelRatio})`);
  fijar('Conexión', navigator.onLine ? 'En línea' : 'Sin conexión');
  fijar('IndexedDB', 'indexedDB' in window ? 'Disponible' : 'No disponible');
  fijar('Instalable', esAppInstalada() ? 'Ya instalada' : 'Pendiente (Chrome decide si lo ofrece)');

  window.addEventListener('online', () => fijar('Conexión', 'En línea'));
  window.addEventListener('offline', () => fijar('Conexión', 'Sin conexión'));
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    eventoInstalacion = evento as EventoInstalacion;
    if (botonInstalar) botonInstalar.hidden = false;
    fijar('Instalable', 'Sí: Chrome ofrece instalar la app');
  });
  window.addEventListener('appinstalled', () => {
    if (botonInstalar) botonInstalar.hidden = true;
    fijar('Instalable', 'App instalada');
  });

  void iniciarServiceWorker();
}

iniciar();
