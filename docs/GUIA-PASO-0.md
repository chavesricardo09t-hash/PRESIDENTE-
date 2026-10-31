# Guía del Paso 0 (desde Chrome en Android, sin terminal)

Los nombres de botones de GitHub están en inglés. Consejo: en Chrome, menú ⋮ → **Sitio para ordenador**
(Desktop site) hace que GitHub muestre todas las opciones.

## A. Preparación (solo una vez)
1. **Crear el repositorio.** github.com → **+** → **New repository**. Nombre: `presidente`.
   Marca **Public** (GitHub Pages gratis exige repositorio público) y **Add a README file**. → **Create repository**.
2. **Activar Pages.** En el repositorio: **Settings** → **Pages** → en **Source** elige **GitHub Actions**.
3. **Crear el flujo.** Pestaña **Code** → **Add file** → **Create new file**.
   - En el nombre escribe exactamente: `.github/workflows/desplegar.yml` (al escribir `/` se crean las carpetas).
   - Pega el contenido de `desplegar.yml` que te dio Claude en el chat.
   - **Commit changes…** → **Commit directly to the main branch** → **Commit changes**.

## B. Subir el ZIP
1. Descarga el ZIP desde la tarjeta de archivo del chat con Claude (queda en Descargas).
2. En el repositorio: **Add file** → **Upload files** → **choose your files** → elige el ZIP.
3. Espera a que termine la subida → **Commit changes** (directo a `main`).

## C. Ver el resultado
1. Pestaña **Actions** → toca la ejecución más reciente (**Desplegar PRESIDENTE**).
2. Espera 1–3 minutos. ✅ verde = correcto, ❌ rojo = error.
3. Si es rojo: abre la ejecución, baja a **Summary** (resumen) y copia o captura el texto del error para Claude.
4. Si es verde: abre el enlace del trabajo **publicar** (github-pages) o ve a **Settings → Pages**.
   La dirección es `https://TU-USUARIO.github.io/presidente/`.

## D. Si el ZIP se subió antes de crear el flujo
Pestaña **Actions** → **Desplegar PRESIDENTE** → **Run workflow** → **Run workflow** (rama `main`).

## E. Si falla por permisos al guardar cambios
**Settings** → **Actions** → **General** → **Workflow permissions** → **Read and write permissions** → **Save**.
Después, **Actions** → ejecución fallida → **Re-run all jobs**.
