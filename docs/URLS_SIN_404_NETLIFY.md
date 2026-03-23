# Si ves “Página no encontrada” en sala / apps

## URLs correctas (con **`apps`** en el medio)

Las pantallas de mesas **no** están bajo `/club/sala/…`, sino:

| Pantalla | URL correcta |
|----------|----------------|
| Salón en vivo | `https://decarambola.com/apps/club/sala/mesas.html` |
| Configurar sede | `https://decarambola.com/apps/club/sala/admin_sede.html` |
| Configurar mesas | `https://decarambola.com/apps/club/sala/mesas_config.html` |
| Reservas | `https://decarambola.com/apps/club/sala/reservas_admin.html` |

**Incorrecto:** `https://decarambola.com/club/sala/mesas.html` → suele dar **404**.

## Deploy en Netlify

- **Publish directory:** raíz del repo (donde está `index.html`, carpeta **`apps/`**, **`club/`**, etc.).
- Si subís solo una subcarpeta y **no** incluye `apps/club/sala/`, esas URLs no existirán → 404.

## Incluir `.html` si hace falta

Usá siempre **`…/archivo.html`** como en la tabla (Netlify sirve el archivo tal cual).
