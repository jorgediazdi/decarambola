# Esquema Supabase — columnas que usa el código (referencia)

Documentación **solo lectura**: inferida de `select` / `insert` / `update` / `upsert` en el repositorio. **No sustituye** introspección en el SQL Editor de Supabase ni migraciones aplicadas en tu proyecto.

Última revisión: análisis estático del código DeCarambola.

---

## `profiles`

**Uso típico:** identidad del usuario autenticado (`auth.users.id` = `profiles.id`), rol, club operativo, nombre para UI.

| Columna | Uso en código |
|---------|----------------|
| `id` | PK; FK lógica a `auth.users` |
| `email` | Migración inicial / trigger registro |
| `display_name` | Fallback de nombre (`index-v2.js`, auth) |
| `role` | `jugador`, `club_admin`, `superadmin`, `organizador` (según pantalla y migraciones) |
| `club_id` | Texto alineado con `clubs.codigo` — gates, portal, social, auth signup |
| `nombre_completo` | **Muy usado** en app (home, admin, organizador, perfiles); no está en la migración mínima `001_profiles_auth.sql` del repo → asumir columna en producción o añadir migración |
| `created_at` / `updated_at` | Convención habitual |

**Referencias:** `supabase/migrations/001_profiles_auth.sql`, `006`, `008`, `014`; `js/index-v2.js`, `js/auth-app.js`, `js/auth-manager.js`, `apps/sensei/index.html`, `apps/social/social-engine.js`.

---

## `retos`

**Uso típico:** retos caseritos / invitaciones; detalle en JSON; estado y vínculo a club.

| Columna | Uso en código |
|---------|----------------|
| `id` | PK (uuid habitual) |
| `codigo` | Código corto compartible (`reto_crear.html`) |
| `club_id` | Texto; `clubs.codigo` / `mi_perfil.club_id` |
| `retador_id` | UUID usuario retador |
| `retado_id` | UUID rival (nullable al crear) |
| `estado` | p. ej. `pendiente`, estados finalizados en `social-engine.js` |
| `detalle` | JSON: modalidad, meta, formato, fechaHora, retador, rival, handicap, bolsa, etc. (`reto_crear` → `sharePayload`) |
| `payload` | Alternativa a `detalle` en lecturas (`normalizeRetoRow`) |
| `meta` | A veces objeto o metadatos |
| `bolsa` | Texto / número según fila |
| `resultado` | Texto resultado |
| `ganador_nombre` | Post-resultado / cards |
| `score` | Marcador |
| `promedio_ganador` | Numérico |
| `created_at` / `updated_at` | Orden y realtime |

**Nota:** No hay `CREATE TABLE retos` en `supabase/migrations/` del repo; el shape sale de `reto_crear.html`, `jugador/index.html`, `js/api/jugador-api.js`, `apps/social/social-engine.js`.

---

## `jugadores`

**Uso típico:** ficha de jugador en club / ranking / portal; a menudo `id` = mismo UUID que usuario.

| Columna | Uso en código |
|---------|----------------|
| `id` | PK (uuid) |
| `nombre` | Listados, búsqueda, core |
| `alias` | `ranking.html` |
| `cedula` | Búsqueda (`getJugadorByCedula`, `duelo_premium_tv`) |
| `club_id` | Filtro club |
| `club` | Nombre club (texto) |
| `ciudad` | Ranking / filtros |
| `nacionalidad` | Ranking “país” |
| `categoria` | Ranking por categoría; `jugador/index.html` |
| `promedio` | numérico |
| `nivel` | `jugador/index.html` |
| `partidas` / `victorias` | Stats ranking |
| `foto_url` | Avatar / ranking |
| `activo` | `listJugadores`, `patchJugadoresInactivosAntes`, top por promedio |
| `whatsapp`, `pin`, `puntos` | Referenciados en `docs/SUPABASE_TABLAS.md` / core |
| `created_at` / `updated_at` | Orden y mantenimiento |

**Referencias:** `ranking.html`, `js/api/jugador-api.js`, `core.js`, `club/duelo_premium_tv.html`, `jugador/index.html`, `docs/SUPABASE_TABLAS.md`.

---

## Mantenimiento

- Si el proyecto Supabase difiere (columnas extra o nombres distintos), actualizar este archivo cuando cambie el código.
- Para DDL versionado, preferir migraciones en `supabase/migrations/` con `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` según reglas del proyecto.
