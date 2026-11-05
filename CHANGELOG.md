# Registro de cambios

## 0.1.0 — Fase 1, entrega 1: mapa isométrico y cámara táctil (pendiente de validar en Android)
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
