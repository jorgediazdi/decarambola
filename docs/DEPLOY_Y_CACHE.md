# Deploy en Netlify y por qué “no se actualiza” el sitio

## Qué suele pasar

Subís cambios a GitHub, Netlify termina bien, pero **en el celular o el PC seguís viendo la versión vieja**. Causas típicas:

1. **Caché del navegador** o del **Service Worker** (`sw.js`).
2. **No subió `Version.js`** o no subiste **dos cosas a la vez** (ver abajo).
3. **Netlify CDN** (raro si ya pasaron minutos): usar **Clear cache and deploy**.

## Checklist en cada subida (recomendado)

1. **`Version.js`** — subir `APP_VERSION` (ej. fecha + número: `2026.03.12.108`).
2. **`index.html`** — subir el número en `sw.js?v=8` → `sw.js?v=9` (o el siguiente) **en el mismo commit** que el deploy.
3. Opcional: **`sw.js`** — si tocás lógica del worker, subir `CACHE_NAME` dentro del archivo.
4. Push a la rama que Netlify despliega y esperar el deploy **“Published”**.

## Si sigue igual después del deploy

- **Netlify** → tu sitio → **Deploys** → menú del último deploy → **Clear cache and deploy site** (vuelve a publicar sin caché del CDN).
- En el **navegador**: ventana **privada / incógnito**, o borrar datos del sitio para `decarambola.com`.
- En **Chrome (PC)**: F12 → Application → Service Workers → **Unregister**; Storage → Clear site data.

## Archivos que ya evitan caché agresiva

- `_headers` marca `no-cache` en `/`, `/index.html`, `/club/*`, `/Version.js`, `/sw.js`, `/apps/club/sala/*`, etc.

## Resumen en una línea

Cada deploy: **Version.js nuevo + `sw.js?v=` más alto en index.html** → push → si hace falta **Clear cache and deploy** en Netlify.
