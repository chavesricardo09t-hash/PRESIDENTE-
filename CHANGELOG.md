# Registro de cambios

## 0.2.0 — Mundo rectangular explorable (pendiente de validar en Android)
Cambiado:
- Mundo rectangular de 64 columnas x 256 filas (16.384 casillas) en disposición escalonada: sin la forma de rombo.
- Cámara con límites reales: los bordes de la vista nunca salen de la zona cubierta (sin espacio vacío).
- Zoom 0,20–3,0 con mínimo efectivo ajustado a cada pantalla y al girar el teléfono.
- Generador de terreno: sin máscara de isla; agua coherente (sin charcas, mares, lagos, ríos y costas), proporciones exactas por tipo.
- Dibujo: recorrido por filas con rango casi exacto (1,06–1,60 casillas exploradas por visible, antes ~3), margen de caché ligado al zoom, cuadrícula recalculada.
- Informe y panel: muestran el zoom mínimo efectivo y el tamaño del mundo.
- Nombre de la caché sin conexión: presidente-v0.2.
Añadido: world/disposicion.ts (geometría escalonada, vecinos por arista), 64 pruebas automáticas.
No cambiado: gráficos y estilo isométrico, controles táctiles, medidor de FPS, diagnóstico, PWA, manifest, iconos, flujo de GitHub Actions.
Pendiente: validación en Android (docs/ENTREGA-2-V0.2.0.md). Rendimiento a zoom 0,20 sin medir en dispositivo.

## Documentación (sin cambios de código) — registro de validación de la 0.1.0
- Añadidos `docs/VALIDACION-ENTREGA-1.md` e `docs/INFORME-FINAL-ENTREGA-1.md`.
- Actualizados el estado en README, ENTREGA-1 y PRUEBAS (los resultados anteriores se conservan).

## 0.1.0 — Fase 1, entrega 1: mapa isométrico y cámara táctil (validada en Android, 7 de 7; pendiente de aprobación final)
Añadido:
- Phaser 3.90 como dependencia (^3.90.0).
- Mapa isométrico 128x128 con 7 terrenos, árboles, colinas y montañas, generado con semilla.
- Generador por percentiles de elevación (proporciones fijas con cualquier semilla).
- Dibujo eficiente: solo las casillas visibles (reserva de imágenes reutilizables).
- Cámara táctil: arrastre con un dedo y zoom por pellizco (0,4–3); rueda del ratón para pruebas en ordenador.
- Cuadrícula activable.
- Medidor de FPS real (promedio y mínimo en 5 s y total) y botón de informe copiable.
- Panel de diagnóstico accesible desde el juego (contenido del Paso 0).
- Arquitectura por capas (core, world, render, ui, pwa), bus de eventos y registro de módulos para fases futuras.
- 49 pruebas automáticas (ver docs/PRUEBAS-ENTREGA-1.md).
Cambiado:
- main.ts del Paso 0 reorganizado en módulos pwa/ y ui/ sin cambiar su comportamiento.
- Nombre de la caché sin conexión: presidente-v0.1 (cambiarlo en cada versión limpia archivos viejos).
No cambiado: flujo de GitHub Actions, manifest, iconos, lógica del Service Worker.
No incluido (siguientes entregas): selección de casillas, panel territorial, países, fronteras, guardado.

## 0.0.2 — Corrección del Paso 0
- La ejecución #1 de Actions falló en «Instalar dependencias» con un error interno de npm (edgesOut).
- Se añade `.npmrc` con `legacy-peer-deps=true` como primer intento de corrección.
- Pendiente de validar en Actions.

## 0.0.1 — Paso 0 (preparado, pendiente de validación)
- Proyecto mínimo: TypeScript 6, Vite 8, Vitest 4.
- Página de diagnóstico con informe copiable, detección de instalación y estado sin conexión.
- Manifest, iconos y Service Worker de prueba.
- Flujo de GitHub Actions: importar ZIP, instalar, probar, compilar y publicar en Pages.
- Documentación y lista de verificación para Android.

Estado: NO validado hasta que Actions termine en verde y la página abra en Android.
