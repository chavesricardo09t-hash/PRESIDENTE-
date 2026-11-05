# Fase 1 — Entrega 1 (v0.1.0): mapa isométrico y cámara táctil

## Qué contiene
- Mapa isométrico de 128x128 casillas generado con semilla (20261031).
- 7 terrenos: mar profundo, agua, arena, pradera, bosque (con árboles), colina y montaña (con nieve).
- Dibujo eficiente: solo se dibujan las casillas de la zona visible.
- Cámara táctil: un dedo arrastra; dos dedos hacen zoom (0,4–3) anclado entre los dedos.
- Botón **Cuadrícula** (activable).
- Medidor de FPS en pantalla y botón **Informe** (copia un texto para pegarlo en el chat).
- Botón **Diagnóstico**: el panel del Paso 0 (Service Worker, uso sin conexión, instalación).

## Qué NO contiene (a propósito)
Selección de casillas, panel territorial, países, fronteras, guardado/carga. Son las siguientes entregas.

## Cómo subirla desde Android
Igual que en el Paso 0 (ver `docs/GUIA-PASO-0.md`, sección B): descarga el ZIP, en el repositorio
**Add file → Upload files**, elige el ZIP y **Commit changes**. El flujo de Actions no cambia.

## Lista de verificación en tu Android
Marca cada punto y repórtalo. Si algo falla, dime exactamente qué ves.

### A. Compilación (GitHub)
- [ ] Actions termina en verde (instalar, pruebas, compilar, publicar).
- [ ] La URL de Pages abre y muestra el mapa.

### B. Aspecto
- [ ] Se distinguen mar, arena, pradera, bosque con árboles, colinas y montañas con nieve.
- [ ] No hay rendijas ni líneas entre casillas.
- [ ] ¿Se ve borroso/pixelado? (posible por la densidad de pantalla; dime si molesta).

### C. Cámara
- [ ] Un dedo: el mapa se mueve siguiendo al dedo, sin saltos.
- [ ] Dos dedos: el zoom se centra entre los dedos; no salta al soltar un dedo.
- [ ] El mapa no se pierde de vista al arrastrar lejos.
- [ ] Al hacer zoom máximo y mínimo no se rompe nada.

### D. Cuadrícula
- [ ] **Cuadrícula: sí** muestra líneas; **no** las quita.

### E. Rendimiento (con el medidor)
- [ ] Zoom 1: anota FPS promedio y mínimo.
- [ ] Zoom mínimo (~0,4): anota FPS promedio y mínimo.
- [ ] Mientras arrastras con zoom mínimo: ¿se entrecorta?
- [ ] Toca **Informe** y pega aquí el texto.
Objetivo de referencia (a confirmar, no garantizado): ≥ 45 FPS promedio y mínimo ≥ 25 en zoom mínimo.

### F. Paso 0 conservado
- [ ] **Diagnóstico**: Service Worker «Activo» y Uso sin conexión «Listo».
- [ ] Instalar como app y abrir sin conexión (modo avión) sigue funcionando.
  Nota: tras actualizar, abre la app con internet una vez y espera ~3 s antes de probar sin conexión.

## Riesgos conocidos de esta entrega
- Es la primera compilación real con Phaser: puede fallar al compilar y habría que corregir.
- Se puede ver algo borroso en pantallas de alta densidad (aún no se aprovecha la resolución nativa).
- No hay inercia al soltar el arrastre ni detección de «toque» (llegan con la selección de casillas).
