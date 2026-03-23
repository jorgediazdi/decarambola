# Prueba directa — **BILLARES MASTER V.I.P.** (`MVIP-001`)

Todo en **un solo lugar**: dominio **decarambola.com**.

---

## 1) Una vez en Supabase (SQL Editor)

**A)** Columnas y tipo texto para `club_id` (si aún no lo hiciste):

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'jugador';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS club_id TEXT;
UPDATE public.profiles SET role = 'jugador' WHERE role IS NULL;
ALTER TABLE public.profiles ALTER COLUMN club_id TYPE text USING (club_id::text);
```

**B)** Tu cuenta = admin de **Master VIP** (cambiá el email si no es el tuyo):

```sql
UPDATE public.profiles p
SET role = 'club_admin', club_id = 'MVIP-001'
FROM auth.users u
WHERE p.id = u.id
  AND u.email = 'jorgediazdi@gmail.com';
```

**Comprobar:**

```sql
SELECT p.id, u.email, p.role, p.club_id
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'jorgediazdi@gmail.com';
```

Debe salir: `role = club_admin`, `club_id = MVIP-001`.

---

## 2) En el navegador (orden)

| Paso | URL |
|------|-----|
| ① Entrar | https://decarambola.com/auth.html |
| ② Portal (debe verse **BILLARES MASTER V.I.P.** y logo si hay `logo_url`) | https://decarambola.com/club/ |
| ③ Configurar sede (nombre, color, logo) | https://decarambola.com/apps/club/sala/admin_sede.html |
| ④ Primera vez: crear mesas / salón | https://decarambola.com/apps/club/sala/mesas_config.html |
| ⑤ Salón en vivo (demo al dueño) | https://decarambola.com/apps/club/sala/mesas.html |

Cierra sesión solo con **Cerrar sesión** en `auth.html` si querés probar otra cuenta.

---

## 3) Qué debe verse

- **`/club/`**: título del hero = nombre en **`clubs.nombre`** para código **MVIP-001** (y logo si existe en **`clubs.logo_url`**).  
- **`admin_sede`**: mismos datos editables.  
- **`mesas`**: plano y estados de mesas de **ese** club.

---

## 4) Si el portal no muestra el nombre del billar

- Subí de nuevo el deploy (código con `js/club-portal-gate.js` que pinta el hero desde `clubs`).  
- En Supabase, fila **`clubs`** con **`codigo = MVIP-001`** debe tener **`nombre`** y opcional **`logo_url`**.
