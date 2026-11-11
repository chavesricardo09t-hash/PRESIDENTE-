# Informe final — Fase 1, Entrega 1 (v0.1.0)

**Mapa isométrico básico con Phaser, terrenos, cuadrícula, cámara táctil y medidor de FPS.**
Estado: validada en Android (7 de 7), lista para la aprobación final del director.

## Entregado
- Mapa isométrico de 128×128 casillas con semilla reproducible (20261031).
- 7 terrenos con proporciones fijas por percentiles; árboles, colinas y montañas con nieve dibujados por código.
- Dibujo eficiente: solo la zona visible más un margen.
- Cámara táctil: arrastre con un dedo y zoom por pellizco (0,4–3).
- Cuadrícula activable, medidor de FPS e informe copiable.
- Panel de diagnóstico del Paso 0 (Service Worker, sin conexión, instalación).
- Arquitectura por capas lista para fases futuras (bus de eventos y registro de módulos, sin implementar ninguna fase).

## Resultados
- Pruebas automáticas: 49, 0 fallos (ejecutor local que simula Vitest; Vitest real corrió en Actions, evidencia indirecta).
- Pruebas manuales en Android: 7 de 7 satisfactorias (reportadas por el director).
- Rendimiento real a zoom mínimo: 59,5 FPS promedio, 56,5 FPS mínimo en 5 s, 14 MB de memoria JS.
- Detalle completo: `docs/VALIDACION-ENTREGA-1.md` y `docs/PRUEBAS-ENTREGA-1.md`.

## Conservado
Flujo de GitHub Actions, manifest, iconos y lógica del Service Worker sin cambios (solo el nombre de la caché).

## Limitaciones conocidas
- Sin selección de casillas, panel territorial, países, fronteras ni guardado: son las siguientes entregas.
- Sin inercia al soltar el arrastre ni detección de «toque».
- Los archivos eliminados entre versiones no se borran solos del repositorio.
- Causa de 4 fotogramas largos sin determinar (sin impacto percibido).

## Siguiente paso
Esperar la aprobación final. No se avanza sin autorización expresa. Según el plan, la candidata natural es la selección de casillas con panel territorial, pero no está autorizada.
