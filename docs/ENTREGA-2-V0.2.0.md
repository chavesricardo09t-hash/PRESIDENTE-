# v0.2.0 — Mundo rectangular explorable

> **Estado: pendiente de validación en Android por el director.**

## Qué cambia respecto a v0.1.0
- Mundo **rectangular**: 64 columnas x 256 filas (16.384 casillas), sin la forma de rombo.
- Cámara con **límites reales** sobre la zona cubierta: no se ve espacio vacío ni se puede salir del mundo.
- **Zoom 0,20 – 3,0**, con el mínimo ajustado automáticamente a cada pantalla (vertical y horizontal).
- **Agua coherente**: mares interiores, lagos, ríos que desembocan en el agua y playas en las costas.
- Cuadrícula recalculada para la nueva disposición.
No cambian: gráficos y estilo isométrico, controles táctiles, medidor de FPS, informe, diagnóstico, PWA y flujo de Actions.

## Cómo subirla desde Android
Igual que siempre: descarga el ZIP, en el repositorio **Add file → Upload files**, elige el ZIP y **Commit changes**.
El flujo de Actions no cambia. Después abre la app con internet y espera ~3 s para que se actualice.

## Lista de verificación en tu Android
### A. Compilación
- [ ] Actions termina en verde y la página abre.
- [ ] El panel muestra «Mundo 64×256» y la versión 0.2.0.

### B. Exploración y límites
- [ ] Recorre todo el territorio arrastrando con un dedo.
- [ ] Lleva la cámara a las 4 esquinas y a los 4 bordes: el mapa llega hasta el borde de la pantalla y NO se ve fondo azul oscuro vacío.
- [ ] Arrastra con fuerza hacia cada borde: la cámara se detiene y no se puede salir del mundo.

### C. Zoom
- [ ] Pellizca hasta el mínimo en vertical: el panel dice «Zoom 0.20 (mín 0.20)» (o el mínimo de tu pantalla) y no hay vacío.
- [ ] Pellizca hasta el máximo: «Zoom 3.00».
- [ ] Gira el teléfono a horizontal y de nuevo a vertical: no aparece vacío, el zoom se ajusta solo.

### D. Terreno y agua
- [ ] Se distinguen mar, arena, pradera, bosque con árboles, colinas y montañas con nieve.
- [ ] Hay un mar interior, lagos, ríos que nacen en las alturas y terminan en el agua, y playas en las costas.
- [ ] No ves manchas de agua sueltas sin sentido.

### E. Cuadrícula
- [ ] **Cuadrícula: sí** muestra líneas alineadas con los bordes de las casillas; **no** las quita.

### F. Rendimiento con el zoom mínimo
- [ ] Con zoom mínimo: anota FPS promedio y mínimo con el mapa quieto y mientras arrastras.
- [ ] ¿Se entrecorta al arrastrar con el zoom mínimo? Dímelo aunque sea poco.
- [ ] Toca **Informe** y pega el texto aquí.
Referencia de v0.1.0 (zoom 0,40, ~2.500 casillas): 59,5 FPS. En v0.2.0 el zoom 0,20 dibuja unas **9.200 casillas** (unas 3,7 veces más): es el punto más exigente y el que más quiero medir.

### G. Conservado
- [ ] Un dedo y dos dedos siguen funcionando igual; el botón **Diagnóstico** abre el panel.
- [ ] La app instalada abre sin conexión (modo avión).

## Riesgos conocidos
- Primera compilación de esta versión: podría fallar y habría que corregir.
- Rendimiento a zoom 0,20 **sin validar en dispositivo**. Si hay tirones, la mejora prevista (reciclado incremental de casillas o bloques de textura) requeriría tu autorización.
- Las fronteras entre masas de agua y tierra dependen de la semilla; con otra semilla el mundo cambiaría.
