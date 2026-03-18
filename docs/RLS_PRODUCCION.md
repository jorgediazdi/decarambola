# RLS en producción — Supabase

Guía para restringir el acceso por **club** usando Row Level Security (RLS). Así cada club solo ve y modifica sus propios datos.

---

## Situación actual

- La app usa la **anon key** de Supabase; no hay Supabase Auth todavía.
- En desarrollo hay políticas **"allow all"** (todas las tablas con RLS permiten todo al anon).
- La app ya filtra por `club_id` en las peticiones (p. ej. `?club_id=eq.xxx`), pero un cliente malintencionado podría cambiar ese filtro.

---

## Estrategia en dos fases

### Fase 1 (hoy): sin Auth

- **No ejecutes** todavía `supabase_rls_produccion.sql` (rompería la app, porque no hay JWT con `club_id`).
- Asegúrate de que en la app **siempre** se envíe `club_id` en los filtros y en los INSERT (desde `mi_perfil.club_id` o `wl_club_id`).
- Mantén las políticas actuales "allow all" en las tablas que ya tienen RLS (mesas_*, pqrs).

### Fase 2: con Supabase Auth

Cuando añadas **login con Supabase Auth** (email/contraseña o magic link):

1. **Al hacer login**, guarda el club del usuario en el JWT. Por ejemplo en un **Auth Hook** (Supabase Dashboard → Authentication → Hooks) o al registrar/iniciar sesión, asigna:
   - `app_metadata.club_id` = UUID del club del jugador/organizador (desde `mi_perfil.club_id` o equivalente).
2. **Ejecuta** el script `supabase_rls_produccion.sql` en el SQL Editor de Supabase.
3. Ese script:
   - Habilita RLS en las tablas que falten (clubs, jugadores, torneos, inscripciones, partidas, ranking_historico, etc.).
   - **Elimina** las políticas "allow all".
   - **Crea** políticas que exigen `auth.jwt() -> 'app_metadata' ->> 'club_id'` igual al `club_id` de la fila (o, en `clubs`, al `id` del club).

Así, aunque el cliente envíe otro `club_id` en la URL, Postgres solo devuelve o permite modificar filas del club que viene en el JWT.

---

## Tablas y tipo de `club_id`

| Tabla                    | Columna `club_id` | Notas |
|--------------------------|-------------------|--------|
| clubs                    | id (no club_id)   | SELECT permitido a todos (unirse por código); PATCH/INSERT restringidos a propio club vía JWT. |
| jugadores                | uuid              | Solo filas del club del JWT. |
| torneos                  | uuid              | Solo filas del club del JWT. |
| inscripciones            | uuid              | Solo filas del club del JWT (o vía torneo del club). |
| partidas                 | uuid/text         | Solo filas del club del JWT. |
| ranking_historico        | uuid/text         | Solo filas del club del JWT. |
| mesas_config, mesas, …   | text              | Solo filas donde club_id = JWT club_id (text). |
| pqrs                     | text (opcional)   | Superadmin puede ver todos; club solo los suyos si se usa club_id. |

---

## Cómo obtener `club_id` en el JWT (Fase 2)

- Con **Supabase Auth**: tras el login, actualiza el usuario con `app_metadata`:
  - Desde el backend (Edge Function o tu API): `supabase.auth.admin.updateUserById(id, { app_metadata: { club_id: 'uuid-del-club' } })`.
  - O con un **Auth Hook** (Database Webhook o Edge Function on auth) que lea el club desde una tabla `usuarios` o `jugadores` y actualice `app_metadata`.
- La app ya tiene `mi_perfil.club_id` / `wl_club_id` en localStorage; cuando implementes login, en el primer inicio de sesión envía ese `club_id` al backend para que lo guarde en `app_metadata`.

---

## Resumen

| Qué | Cuándo |
|-----|--------|
| Mantener "allow all" y filtrar por club_id en la app | Fase 1 (sin Auth). |
| Añadir Supabase Auth y guardar club en app_metadata | Al implementar login. |
| Ejecutar `supabase_rls_produccion.sql` | Solo después de tener Auth y club_id en el JWT. |

Para más contexto de tablas y uso en la app, ver `docs/SUPABASE_TABLAS.md` y `docs/SUPABASE_RECOMENDACIONES_EXPERTO.md`.
