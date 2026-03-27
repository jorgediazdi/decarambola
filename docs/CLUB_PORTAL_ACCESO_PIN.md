# Portal `/club/` — acceso abierto vs clave vs staff

## Estado actual (pruebas)

En `js/club-portal-gate.js`:

- `OPEN_ACCESS_PUBLIC = true` → el portal **no pide** login ni clave (para deploy y pruebas en Netlify).

## Cuando quieras pedir la clave del club

1. En el mismo archivo, poné:

   ```js
   const OPEN_ACCESS_PUBLIC = false;
   const CLOSED_ACCESS_MODE = 'pin';
   ```

2. La clave es la misma que el usuario define en **Inicio → “Soy administrador del club”** (se guarda en `localStorage` como `club_admin_pin`, igual que en `index.html`).

3. Tras un login correcto en esa sesión del navegador, se guarda `sessionStorage.club_portal_pin_ok` para no pedir la clave en cada recarga.

4. **Sin clave guardada** en el dispositivo: el portal muestra un mensaje con enlace a `/index.html` para definirla primero.

5. **Pruebas sin clave** (equipo): seguí usando `?dev=1` en `/club/` cuando el acceso no sea público (misma idea que el modo prueba anterior).

## Solo staff Supabase (sin PIN de app)

Si preferís el flujo anterior (solo sesión Supabase + `club_admin` / `superadmin`):

```js
const OPEN_ACCESS_PUBLIC = false;
const CLOSED_ACCESS_MODE = 'staff';
```

## Seguridad

El PIN en el cliente **no sustituye** políticas en servidor; sirve como capa de uso en el navegador. Para producción estricta, combiná con RLS y roles en Supabase.
