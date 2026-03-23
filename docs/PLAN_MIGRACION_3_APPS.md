# Plan de migración — 3 aplicaciones · una base Supabase

## Fase 1 (hecha): hubs por URL

Se añadieron puntos de entrada estáticos que **no mueven** los `.html` existentes (cero rotura de enlaces actuales):

| Ruta publicada | Archivo | Propósito |
|----------------|---------|-----------|
| `/jugador/` | `jugador/index.html` | Hub app jugador → enlaces `../*.html` |
| `/club/` | `club/index.html` | Hub portal club → enlaces `../*.html` |
| `/admin/` | `admin/index.html` | Hub backoffice → `pqrs_admin.html` + aviso de auth futura |

En **`index.html`** (raíz) hay un bloque **“ACCESO DIRECTO POR ROL”** con enlaces a esas rutas.
Además, se dejó explícito el esquema solicitado:

- bloque **Jugador** (incluye Sensei),  
- bloque **Club**,  
- bloque **Organizador** dentro de Club,  
- **Contacto** visible en las 3 apps (`Sensei.html?contacto=1`).

**Deploy:** `netlify.toml` sigue con `publish = "."` — las carpetas nuevas se sirven automáticamente.

## Fase 2 (siguiente): auth y RLS

1. Supabase Auth (email magic link, OAuth opcional) con claims o tabla `profiles` + `app_role` (`jugador` | `club_staff` | `decarambola_staff`).
2. Sustituir gradualmente el uso de solo `anon` key en cliente por sesión del usuario donde haga falta escribir datos sensibles.
3. Ajustar `supabase_rls_produccion.sql` por `club_id` y rol.
4. Proteger `admin/*` y endpoints PQRS solo para `decarambola_staff`.

## Fase 3: código compartido

- Extraer de `core.js` módulos consumibles por las tres superficies (o monorepo con bundler).
- Mantener regla del inventario: lo **multi-perfil** → compartido o **vistas duplicadas por rol**, no borrar.

## Fase 4: despliegue opcional por subdominio

- `app.decar...` → solo assets app jugador + shared  
- `club.decar...` → portal club  
- `admin.decar...` → backoffice  

Requiere duplicar o filtrar `publish` / redirects en Netlify.

## Referencia

- Inventario clasificado: `INVENTARIO_ARQUITECTURA_ROLES.md`
