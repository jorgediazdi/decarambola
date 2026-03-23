# Demo para el dueño: logo (whitelabel) + sala en vivo

Guía **ordenada** para que **vos** configures todo, entrés con cuenta staff y **mostrés en vivo** al dueño del club/billar. Sustituí `TU-SITIO` por tu URL de Netlify (o dominio).

---

## Antes de la reunión (vos, 15–20 min)

### 1) Elegí el club de la demo

Anotá el **`codigo`** de ese club en Supabase → tabla **`clubs`** (ej. `MVIP-001`, `DECA01`).  
En esta app, el staff se liga por **`profiles.club_id` = ese `codigo`** (ver `docs/CANON_CLUB_ID.md`).

### 2) Usuario para entrar (Supabase Auth + perfil)

1. **Authentication → Users** → crear usuario (email + contraseña que recordés) o usar uno existente.
2. En **Table Editor → `profiles`**: para ese usuario (`id` = mismo UUID que en Auth, o por email si tenés la columna):
   - **`role`** = `club_admin`
   - **`club_id`** = texto **exacto** del **`codigo`** del club de la demo.

Si no existe fila en `profiles` para ese usuario, hay que crearla alineada con vuestro SQL de perfiles (`docs/ORDEN_SQL_OBLIGATORIO.md`).

### 3) Logo (whitelabel)

- Si en **`clubs.logo_url`** ya hay una URL pública HTTPS que cargue bien en el navegador → listo.
- Si no: subí el logo a **Storage** (bucket público) y actualizá **`clubs.logo_url`**, o entrá después a **Configurar sede** y pegá la URL.

---

## En la demo (con el dueño al lado)

### 4) Entrar como personal del club

1. Abrí: `https://TU-SITIO/auth.html`
2. Iniciá sesión con el **email y contraseña** del paso 2 (no es el `pin` de la tabla `clubs`).

### 5) Portal club (menú y confianza)

1. Abrí: `https://TU-SITIO/club/`
2. Debería verse el **menú del portal** (no el mensaje de “sin permiso”).
3. Contale en una frase: *“Esto es solo para el equipo del club; cada club ve lo suyo según la cuenta.”*

### 6) Marca del club (whitelabel)

1. Desde el portal, abrí **Configurar sede** o directo:  
   `https://TU-SITIO/apps/club/sala/admin_sede.html`
2. Mostrá **nombre, ciudad, color, preview del logo** y, si hace falta, pegá/ajustá **URL del logo** → **Guardar**.
3. Frase para el dueño: *“Tu logo y colores quedan guardados en la nube; la app puede mostrarlos en las pantallas que activemos.”*

### 7) Crear la “sala” (mesas)

1. Abrí: `https://TU-SITIO/apps/club/sala/mesas_config.html`
2. Completá pasos (nombre del salón, cantidad de mesas, filas/columnas o layout, metraje si querés).
3. **Guardar** → te lleva al salón en vivo (o abrí el enlace del paso 8).

### 8) Salón en vivo (lo más convincente)

1. `https://TU-SITIO/apps/club/sala/mesas.html`
2. Mostrá el **plano** con las mesas en **verde (libre)**.
3. Tocá una mesa → **Abrir sesión** (nombre de prueba) → mostrá **ocupada + cronómetro + costo**.
4. **Cerrar sesión** → vuelve a libre. Opcional: **reservada**, **mantenimiento**.

Eso demuestra **operación real**, no solo “una web bonita”.

### 9) (Opcional) App principal con marca

En otra pestaña / incógnito, si el jugador tiene club en `mi_perfil` / flujo de unión al club, abrí `index.html` y mostrá cómo **whitelabel.js** puede mostrar nombre/logo del club en cabeceras (según pantalla).

---

## Si algo falla (checklist rápido)

| Síntoma | Revisar |
|---------|---------|
| Portal pide login y no entrás | Email/contraseña en **Auth**; sesión iniciada en `auth.html` |
| “Sin permiso” en portal/sala | `profiles.role` = `club_admin` y `profiles.club_id` = **`clubs.codigo`** |
| No cargan mesas / vacío | Guardaste **mesas_config** con ese club; RLS y `club_id` en filas |
| Logo no se ve | URL **HTTPS** pública; abrila sola en el navegador |
| 404 en rutas | Deploy con sitio en **raíz** (`netlify.toml` `publish = "."`); rutas `/apps/...` |

---

## Frases cortas para convencer al dueño (guión)

1. *“Vos mandás el logo; nosotros lo dejamos en el sistema y se ve en las pantallas del club.”*  
2. *“Acá ves cada mesa: libre, ocupada, reserva o mantenimiento, en tiempo real desde el celular o la PC.”*  
3. *“Los datos quedan en la nube; después podés sumar torneos, jugadores y reportes sobre lo mismo.”*

---

## Documentos relacionados

- Logo / flujo dueño–técnico: `docs/CLUB_LOGO_Y_URLS_SALA.md`  
- Identificador de club: `docs/CANON_CLUB_ID.md`  
- Script consola clubes: `check_club.js` + `.env.example`
