# Orden obligatorio de SQL en Supabase

## Un solo archivo para copiar (001–005)

Si no quieres abrir cada carpeta/archivo por separado, abre **`supabase/CORRER_MIGRACIONES_001_005.sql`**: **Cmd+A** → **Cmd+C** → pega en Supabase SQL Editor → **Run**.  
Antes, si no tienes tablas `mesas` / `mesas_config`, ejecuta aparte **`supabase_mesas_instalaciones.sql`** (raíz del proyecto).

## Error: `relation "public.profiles" does not exist`

Significa que **aún no ejecutaste** la migración que **crea** la tabla `profiles`.

**Solución:** en el SQL Editor, ejecuta **primero**:

1. **`supabase/migrations/001_profiles_auth.sql`** — crea `profiles`, trigger al registrarse, RLS básico.

Después (en el orden que ya venías usando):

2. `supabase_mesas_instalaciones.sql` (si aplica)
3. `002_mesas_luz_encendida.sql`
4. `003_mesas_hora_apertura.sql`
5. `004_mesas_rls_paso1.sql`
6. `005_unificar_club_codigo.sql`

**Nunca** ejecutes `UPDATE public.profiles ...` hasta que el paso **1** haya terminado sin error.

## Comprobar que existe

```sql
SELECT * FROM public.profiles LIMIT 1;
```

Si falla, falta crear la tabla → vuelve al paso **001**.

## Usuario en Auth pero “Falta fila en profiles”

Si **`001`** ya se ejecutó pero creaste usuarios **antes** del trigger o el trigger falló: ejecutá **`supabase/migrations/008_backfill_profiles_desde_auth.sql`** una vez. Ver **`docs/FIX_PROFILES_ROLE_SUPABASE.md`**.
