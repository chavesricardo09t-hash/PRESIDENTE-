# Pruebas de la Entrega 1 (v0.1.0)

Entorno de verificación de Claude: Node v22.22.2, TypeScript 6.0.3, Chromium headless. Sin red.

## Ejecutadas — resultado real
**49 pruebas automáticas, 0 fallos** en 9 archivos, ejecutadas con un **ejecutor local que
simula Vitest** (no es Vitest real; usa las mismas aserciones con `node:assert`).
Vitest real se ejecutará por primera vez en GitHub Actions.

Detalle:

```
EventBus
  ✓ entrega los datos a los oyentes
  ✓ permite varios oyentes y eventos independientes
  ✓ deja de avisar tras cancelar la suscripción
  ✓ emitir sin oyentes no falla
RESULTADO: 4 pruebas pasaron, 0 fallaron
RegistroModulos
  ✓ registra, inicia y actualiza en orden de registro
  ✓ rechaza identificadores duplicados
  ✓ obtiene módulos por id
RESULTADO: 3 pruebas pasaron, 0 fallaron
ruido determinista
  ✓ hash2 es estable y está en [0, 1)
  ✓ hash2 cambia con la semilla y las coordenadas
  ✓ crearAleatorio repite la secuencia con la misma semilla
  ✓ ruidoValor y fbm quedan en [0, 1] y son continuos
RESULTADO: 4 pruebas pasaron, 0 fallaron
generarMapa
  ✓ crea arreglos del tamaño correcto
  ✓ es determinista: misma semilla, mismo mapa
  ✓ semillas distintas producen mapas distintos
  ✓ solo usa identificadores de terreno y variantes válidos
  ✓ respeta las proporciones objetivo con cualquier semilla (±0,5 puntos)
  ✓ contiene tanto agua como tierra y la mayor parte de los bordes es agua
  ✓ acepta un mapa de una sola casilla
  ✓ rechaza tamaños inválidos
terreno y mapa
  ✓ todos los terrenos tienen información coherente
  ✓ indiceCasilla y dentroDelMapa funcionan en los bordes
RESULTADO: 10 pruebas pasaron, 0 fallaron
geometría isométrica
  ✓ convierte casillas conocidas
  ✓ mundoAGrid invierte a gridAMundo
  ✓ tileVisible detecta tiles dentro y fuera de la vista
  ✓ calcularRangoVisible nunca omite un tile visible (vistas aleatorias y extremas)
  ✓ el rango es eficiente con vistas de teléfono y el margen de caché real (razón medida ~3,0-3,4)
  ✓ devuelve un rango vacío si la vista está fuera del mapa
  ✓ vistaDentro y expandir se comportan como se espera
  ✓ limitesMundo contiene el vértice superior de todas las casillas
  ✓ las dimensiones del cuadro son coherentes con el rombo de 64x32
RESULTADO: 9 pruebas pasaron, 0 fallaron
EstadoCamara
  ✓ empieza centrada en el mundo con el zoom pedido (limitado)
  ✓ la vista del mundo mide pantalla / zoom
  ✓ arrastrar mueve el mundo con el dedo (dedo a la derecha = cámara a la izquierda)
  ✓ el zoom con pellizco mantiene fijo el punto bajo los dedos
  ✓ anclar deja el punto del mundo exactamente bajo el píxel indicado
  ✓ el zoom queda limitado entre mínimo y máximo
  ✓ el centro no sale de los límites del mundo
  ✓ redimensionar conserva el centro y el zoom
RESULTADO: 8 pruebas pasaron, 0 fallaron
MedidorFps
  ✓ mide ~60 FPS con intervalos de 16,67 ms
  ✓ mide ~30 FPS con intervalos de 33,3 ms
  ✓ el mínimo refleja una caída y detecta fotogramas largos
  ✓ sin datos devuelve ceros y reiniciar limpia todo
  ✓ el calentamiento no cuenta en el mínimo y promedio totales
RESULTADO: 5 pruebas pasaron, 0 fallaron
informe de rendimiento
  ✓ incluye FPS, casillas, renderizador y datos extra
  ✓ sin datos de rendimiento lo indica claramente
RESULTADO: 2 pruebas pasaron, 0 fallaron
Paso 0 - verificación
  ✓ identifica el proyecto y el paso
  ✓ formatea una fecha de compilación válida en UTC
  ✓ no falla con una fecha inválida
  ✓ construye el informe línea por línea
RESULTADO: 4 pruebas pasaron, 0 fallaron
```

Otras comprobaciones reales:
- **Tipado** de TODO el proyecto con el `tsconfig.json` real (TypeScript 6.0.3) y modo estricto:
  sin errores. Los tipos de Phaser fueron un **stub escrito de memoria**, así que NO valida el uso
  real de la API de Phaser.
- **Medición** de la eficiencia del recorte de casillas con vistas de teléfono (360x728): se exploran
  ~3 casillas por cada casilla visible (peor caso medido 3,4). Con zoom 0,4 se dibujan ~1.800 casillas;
  con zoom 1, ~310.
- **Dibujo** del atlas y del mapa con mi propio código en Chromium headless (no con Phaser):
  terrenos legibles, orden de profundidad correcto y sin rendijas entre casillas.
- **Calibración del generador:** reparto exacto por percentiles (mar 14 %, agua 11 %, arena 5 %,
  colinas 12 %, montañas 6 %) en todas las semillas probadas.
- **Flujo de importación del ZIP** (script del paso «Extraer ZIP» de Actions) simulado en un repositorio
  git local: extrae, elimina el ZIP, ignora `.github/` y empuja.

## NO ejecutadas — pendientes
- Instalación de dependencias, `vitest` real, compilación con Vite y Phaser: **se verán en Actions**.
- Ejecución real de Phaser: escenas, textura de canvas, imágenes, gráficos, cámara.
- Gestos táctiles (arrastre y pellizco), rendimiento y FPS reales, aspecto en tu pantalla.
- Service Worker con la nueva versión, instalación PWA y uso sin conexión de esta versión.
- Todo el apartado de la lista de verificación de `docs/ENTREGA-1-FASE-1.md`: **solo tú puedes validarlo en Android**.
