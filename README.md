# PRESIDENTE

Simulador de civilización, sociedad, gobierno, economía, ciudades, deportes y medios (PWA para Android).

**Estado actual: v0.2.0 (mundo rectangular explorable), pendiente de validar en Android.** La v0.1.0 está validada (7 de 7); la Fase 1 sigue abierta.
Paso 0 completado y validado. Cada entrega y cada fase avanzan solo con autorización expresa del director del proyecto.
Ver `docs/ENTREGA-2-V0.2.0.md`, `docs/PRUEBAS-V0.2.0.md`, `docs/ARQUITECTURA.md`, y de la v0.1.0: `docs/VALIDACION-ENTREGA-1.md`.

## Historial: qué validó el Paso 0
1. Subir un ZIP desde el teléfono a GitHub, sin terminal.
2. GitHub Actions descomprime, instala dependencias, ejecuta una prueba automática y compila.
3. La página compilada se publica en GitHub Pages (https).
4. La página se abre y se puede instalar como PWA en Android, y abre sin conexión.

## Estructura
Ver `docs/ARQUITECTURA.md` (capas core, world, render, ui, pwa).

## Flujo de trabajo
Claude prepara un ZIP → el director lo sube al repositorio → `desplegar.yml` (GitHub Actions) lo
extrae, prueba, compila y publica → el director abre la URL en su Android y reporta.

- El ZIP subido se elimina del árbol de trabajo tras importarse, pero **queda en el historial de Git** como copia de seguridad.
- El ZIP nunca puede modificar `.github/` (GitHub no lo permite al bot y además se excluye a propósito).
  Los cambios del flujo de Actions se hacen a mano, siguiendo `docs/GUIA-PASO-0.md`.

## Comandos (solo para quien tenga terminal; el director NO los necesita)
`npm install` · `npm test` · `npm run build` · `npm run dev`

## Limitaciones conocidas
- Los archivos eliminados entre versiones no se borran del repositorio automáticamente.
- El Service Worker es simple (red primero, caché de respaldo). Cambia `NOMBRE_CACHE` en `public/sw.js` y `src/pwa/pwa.ts` en cada versión.
