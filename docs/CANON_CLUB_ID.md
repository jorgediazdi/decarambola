# Regla única: identificador de club

## Qué usar siempre

| Campo | Valor |
|--------|--------|
| `profiles.club_id` | **`clubs.codigo`** (mismo texto que en la tabla `clubs`) |
| `mesas.club_id` | **`clubs.codigo`** |
| `mesas_config.club_id` | **`clubs.codigo`** |

No uses en un sitio el **UUID** (`clubs.id`) y en otro un **nombre** o **código distinto**. Si en el pasado guardaste `clubs.id` como texto, ejecuta **`supabase/migrations/005_unificar_club_codigo.sql`**: intenta alinear todo a **`codigo`**.

## Qué hace Cursor / el repo

- **No** ejecuta SQL en tu proyecto Supabase.
- **Sí** te deja archivos `.sql` listos para que **tú** des **Run** en el SQL Editor.

**Orden mínimo:** si falta la tabla `profiles`, primero **`001_profiles_auth.sql`** — ver **`docs/ORDEN_SQL_OBLIGATORIO.md`**.

## Orden recomendado

1. `001_profiles_auth.sql` (si aplica)
2. `supabase_mesas_instalaciones.sql` (mesas, etc.)
3. `002` / `003` columnas
4. `004_mesas_rls_paso1.sql`
5. **`005_unificar_club_codigo.sql`** (una vez, para rellenar y normalizar `club_id`)

## Comprobar

```sql
SELECT codigo, nombre FROM clubs WHERE activo = true;

SELECT id, email, role, club_id FROM profiles;

SELECT id, numero, club_id FROM mesas;
```

Los `club_id` visibles deben coincidir con **`clubs.codigo`** (mismo string).
