# QA — Portal club y sala (DeCarambola)

Checklist manual tras cada deploy (Netlify + Supabase). Marcar ✅ / ❌ y fecha.

## 1. Prerrequisitos Supabase

| # | Comprobación | OK |
|---|----------------|-----|
| 1.1 | Existe fila en `profiles` para el usuario staff (`id` = `auth.users.id`) | |
| 1.2 | `profiles.role` = `club_admin` o `superadmin` | |
| 1.3 | Si es `club_admin`: `profiles.club_id` = código del club (ej. `MVIP-001`) o UUID coherente con `clubs` | |
| 1.4 | Política RLS **`clubs_select_authenticated`** aplicada (ver `docs/SQL_CLUBS_LEER_PORTAL.md`) | |
| 1.5 | Fila en `clubs` con `codigo`, `nombre`, `logo_url` esperados | |

## 2. Portal `/club/` (hub)

| # | Paso | Esperado |
|---|------|----------|
| 2.1 | Sin sesión: abrir `https://TU-DOMINIO/club/` o `/club/index.html` | Pantalla de acceso (overlay), mensaje PIN no sustituye login, enlace a `auth.html` |
| 2.2 | Jugador sin rol staff: login y abrir `/club/` | “Sin permiso de staff” con rol mostrado |
| 2.3 | `club_admin` sin `club_id` | “Cuenta sin club” |
| 2.4 | Staff válido | Overlay desaparece; hero con **nombre** y **logo** del club (no “Portal club” genérico si hay datos en `clubs`) |
| 2.5 | `?dev=1` una vez | Acceso sin auth (solo pruebas); `sessionStorage` mantiene modo dev |
| 2.6 | Enlaces sala | Todos bajo **`/apps/club/sala/...`** (no `/club/sala/...` → 404) |
| 2.7 | TV | `/club/duelo_premium_tv.html` existe en repo |
| 2.8 | Scripts | `Version.js` → `whitelabel.js` → módulo `club-portal-gate.js` (orden en `club/index.html`) |

**Bug corregido (2026-03-12):** el HTML debe incluir `#club-access-gate`, `#club-gate-msg` y `#club-portal-main`; si faltan, el gate JS no oculta el hub y el portal queda **visible sin autenticación**.

## 3. Sala `apps/club/sala/*.html`

| # | Archivo | Gate `guardSalaPage` |
|---|---------|----------------------|
| 3.1 | `mesas.html` | ✅ |
| 3.2 | `reservas_admin.html` | ✅ |
| 3.3 | `historial_mesas.html` | ✅ |
| 3.4 | `mesas_config.html` | ✅ |
| 3.5 | `instalacion_ficha.html` | ⚪ Sin gate (página pública / QR por diseño; validar que no expone datos sensibles) |
| 3.6 | `tarifas_salon.html` | ✅ |
| 3.7 | `reportes.html` | ✅ |
| 3.8 | `admin_sede.html` | ✅ |
| 3.9 | `configurador_formato.html` | ✅ |
| 3.10 | `socios.html` | ✅ |

Sin sesión staff: overlay con mensaje y enlace a login (comportamiento de `sala-supabase-gate.js`).

## 4. Caché y versión

| # | Comprobación |
|---|----------------|
| 4.1 | `_headers`: `no-store` en `/club/*`, gates JS, `Version.js`, `/apps/club/sala/*` |
| 4.2 | Tras cambiar JS/HTML, subir **`Version.js`** para forzar recarga en clientes |

## 5. App principal + whitelabel

| # | Comprobación |
|---|----------------|
| 5.1 | Con `mi_perfil.club_id` y sesión Supabase, `whitelabel.js` actualiza **nombre + logo** desde `clubs` (no quedar nombre viejo en `wl_club_nombre`) |
| 5.2 | En `/club/` el whitelabel **no** pisa el h1 del hero (`esPortalClubHub`) |

## 6. Organizador

Enlaces desde portal a `/apps/club/organizador/...` — comprobar que esos archivos existen en el deploy (no duplicados rotos).

---

**Entorno:** probar siempre en **URL de producción** (no solo preview de editor): service worker y caché del navegador distorsionan resultados.
