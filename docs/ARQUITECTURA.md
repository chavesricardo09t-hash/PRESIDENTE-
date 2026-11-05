# Arquitectura (Fase 1)

## Capas y reglas
```
src/
  core/     Bus de eventos tipado, catálogo de eventos y registro de módulos de simulación.
  world/    Datos del mundo (arreglos tipados) y generación. NO importa Phaser ni el navegador.
  render/   Dibujo con Phaser. Lee el mundo, nunca lo modifica. La geometría, la cámara y el
            medidor de FPS son módulos puros (probables sin navegador).
  ui/       Superposición HTML (medidor, botones) y panel de diagnóstico.
  pwa/      Service Worker, caché sin conexión e instalación (lógica del Paso 0).
  main.ts   Arranque: crea mapa, bus, interfaz y juego.
```
Reglas: `world` no depende de nadie; `render` depende de `world` y `core`; `ui` y `render` se
hablan solo a través del bus (`core/eventos.ts`).

## Cómo se dibuja el mapa
- El mapa es un `Uint8Array` por capa (terreno, elevación, variante): un byte por casilla.
- Casillas isométricas 2:1 de 64x32. Vértice superior de la casilla (x, y) en el mundo:
  `px = (x - y) * 32`, `py = (x + y) * 16`.
- Las 21 texturas (7 terrenos x 3 variantes) se dibujan en un canvas al arrancar: no hay imágenes externas.
- `CapaTerreno` mantiene una reserva de imágenes reutilizables y asigna SOLO las casillas de la
  zona visible + 96 px de margen, de atrás hacia adelante (orden de pintor). Solo se reconstruye
  cuando la vista sale de esa zona, no en cada fotograma.
- La cuadrícula es un único objeto gráfico que cubre la zona visible.

## Cámara
`EstadoCamara` (pura) guarda centro y zoom: `mundo = centro + (pantalla - tamaño/2) / zoom`.
`ControlGestos` traduce dedos a esas operaciones: un dedo arrastra, dos dedos hacen zoom y
desplazamiento anclados en el punto medio. Zoom limitado a 0,4–3.

## Preparación para fases futuras (sin implementarlas)
- `RegistroModulos` define cómo se enchufarán economía, ciudadanos, política, etc. En la Fase 1 está vacío.
- `EventBus` + `EventosJuego`: cada fase añade sus eventos sin tocar las demás.
- Datos en arreglos tipados y separación lógica/dibujo, como exige el documento maestro para el rendimiento.
- Aún NO existe: selección de casillas, países, guardado, economía ni ninguna otra función posterior.
