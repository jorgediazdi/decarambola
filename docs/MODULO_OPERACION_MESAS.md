# Módulo de operación de mesas + onboarding

## Objetivo

Una sola fuente de verdad en **Supabase** para operario, TV y onboarding: posiciones en el plano, sesiones con liquidación, URLs de stream.

## Base de datos

Ejecutar en Supabase (SQL Editor o CLI) en orden:

1. `supabase_mesas_instalaciones.sql` (si aún no existe el esquema base)
2. `supabase_mesas_url_camara.sql` (opcional, URLs por mesa)
3. `supabase/migrations/010_mesas_mapa_posicion_tarifas.sql` (antes `006_mesas_*`; renombrado para no chocar con `006_profiles_add_role_club_id.sql`)
4. `supabase/migrations/011_clubs_operacion_flags.sql` — `clubs.setup_salon_ok`, `clubs.setup_tarifas_ok` (onboarding / operación)

Orden completo de arranque: **`docs/ARRANQUE_OPERACION_SALON.md`**.

**Realtime (Dashboard Supabase):** habilitar replicación en **`mesas`** y **`mesas_historial`** para el canal usado por `js/sala-supabase-realtime.js` y `js/duelo-tv-mesa-realtime.js`.

### Tabla `mesas` (ampliada)

| Campo | Uso |
|-------|-----|
| `posicion_x`, `posicion_y` | Posición en el mapa (0–100 % del contenedor) |
| `url_camara` | URL principal Mux / YouTube / HLS |
| `urls_camaras` | JSON array opcional (varias cámaras) |

Estados ya existentes: `libre`, `ocupada`, `reservada`, `mantenimiento`, `fuera_servicio` (equivalente a “disponible” = **libre** en UI).

### Sesiones y vista `sesiones_mesa`

La tabla canónica de sesiones sigue siendo **`mesas_historial`** (abierta/cerrada, costos).

- **`tarifa_aplicada`** (jsonb): snapshot al cerrar (método, minutos, tarifa efectiva, total).
- La vista **`sesiones_mesa`** expone columnas con los nombres pedidos (`hora_inicio`, `hora_fin`, `total_pagar`, …) para integraciones/API.

## App — Salón en vivo (`apps/club/sala/mesas.html`)

- **Onboarding:** `js/mesas-operacion-onboarding.js` + `js/club-setup-guide.js` validan pasos 3–4 con **Supabase** (`clubs` flags, `mesas_config`, conteo `mesas`, tarifas JSON).
- **Carga del salón:** `cargarDatos()` lee **`mesas_config` por `club_id`** y **`mesas` por `salon_id`**; sesiones abiertas con `mesas_historial` filtrado por **`club_id` + `estado=abierta`** y mesas del plano actual.
- **Vista cuadrícula / mapa:** toolbar; en **mapa**, arrastrar **desde el asa ⠿** guarda `posicion_x/y` vía `DB.update`.
- **Liquidación:** “Cerrar sesión” muestra **ticket virtual**; al confirmar se escribe `tarifa_aplicada` + `costo_total` y se libera la mesa.
- **Cámara:** ícono 📹 en cada celda (activo si hay URL); modal sigue con “Previsualizar cámara”.
- **Realtime:** `subscribeClubSalonRealtime` (import dinámico) refresca el plano al cambiar `mesas` / `mesas_historial`.

## Duelo TV (`duelo-tv.html`)

- `MasterVIP.getStreamUrlMesa(clubId, numeroMesa)` con **await** (Promise).
- `window.__dueloSetStreamUrl` + `DC_startDueloTvMesaRealtime` tras pasar a fase 2: la TV puede actualizar el iframe de stream cuando el operario cambia datos de mesa en Supabase.

## Flags tras guardar configuración / tarifas

Tras guardar en **`mesas_config.html`** o **`tarifas_salon.html`**, se llama a **`js/sync-club-operacion-flags.js`** → `UPDATE clubs` (`setup_salon_ok`, `setup_tarifas_ok`) si RLS lo permite.

## localStorage

`mesas_salon_config` en **`mesas_config.html`** sigue siendo **cache opcional** al guardar; **Salón en vivo** y **Tarifas del salón** usan Supabase como fuente principal para operación unificada.
