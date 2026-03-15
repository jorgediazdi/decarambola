# Subir la carpeta a Netlify (deploy automático)

## Opción A — Conectar con Git (recomendado, deploy automático)

1. Sube el proyecto a **GitHub**, **GitLab** o **Bitbucket** (si aún no está).
2. Entra en [app.netlify.com](https://app.netlify.com) e inicia sesión.
3. **Add new site** → **Import an existing project**.
4. Conecta el repositorio (GitHub/GitLab/Bitbucket) y elige el repo de DeCarambola.
5. Configuración de build (ya está en `netlify.toml`):
   - **Build command:** vacío (no hay build).
   - **Publish directory:** `.` (raíz del repo).
6. **Deploy site**.

Cada vez que hagas **push** a la rama conectada, Netlify volverá a desplegar solo.

---

## Opción B — Arrastrar la carpeta (manual)

1. Entra en [app.netlify.com](https://app.netlify.com).
2. **Add new site** → **Deploy manually**.
3. Arrastra la **carpeta del proyecto** (la que contiene `index.html`, `Sensei.html`, `core.js`, etc.) a la zona de drag & drop.

Cada despliegue nuevo hay que repetir el arrastre (no hay automático).

---

## Opción C — Netlify CLI (desde terminal)

```bash
# Instalar Netlify CLI (una vez)
npm install -g netlify-cli

# En la carpeta del proyecto (DE CARAMBOLA SUITE.)
cd "/Users/buysell/Desktop/DE CARAMBOLA SUITE."
netlify login
netlify init
# Elige "Create & configure a new site" y el equipo.
# Publish directory: . (o Enter para usar el actual)

# Para desplegar cada vez que quieras
netlify deploy --prod
```

Con `netlify init` ya vinculado al sitio, un **`netlify deploy --prod`** sube la carpeta actual a producción.

---

## Comprobar después del deploy

- La URL será algo como `https://nombre-random.netlify.app`.
- Abre `/` o `/index.html` y prueba: portales, Sensei, MI CLUB, etc.
- Si usas Supabase/APIs, las URLs ya están en el código; no hace falta cambiar nada por estar en Netlify.
