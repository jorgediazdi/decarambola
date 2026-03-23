# Jugador vs portal del club — qué se oculta y qué exige login

## Objetivo

Que un **jugador** (socio que solo juega) **no vea** las pantallas de **gestión del club** (sala, tarifas, torneos staff, TV operativa, etc.) en la app principal ni entre al hub **`/club/`** sin permiso.

## Comportamiento actual

### 1. `index.html` (pestaña MI CLUB)

- **Oculto** para quien **no** es personal del club según el dispositivo:
  - tarjeta **Portal club** (`/club/`),
  - tarjeta del home que abre el panel de gestión,
  - bloque **“Portal del club”** (6 áreas + enlaces a sala/torneos),
  - **slide** de marca que llevaba al panel de gestión.
- Sigue visible para **afiliación**: unirse con código, crear club, mis clubes.
- Se considera **staff en este teléfono** si:
  - tiene un club en `mis_clubes` con **`admin: true`**, o
  - activó **“Soy administrador del club”** (PIN / modo admin), o
  - `?dev=1` (solo pruebas).

`session.js` actualiza `club_admin` en `localStorage` a partir de `mis_clubes`.

### 2. `club/index.html` (portal club pantalla completa)

Antes de mostrar el menú se comprueba:

1. **Sesión Supabase** y `profiles.role` ∈ `club_admin`, `superadmin` → **acceso** (`club_admin` debe tener **`club_id`** en `profiles`), o  
2. **`?dev=1`** / `sessionStorage` modo dev (solo pruebas).

El **PIN** en `index.html` **no** sustituye este login: solo afecta la **visibilidad** de tarjetas MI CLUB en la app principal.

Si no cumple: mensaje claro y enlaces a **app jugador**, **inicio** e **auth** (staff).

> Los **datos** sensibles en Supabase siguen acotados por **RLS**; esto suma **separación en la interfaz** y **bloqueo del HTML del portal** para cuentas de jugador.

### 3. Pantallas de sala / mesas (`apps/club/sala/*.html` y `mesas.html` en raíz)

Las pantallas sensibles (salón en vivo, configuración, reservas, socios, reportes, etc.) usan **`js/sala-supabase-gate.js`** (`guardSalaPage`): misma regla que el portal (**Supabase + rol staff**). La inicialización va en **`window.__salaBoot`**.

**Excepción deliberada:** `instalacion_ficha.html` (ficha pública / QR con `?id=`) no lleva este gate.

## Limitaciones (honestas)

- **RLS** sigue siendo la fuente de verdad en base de datos; el gate en el HTML evita UX confusa y reduce filtración de UI.
- La visibilidad con **PIN + localStorage** en `index.html` es conveniencia de UI; el **staff operativo** debe usar **Supabase Auth** + `profiles.role` para portal y sala.
