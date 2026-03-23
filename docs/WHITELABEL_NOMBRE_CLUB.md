# Nombre del club en portada (“MASTER PRUEBA JH”, etc.)

## Qué pasa

- La portada (`index.html`) guarda **nombre y logo** en **`localStorage`** (`wl_club_nombre`, …).
- Si alguna vez probaste con datos de demo, puede quedar **texto viejo** hasta que:
  - **Supabase** devuelva el nombre real de la tabla **`clubs`**, y
  - el navegador tenga **`club_id`** coherente (en **`mi_perfil`**, rellenado al iniciar sesión como staff).

## Comportamiento actual (código)

1. Si hay **sesión Supabase**, se lee **`profiles.club_id`** y se pide **`clubs`** para **pisar** caché con el nombre oficial.
2. Tras cargar el club, se dispara un evento que **vuelve a pintar** el slider y la sede en la portada.
3. **Sin sesión**, si el nombre guardado parece **prueba** (`MASTER PRUEBA`, etc.), se **borra** del caché para no confundir.

## Si sigue viéndose mal

1. Comprobar en **Supabase** → `clubs` → columna **`nombre`** (no “MASTER PRUEBA…”).
2. **Cerrar sesión** y entrar de nuevo en **`auth.html`** (mismo dominio que la portada).
3. En el navegador, consola (F12): `WL.resetClubCache()` y Enter (limpia caché de marca y recarga).

## “ACCESO RESTRINGIDO” en mesas

Ese bloque **solo** usa **sesión Supabase** (no el PIN del club). Flujo: **`auth.html`** → iniciar sesión → volver al **`index.html`**.
