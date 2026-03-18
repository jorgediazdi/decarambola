# Supabase — Recomendaciones como experto

Ya utilizas Supabase por sugerencia del proyecto y tienes varias tablas. Aquí va un resumen de **buenas prácticas** y **siguientes pasos** para que la plataforma siga creciendo sin depender de localStorage.

---

## 1. Tablas que ya usas (resumen)

Por el código y los SQL del repo:

| Dominio | Tablas | Uso en core / app |
|--------|--------|--------------------|
| **Clubes** | `clubs` | Unirse por código, whitelabel (nombre, logo, color). |
| **Jugadores** | `jugadores` | MasterVIP: cargar, guardar, actualizar; sincroniza con localStorage. |
| **Torneos** | `torneos` | Crear, cargar, inscribir, generar rondas; sync con localStorage. |
| **Inscripciones** | (p. ej. `torneo_inscripciones` o `inscripciones`) | Inscritos por torneo, número de orden, estado. |
| **Partidas** | `partidas` | Registrar resultado de partida y actualizar torneo. |
| **Ranking** | `ranking_historico` | Historial de partidas/ranking. |
| **Mesas e instalaciones** | `mesas_config`, `mesas`, `mesas_reservas`, `mesas_historial`, `instalaciones_componentes`, `instalaciones_mantenimiento` | Salón, mesas, reservas, historial, mantenimiento. |

Falta (recomendado más abajo): **PQRS / contacto**.

---

## 2. Recomendaciones como experto

### 2.1 Supabase como fuente de verdad; localStorage como caché

- **Objetivo:** Que el día que uses backend “de verdad”, la app **no dependa de localStorage** para datos importantes.
- **Hoy:** `core.js` ya hace “Supabase primero y localStorage como respaldo” en jugadores y torneos (cargar desde nube, guardar en nube cuando hay ID). Está bien.
- **Siguiente paso:** En las pantallas críticas (control torneo, inscripciones, duelo que registra resultado), **llamar siempre a `cargarTorneosNube` / `cargarJugadoresNube` al abrir**, y escribir en Supabase en cada cambio importante. Así Supabase es la fuente de verdad y localStorage solo refleja lo último cargado o un respaldo offline.

### 2.2 Documentar el esquema en un solo sitio

- Tener **un único documento o script** que liste todas las tablas y columnas importantes (o un `schema.sql` que las cree en orden). Así tú y la IA saben qué hay.
- Agrupar por dominio: clubes, jugadores, torneos, inscripciones, partidas, ranking, mesas, pqrs.
- En este repo ya tienes `supabase_mesas_instalaciones.sql` y `supabase_mesas_url_camara.sql`. Puedes añadir, por ejemplo, `docs/SUPABASE_TABLAS.md` con una tabla resumen (nombre tabla, columnas clave, relación con la app).

### 2.3 Tabla para PQRS / contacto (Joe)

- Hoy los datos de Joe se guardan en **localStorage** (`PQRS_CONTACTOS`). Para no depender de localStorage y que el admin pueda ver todo en un solo lugar, conviene una tabla en Supabase, por ejemplo:

  - **`pqrs`** o **`contactos`**:  
    `id`, `nombre`, `contacto` (email o teléfono), `mensaje`, `tipo` (peticion|queja|reclamo|sugerencia), `estado` (pendiente_revision|autorizado|rechazado|cerrado), `respuesta_texto`, `respuesta_autorizada_at`, `created_at`, opcional `club_id`.

- En **Sensei.html** (flujo Joe): además de (o en lugar de) `localStorage`, hacer `INSERT` en esa tabla. El admin puede revisar y autorizar respuestas en Supabase o en un panel que lea esa tabla.

### 2.4 RLS (Row Level Security)

- En los SQL de mesas tienes políticas **“allow all”** con la anon key. Está bien para desarrollo o si no hay datos sensibles.
- Para **producción**, conviene restringir por `club_id` o por `auth.uid()` cuando uses Supabase Auth: que cada club solo vea sus jugadores, torneos, mesas, pqrs de su club, etc. Por ejemplo:
  - `using (club_id = current_setting('app.club_id')::text)` o
  - `using (auth.uid() = user_id)` si guardas `user_id` en cada fila.

Así, cuando tengas muchos clubes, un club no puede ver ni modificar datos de otro.

### 2.5 Claves (API keys)

- En el repo aparece una clave con prefijo `sb_publishable_...`. Asegúrate de que sea la **anon public key** (no la `service_role`). La `service_role` no debe estar nunca en el front ni en el repo.
- Si quieres rotar la anon key, se cambia en Supabase → Settings → API y en el código (core.js, whitelabel.js, index donde uses Supabase). Mejor tenerla en un solo lugar (p. ej. una variable global o un pequeño config.js) para no repetirla.

### 2.6 Índices

- En `supabase_mesas_instalaciones.sql` ya tienes buenos índices (`club_id`, `salon_id`, `estado`, etc.). Para el resto de tablas:
  - Índice por **`club_id`** en todas las tablas que filtren por club.
  - Índice por **`created_at`** (o `fecha`) donde hagas listados “últimos primero”.
  - En **partidas** y **inscripciones**, índice por `torneo_id` (o el nombre de columna que uses).

### 2.7 Migraciones ordenadas

- Si añades más tablas o columnas, mantener scripts SQL en el repo y un orden claro (ej. `01_clubs.sql`, `02_jugadores.sql`, … o un solo `schema.sql` actualizado). Así cualquier entorno (o un nuevo desarrollador) puede recrear el esquema sin depender de “lo que ya había creado a mano”.

### 2.8 Torneos e inscripciones

- Ya sincronizas torneos e inscripciones con Supabase (insert/update y carga). Para que **no dependas de localStorage**:
  - En **control_torneo** y **inscripciones**: al cargar la página, llamar `cargarTorneosNube()` (y si aplica recuperar inscritos) y trabajar sobre lo que devuelva Supabase.
  - Persistir en Supabase cada cambio de estado (inscripción, generación de llaves, resultado de partida). Así el “backend” es Supabase y localStorage es solo caché o respaldo de lectura.

---

## 3. Resumen práctico

| Qué | Acción sugerida |
|-----|------------------|
| Fuente de verdad | Supabase para clubes, jugadores, torneos, partidas, mesas, PQRS. localStorage solo caché/offline. |
| Esquema | Documentar todas las tablas en `docs/SUPABASE_TABLAS.md` (o similar) y mantener scripts SQL ordenados. |
| PQRS / Joe | Crear tabla `pqrs` o `contactos` en Supabase y que el flujo Joe escriba ahí (y opcionalmente siga guardando en localStorage como respaldo). |
| RLS | Mantener “allow all” solo en desarrollo; en producción, políticas por `club_id` o `auth.uid()`. |
| Claves | Usar solo anon key en el front; nunca service_role en el repo. |
| Índices | Asegurar `club_id`, `torneo_id`, `created_at` en tablas que se filtren o ordenen. |
| Carga inicial | En pantallas clave, cargar siempre desde Supabase al abrir (cargarTorneosNube, cargarJugadoresNube, etc.). |

Con esto, Supabase queda como el backend que evita depender de localStorage y te permite escalar a varios clubes y usuarios con datos consistentes y seguros.
