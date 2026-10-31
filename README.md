# PRESIDENTE

Simulador de civilización, sociedad, gobierno, economía, ciudades, deportes y medios (PWA para Android).

**Estado actual: PASO 0 — verificación del flujo de trabajo.** Todavía no hay videojuego.
La Fase 1 no ha comenzado y no empezará sin autorización expresa del director del proyecto.

## Qué valida el Paso 0
1. Subir un ZIP desde el teléfono a GitHub, sin terminal.
2. GitHub Actions descomprime, instala dependencias, ejecuta una prueba automática y compila.
3. La página compilada se publica en GitHub Pages (https).
4. La página se abre y se puede instalar como PWA en Android, y abre sin conexión.

## Estructura
```
index.html                  Entrada de la página
src/main.ts                 Interfaz de diagnóstico (no es el juego)
src/verificacion.ts         Lógica pura probada automáticamente
src/verificacion.test.ts    Prueba automática (Vitest)
src/globals.d.ts            Constantes de compilación
public/manifest.webmanifest Manifest PWA (prueba)
public/sw.js                Service Worker de prueba
public/icon-*.png           Iconos de prueba
vite.config.ts, tsconfig.json, package.json
docs/                       Guías, lista de verificación y copia del flujo de Actions
```

## Flujo de trabajo
Claude prepara un ZIP → el director lo sube al repositorio → `desplegar.yml` (GitHub Actions) lo
extrae, prueba, compila y publica → el director abre la URL en su Android y reporta.

- El ZIP subido se elimina del árbol de trabajo tras importarse, pero **queda en el historial de Git** como copia de seguridad.
- El ZIP nunca puede modificar `.github/` (GitHub no lo permite al bot y además se excluye a propósito).
  Los cambios del flujo de Actions se hacen a mano, siguiendo `docs/GUIA-PASO-0.md`.

## Comandos (solo para quien tenga terminal; el director NO los necesita)
`npm install` · `npm test` · `npm run build` · `npm run dev`

## Limitaciones conocidas del Paso 0
- Los archivos eliminados entre versiones no se borran del repositorio automáticamente.
- El Service Worker es solo de prueba (red primero, caché de respaldo).
