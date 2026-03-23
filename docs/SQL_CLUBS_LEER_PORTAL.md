# Portal sin nombre ni logo del club (solo “Portal club”)

Si en **`/club/`** ves **“Portal club”** y **no el logo**, pero **sí** entraste con **`club_admin`**, casi seguro **RLS** en Supabase **no deja leer** la tabla **`clubs`** con el usuario **autenticado** (`authenticated`). La app pide `nombre` y `logo_url` por API; si la política bloquea, no llega nada.

## Qué hacer (una vez)

**Supabase → SQL Editor → New query → Run:**

```sql
-- Lectura de clubs para usuarios logueados (JWT). Necesario para hero del portal.
DROP POLICY IF EXISTS "clubs_select_authenticated" ON public.clubs;
CREATE POLICY "clubs_select_authenticated"
  ON public.clubs
  FOR SELECT
  TO authenticated
  USING (true);
```

Si tu tabla **`clubs`** todavía **no tiene RLS activado**, este `CREATE POLICY` puede pedir antes:

```sql
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
```

Si al habilitar RLS **desaparece** todo el acceso, asegurate de tener también políticas que ya usabas (por ejemplo `anon` o `service_role`). En muchos proyectos existe ya `clubs_select_all` para `anon`; falta el equivalente para **`authenticated`**.

## Comprobar

Después de ejecutar el SQL, recargá **`https://decarambola.com/club/`** (mejor incógnito). Deberían cargarse **nombre** y **logo** desde la fila con tu **`codigo`** (ej. `MVIP-001`).
