# SQL en Supabase — comprobar y corregir (mesas / salón)

En **Supabase → SQL → New query**. Primero **comprobar**; si falta algo, **corregir** con el script del repo.

---

## 1) Comprobar que existen las columnas nuevas (`010`)

```sql
-- Columnas en public.mesas (mapa + cámara)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mesas'
  AND column_name IN ('posicion_x', 'posicion_y', 'url_camara', 'urls_camaras')
ORDER BY column_name;
```

**Esperado:** al menos `posicion_x`, `posicion_y`, `url_camara`.  
Si usás varias URLs por mesa, también `urls_camaras` (viene de `supabase_mesas_url_camara.sql` si lo corriste).

```sql
-- Columna en historial de sesiones
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mesas_historial'
  AND column_name = 'tarifa_aplicada';
```

**Esperado:** una fila `tarifa_aplicada` tipo `jsonb`.

```sql
-- Vista de integración
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'sesiones_mesa';
```

**Esperado:** una fila `sesiones_mesa`.

---

## 2) Comprobar datos (por qué “no veo mesas” en la app)

```sql
-- ¿Hay mesas y con qué club_id?
SELECT id, numero, nombre, club_id, estado
FROM public.mesas
ORDER BY numero
LIMIT 50;
```

```sql
-- Tu usuario (sustituí el email si querés filtrar)
SELECT id, email
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

```sql
-- Perfil: role y club_id deben coincidir con mesas.club_id (mismo texto)
SELECT id, role, club_id
FROM public.profiles
LIMIT 20;
```

**Regla:** si RLS está activo (`004_mesas_rls_paso1.sql`), un `club_admin` solo ve filas donde  
`trim(mesas.club_id) = trim(profiles.club_id)`.  
Si `profiles.club_id` es NULL o distinto al de las mesas → **lista vacía** (no es bug de SQL suelto, es coherencia de datos).

---

## 3) Corregir esquema (si falta columna o vista)

**Opción A — Solo lo del módulo mapa / tarifa / vista**

Copiá y ejecutá **todo** el contenido del archivo del repo:

`supabase/migrations/010_mesas_mapa_posicion_tarifas.sql`

Es idempotente: `ADD COLUMN IF NOT EXISTS` y `CREATE OR REPLACE VIEW`.

**Opción B — También `urls_camaras` (varias cámaras por mesa)**

Ejecutá además (o el archivo completo):

`supabase_mesas_url_camara.sql`

**Opción C — Perfiles sin `role` / `club_id`**

Si el error dice que falta columna en `profiles`:

`supabase/migrations/006_profiles_add_role_club_id.sql`

---

## 4) Corregir datos (sin tocar RLS)

Si las mesas tienen `club_id = 'ABC'` y tu perfil tiene `club_id = 'XYZ'`:

```sql
-- SOLO si sabés que es correcto unificar (ejemplo ilustrativo)
-- UPDATE public.profiles SET club_id = 'ABC' WHERE id = 'UUID-DEL-USUARIO';
```

O al revés: actualizar `mesas.club_id` al código canónico del club. **No ejecutes UPDATE a ciegas** en producción sin confirmar el código del club.

---

## 5) Comprobar políticas RLS (referencia)

```sql
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('mesas', 'mesas_historial')
ORDER BY tablename, policyname;
```

Si algo falla al **leer** mesas con usuario autenticado, revisá `004_mesas_rls_paso1.sql` y que `profiles.role` sea `club_admin` o `superadmin` y `club_id` alineado.

---

## Resumen rápido

| Síntoma | Qué hacer |
|---------|-----------|
| Faltan columnas / vista | Ejecutar `010_mesas_mapa_posicion_tarifas.sql` |
| Falta `urls_camaras` | Ejecutar `supabase_mesas_url_camara.sql` |
| Mesas en SQL sí hay, app vacía | Revisar `profiles.club_id` vs `mesas.club_id` |
| Error “column role does not exist” | Ejecutar `006_profiles_add_role_club_id.sql` |

Índice general: `docs/ARRANQUE_OPERACION_SALON.md`.
