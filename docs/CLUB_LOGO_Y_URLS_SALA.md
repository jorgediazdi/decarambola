# Logo del club, dueño vs admin y URLs del salón

Guía cuando hay **varios clubes** (billares / clubes) y querés **whitelabel (logo)** + **ambiente de mesas**.  
La **lógica recomendada**: el dueño **no** necesita saber de URLs ni tecnología; **vos** (admin plataforma o técnico) preparás la imagen para web y la montás en Supabase.

---

## Flujo sencillo (recomendado)

**Idea:** el administrador del billar solo te **manda la foto** (WhatsApp, correo, etc.). Vos la **adaptás para web**, la **subís** (ideal: **Supabase Storage**, bucket público) y dejás la **URL** guardada en el club.

| Quién | Qué hace |
|--------|-----------|
| **Dueño / club** (poco conocimiento técnico) | Te envía **una foto** del logo (foto del rótulo, imagen que tengan, etc.). No hace falta que sepan qué es una URL. |
| **Vos (admin plataforma / técnico)** | 1) Recortás y redimensionás (ej. cuadrado ~512×512 px). 2) Optimizás peso (PNG/WebP). 3) Subís a **Storage** (o CDN estable con HTTPS). 4) Copiás la URL pública y la cargás en el club (ver abajo). |

**Por qué es lógico:** la app solo necesita una **URL HTTPS estable** en `clubs.logo_url`; quién genera esa URL puede ser siempre la misma persona técnica. Así evitás pedirles “subí a Drive y pasame el enlace directo” si no lo van a saber hacer.

**Dónde pegar la URL en la app:** iniciá sesión con el **`club_admin`** de ese club → **Configurar sede** → `apps/club/sala/admin_sede.html` → campo **“O pega la URL del logo”** (o **Elegir imagen** para prueba local; en producción conviene URL en Storage) → **Guardar cambios** → queda en **`clubs.logo_url`** en Supabase.

---

## Alternativa: el dueño ya te manda una URL

Si alguien **sí** puede darte un enlace **HTTPS público** estable (web propia, archivo en Storage que subió otra persona técnica), podés pegarlo directo en **Configurar sede** sin reprocesar la imagen. Si el enlace caduca o no es público, el logo no se verá en la app.

---

## URLs fijas de la app (mismo sitio para todos los clubes)

Las rutas son **las mismas** para todos; lo que cambia es **qué usuario inicia sesión** (`profiles.club_id` = `clubs.codigo` — ver **`docs/CANON_CLUB_ID.md`**).

Sustituí **`https://TU-DOMINIO`** por tu dominio (Netlify, etc.):

| Uso | Ruta |
|-----|------|
| Portal club (menú) | `https://TU-DOMINIO/club/` |
| **Logo, nombre, color, código** | `https://TU-DOMINIO/apps/club/sala/admin_sede.html` |
| **Ambiente / plano de mesas** (asistente) | `https://TU-DOMINIO/apps/club/sala/mesas_config.html` |
| **Salón en vivo** | `https://TU-DOMINIO/apps/club/sala/mesas.html` |

Flujo típico para **armar el salón**: **admin_sede** (marca) → **mesas_config** → **mesas** (operación diaria).

---

## Varios clubes: qué identificador usar

1. **Supabase** → **Table Editor** → **`clubs`**: anotá **`codigo`** y **`nombre`** de cada uno.
2. El **`club_admin`** de cada club debe tener **`profiles.club_id` = ese `codigo`**.
3. No hace falta una URL de navegador distinta por club: definís el club por **sesión** (usuario correcto).

---

## Resumen en una línea

- **Club** → manda **foto**.  
- **Vos** → **web + Storage + URL** → **Configurar sede** → **Guardar**.  
- **Datos** → tabla **`clubs`**, campo **`logo_url`**.

---

## Referencia técnica

- Whitelabel: `whitelabel.js` (`wl_club_logo_url`, `mi_perfil.club_logo_url`).
- Sincronía `profiles.club_id` → localStorage al pasar el gate: `js/sala-supabase-gate.js`, `js/club-portal-gate.js`.
