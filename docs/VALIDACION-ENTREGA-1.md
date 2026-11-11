# Registro de validación — Fase 1, Entrega 1 (v0.1.0)

Fecha de validación: 5 de noviembre de 2026.
Origen de los resultados manuales: **reportados por el director del proyecto** (Claude no puede observar su pantalla).
Código de la versión validada: sin cambios desde la entrega original (solo se actualiza documentación).

## 1. Dispositivo y entorno (según el informe de rendimiento del dispositivo)
| Dato | Valor |
|---|---|
| Sistema | Android 10 |
| Navegador | Chrome 156 (móvil) |
| Pantalla | 360×728 px CSS, pixel ratio 2 |
| Modo | App PWA instalada |
| Compilación | 2026-11-05 02:08 UTC, versión 0.1.0 |
| Renderizador | WebGL |

## 2. Pruebas manuales en Android — 7 de 7 satisfactorias
| # | Prueba | Resultado | Fuente |
|---|---|---|---|
| 1 | Aspecto de los terrenos | Correcto | Director |
| 2 | Nitidez de imagen | Correcta, se ve bien | Director |
| 3 | Arrastre con un dedo | Correcto | Director |
| 4 | Zoom con dos dedos | Correcto | Director |
| 5 | Movimiento con zoom mínimo | Fluido | Director |
| 6 | Cuadrícula | Correcta | Director |
| 7 | Funcionamiento sin conexión | Correcto | Director |

Consecuencia registrada: la nitidez con pixel ratio 2 es aceptable, por lo que **no se planifica trabajo de alta resolución** por ahora.

## 3. Medición de rendimiento real (informe copiado desde el dispositivo)
Condiciones: zoom 0,40 (el caso más exigente), 2.482 casillas dibujadas de las 16.384 del mapa, muestra de 8,7 s.

| Medida | Valor |
|---|---|
| FPS actual | 60,1 |
| FPS promedio (5 s) | 59,5 |
| FPS mínimo (5 s) | 56,5 |
| FPS promedio (total) | 58,5 |
| FPS mínimo (total) | 49,6 |
| Fotogramas / largos (>50 ms) | 484 / 4 |
| Memoria JS | 14 MB (solo JavaScript, no memoria gráfica) |

Objetivo de referencia fijado antes de medir: ≥ 45 FPS promedio y ≥ 25 de mínimo en zoom mínimo. **Cumplido con margen.**

Observaciones (sin acción necesaria):
- Los 4 fotogramas largos no tienen causa determinada. El director reporta movimiento fluido, por lo que no se considera defecto.
- La muestra es corta (8,7 s) y no registra si se estaba arrastrando. La validación de fluidez descansa en el reporte del director.
- El panel de diagnóstico mostró 360×728 y el juego 360×785: el diagnóstico toma la medida una sola vez al arrancar. Es una explicación de Claude, no confirmada.

## 4. Criterios de aceptación de la entrega
| Criterio | Estado | Evidencia |
|---|---|---|
| Mapa isométrico con terrenos, árboles, colinas y montañas | Cumplido | Prueba 1 |
| Dibujo eficiente (solo lo visible) | Cumplido | 2.482 de 16.384 casillas a zoom mínimo; 59,5 FPS |
| Cámara táctil: arrastre | Cumplido | Prueba 3 |
| Cámara táctil: zoom por pellizco | Cumplido | Prueba 4 |
| Cuadrícula activable | Cumplido | Prueba 6 |
| Medidor de FPS | Cumplido | Datos del informe |
| Botón de informe | Cumplido | El director generó y pegó el informe |
| Panel de diagnóstico / PWA del Paso 0 conservado | Cumplido | Informe: Service Worker activo, sin conexión listo, app instalada; prueba 7 |
| Rendimiento aceptable en Android | Cumplido | Sección 3 y prueba 5 |
| Compilación y publicación en GitHub | Cumplido (indirecto) | La versión 0.1.0 está publicada; la publicación solo ocurre si instalación, pruebas y compilación terminan bien. Claude no ha visto el registro de Actions |
| Flujo de Actions y Paso 0 sin cambios | Cumplido | Comparación de archivos antes de entregar |

Puntos de la lista de verificación que el director no reportó uno por uno: apertura del panel con el botón **Diagnóstico**, límites del zoom y no perder el mapa al arrastrar lejos. Se consideran cubiertos por su confirmación general de que todas las pruebas fueron satisfactorias.

## 5. Pruebas automáticas
Se conservan sin cambios en `docs/PRUEBAS-ENTREGA-1.md`: 49 pruebas, 0 fallos, con un ejecutor local que simula Vitest.
Evidencia adicional indirecta: como la versión se publicó, la instalación, las pruebas con Vitest real y la compilación con los tipos reales de Phaser pasaron en GitHub Actions. No se ha visto el recuento de pruebas de esa ejecución.

## 6. Estado
- Entrega 1 de la Fase 1: **validada en Android; pendiente de aprobación final del director.**
- **La Fase 1 NO está cerrada:** faltan funciones de su plan (selección de casillas, panel territorial, países y fronteras, guardado y carga).
- La siguiente entrega **no está autorizada**.
