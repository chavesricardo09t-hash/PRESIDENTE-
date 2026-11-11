# Arquitectura (v0.2.0)

## Capas y reglas
```
src/
  core/     Bus de eventos tipado, catálogo de eventos y registro de módulos de simulación.
  world/    Datos del mundo (arreglos tipados), disposición escalonada y generación.
            NO importa Phaser ni el navegador.
  render/   Dibujo con Phaser. Lee el mundo, nunca lo modifica. La geometría de dibujo, la cámara
            y el medidor de FPS son módulos puros (probables sin navegador).
  ui/       Superposición HTML (medidor, botones) y panel de diagnóstico.
  pwa/      Service Worker, caché sin conexión e instalación (lógica del Paso 0).
  main.ts   Arranque: crea el mundo, el bus, la interfaz y el juego.
```
Reglas: `world` no depende de nadie; `render` depende de `world` y `core`; `ui` y `render` se
hablan solo a través del bus (`core/eventos.ts`).

## El mundo: rectángulo isométrico (disposición escalonada)
- **64 columnas x 256 filas = 16.384 casillas**, un cuadrado de ~4.064 x 4.080 px en pantalla.
- Casillas isométricas 2:1 de 64x32. Las filas impares se desplazan medio rombo y las filas se
  separan 16 px. Vértice superior de la casilla (c, f): `x = 64*c + 32 + 32*(f impar)`, `y = 16*f`.
- Los datos son arreglos tipados indexados por `fila * columnas + columna` (un byte por casilla).
- **Zona totalmente cubierta** (sin huecos): `x` de 32 a 64*columnas, `y` de 16 a 16*filas. Los bordes
  dentados de media casilla quedan fuera y la cámara nunca los muestra.
- Vecinos por arista (`vecinosArista`): 4 diagonales. Las filas pares usan (c-1,f±1) y (c,f±1);
  las impares (c,f±1) y (c+1,f±1). Base para fronteras, caminos y selección en fases futuras.

## Cámara
`EstadoCamara` (pura) guarda centro y zoom: `mundo = centro + (pantalla - tamaño/2) / zoom`.
- Los **bordes de la vista** se limitan a la zona cubierta tras cualquier operación.
- **Zoom mínimo efectivo** = máx(0,20; ancho_pantalla / ancho_zona; alto_pantalla / alto_zona), recalculado al
  girar o cambiar el tamaño. Máximo 3,0. En pantallas muy altas puede ser algo mayor que 0,20
  (p. ej. 412x915 -> 0,224) porque la alternativa sería mostrar espacio vacío.
- `ControlGestos` traduce dedos a esas operaciones (un dedo arrastra, dos dedos zoom). Sin cambios.

## Cómo se dibuja
- 21 texturas (7 terrenos x 3 variantes) dibujadas en un canvas al arrancar; sin imágenes externas.
- `CapaTerreno`: reserva de imágenes reutilizables; solo las casillas de la vista + un margen
  (`margenCache`: mínimo 96 px de mundo y 48 px de pantalla). Recorre las filas de arriba abajo
  (orden de pintor) y solo reconstruye cuando la vista sale de la zona preparada.
- Cuadrícula: un solo objeto gráfico con segmentos calculados (`segmentosRejilla`), recortados a la zona cubierta.

## Generación del terreno (determinista por semilla)
Relieve por ruido fractal muestreado en el suelo (formas isótropas). Proporciones exactas por conteo:
mar 14 %, agua 11 %, arena 5 %, pradera 28 %, bosque 24 %, colinas 12 %, montañas 6 %.
- **Sin charcas:** las masas de agua menores de 27 casillas se eliminan (el reparto se recalcula).
- **Ríos:** nacen en tierras altas y siguen la pendiente hasta un mar, lago u otro río; si no llegan, se descartan.
- **Costas:** la arena se coloca en tierra baja y cercana al agua. El bosque prefiere las zonas húmedas cercanas al agua.

## Preparación para fases futuras (sin implementarlas)
`RegistroModulos` y `EventBus` siguen siendo los puntos de enchufe. Aún NO existe: selección de casillas,
países, fronteras, guardado, economía ni ninguna otra función posterior.
