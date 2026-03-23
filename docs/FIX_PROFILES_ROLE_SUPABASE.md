# Error: `column profiles.role does not exist`

El portal (`/club/`) y la sala leen **`profiles.role`** y **`profiles.club_id`**. Si tu tabla `profiles` se creó antes o a mano **sin esas columnas**, PostgREST devuelve ese error.

## Qué hacer (2 minutos)

1. **Supabase** → **SQL Editor** → **New query**.
2. Abrí y pegá el contenido de **`supabase/migrations/006_profiles_add_role_club_id.sql`** (o copialo desde el repo).
3. **Run**.

4. Asigná tu usuario como admin del club.

**Si `profiles` tiene columna `email`:**

```sql
UPDATE public.profiles
SET role = 'club_admin', club_id = 'MVIP-001'
WHERE email = 'jorgediazdi@gmail.com';
```

**Si da error “column email does not exist”** (tu `profiles` solo tiene `id`, etc.), usá el correo vía **`auth.users`**:

```sql
UPDATE public.profiles p
SET role = 'club_admin', club_id = 'MVIP-001'
FROM auth.users u
WHERE p.id = u.id
  AND u.email = 'jorgediazdi@gmail.com';
```

**O por UUID:** en **Authentication → Users** copiá el **User UID** y:

```sql
UPDATE public.profiles
SET role = 'club_admin', club_id = 'MVIP-001'
WHERE id = 'PEGA-AQUI-EL-UUID';
```

5. Recargá **`https://decarambola.com/club/`** (con sesión iniciada en `auth.html`).

## Auth: ¿está bien la pantalla de sesión activa?

Sí. Ver **“Sesión activa”** y tu correo en **`auth.html`** significa que **Supabase Auth** funciona. El fallo del portal era solo la **tabla `profiles`** incompleta.
