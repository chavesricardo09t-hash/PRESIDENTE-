// Lógica PWA validada en el Paso 0 (Service Worker, caché sin conexión, instalación),
// movida aquí sin cambiar su comportamiento.

export const NOMBRE_CACHE = 'presidente-v0.2';

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
}

export interface DestinoPwa {
  fijar(clave: string, valor: string): void;
  ofrecerInstalacion(instalar: () => void): void;
  ocultarInstalacion(): void;
}

export function esAppInstalada(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
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

async function iniciarServiceWorker(destino: DestinoPwa): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    destino.fijar('Service Worker', 'No compatible');
    return;
  }
  destino.fijar('Service Worker', 'Registrando…');
  destino.fijar('Uso sin conexión', 'Preparando…');
  try {
    const registro = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    await navigator.serviceWorker.ready;
    destino.fijar('Service Worker', `Activo (ámbito ${new URL(registro.scope).pathname})`);
    // Espera a que el juego termine de cargar sus archivos antes de guardarlos en caché.
    await new Promise((r) => setTimeout(r, 1500));
    await precargarSinConexion();
    destino.fijar('Uso sin conexión', 'Listo: archivos guardados en caché');
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    destino.fijar('Service Worker', `Error: ${mensaje}`);
    destino.fijar('Uso sin conexión', 'No disponible');
  }
}

export function iniciarPwa(destino: DestinoPwa): void {
  let evento: EventoInstalacion | null = null;
  destino.fijar('Instalable', esAppInstalada() ? 'Ya instalada' : 'Pendiente (Chrome decide si lo ofrece)');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    evento = e as EventoInstalacion;
    destino.ofrecerInstalacion(() => void evento?.prompt());
    destino.fijar('Instalable', 'Sí: Chrome ofrece instalar la app');
  });
  window.addEventListener('appinstalled', () => {
    destino.ocultarInstalacion();
    destino.fijar('Instalable', 'App instalada');
  });

  void iniciarServiceWorker(destino);
}
