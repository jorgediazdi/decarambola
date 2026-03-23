# Perfil en Supabase (`profiles`)

## Si ves: **«Falta fila en profiles»** (después de iniciar sesión en `auth.html`)

Tu correo **sí existe** en **Authentication**, pero en la tabla **`public.profiles`** no hay una fila con tu **`id`**. La app necesita esa fila.

### Solución en 1 paso (recomendada)

1. **Supabase** → **SQL** → **New query**.
2. Pegá y ejecutá **todo** el contenido de:

   **`supabase/migrations/008_backfill_profiles_desde_auth.sql`**

   (En el repo: crea una fila `jugador` para **cada** usuario de Auth que aún no tenga perfil.)

3. **Run**. Debería decir que insertó al menos **1 fila** (o `INSERT 0 0 N` con N ≥ 1 según el cliente).

4. Cerrá sesión en **`auth.html`**, volvé a entrar con correo y clave, y abrí de nuevo **`/club/`**.

### Si además sos staff del club (`club_admin`)

Cuando ya exista tu fila en `profiles`, ejecutá el **UPDATE** con tu correo (vía `auth.users`) del apartado **Paso B** más abajo, o leé **`docs/CANON_CLUB_ID.md`** para el `club_id` correcto.

---

## Si ves error: `column "email" does not exist`

En muchos proyectos **`public.profiles` no tiene columna `email`**.  
**No uses** `WHERE email = '...'` sobre `profiles` en el UPDATE; usá el **JOIN con `auth.users`** como en los ejemplos de abajo.

### Paso A — Ver tu usuario y UUID (opcional)

```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 15;
```

Anotá tu **`id`** (UUID) y tu **`email`**.

### Paso B — Asignar staff usando el correo (recomendado)

Sustituí **`TU_CORREO_REAL`** y **`MVIP-001`** (por el `codigo` real de tu tabla `clubs`).

```sql
UPDATE public.profiles AS p
SET
  role = 'club_admin',
  club_id = 'MVIP-001'
FROM auth.users AS u
WHERE p.id = u.id
  AND u.email = 'TU_CORREO_REAL';
```

- Debe afectar **1 fila**. Si **0 filas**, primero ejecutá **`008_backfill_profiles_desde_auth.sql`**.

### Paso C — Mismo resultado usando solo el UUID

1. **Authentication** → **Users** → copiá **User UID**.
2. Pegalo en:

```sql
UPDATE public.profiles
SET role = 'club_admin', club_id = 'MVIP-001'
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

### Paso D — Crear fila manual (si el backfill no aplica)

```sql
INSERT INTO public.profiles (id, role, club_id)
SELECT u.id, 'club_admin', 'MVIP-001'
FROM auth.users u
WHERE u.email = 'TU_CORREO_REAL'
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role, club_id = EXCLUDED.club_id;
```

---

## Si falta la columna `role` o `club_id`

Ejecutá una vez **`supabase/migrations/006_profiles_add_role_club_id.sql`**.

## Comprobar `club_id`

```sql
SELECT codigo, nombre FROM public.clubs;
```

Ver **`docs/CANON_CLUB_ID.md`**.

## Después

Recargá **`/club/`** con sesión en **`auth.html`**.
