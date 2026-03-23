# Paso 1 aplicado — Mesas con Auth + RLS por club

## Qué hicimos

1. **`profiles.club_id`** (texto) — debe ser **el mismo valor** que **`mesas.club_id`** de ese club.
2. **Políticas RLS en `mesas`** — rol **`anon`** ya no puede leer ni tocar mesas (solo **`authenticated`** con permiso).
3. **Quién puede:**
   - **`superadmin`**: todas las mesas.
   - **`club_admin`** con `club_id` definido: solo mesas cuyo `club_id` coincide.

## Qué debes hacer en Supabase (una vez)

1. Ejecuta **`004_mesas_rls_paso1.sql`** en el SQL Editor.
2. Ejecuta **`005_unificar_club_codigo.sql`** (rellena `club_id` en mesas desde el salón y convierte `clubs.id`→`codigo` donde aplique). Regla única: **`docs/CANON_CLUB_ID.md`**.
3. Asigna tu usuario de prueba (**`club_id` = mismo texto que `clubs.codigo`**, no otro idioma de códigos):

```sql
UPDATE public.profiles
SET role = 'club_admin',
    club_id = (SELECT codigo FROM public.clubs WHERE activo = true LIMIT 1)
WHERE email = 'tu@correo.com';
```

(o pon manualmente `'DEMO-CLUB'` si ese es tu `clubs.codigo`)

4. Si tras `005` aún ves **0 mesas**, revisa `SELECT id, numero, club_id FROM mesas` y que coincida con `profiles.club_id`.

## Uso en la web

1. Entra en **`auth.html`** e inicia sesión.
2. Abre **`index.html`** y baja a **Administración de mesas** — debe cargar con tu JWT.

## Aviso: otras pantallas

**`mesas.html`** y **`core.js`** siguen usando la **anon key** en REST: **dejarán de ver/actualizar `mesas`** hasta que también usen sesión o un backend. El panel del **index** ya usa `supabase-client.js` con sesión.
