# Flujo recomendado: Jugador → Club → Admin

## Resumen

| Paso | Quién | Qué es | ¿Hace falta sesión? |
|------|--------|--------|---------------------|
| **1 · Jugador** | Público, socios | `/jugador/` — duelo, perfil, ranking, Sensei | Opcional (mejor con cuenta jugador) |
| **2 · Panel club** | Dueño, recepción, árbitro | `/club/` — mismo hub que mesas, torneos, TV | **Sí:** cuenta **staff** en Supabase con rol `club_admin` o `superadmin` + `club_id` |
| **3 · Admin** | Equipo DeCarambola | `/admin/` — PQRS / interno | Según política interna |

El **PIN del código de club** en la app principal **no** abre `/club/`: ahí hace falta **Iniciar sesión** (`auth.html`) con el correo que tenga rol en `profiles`.

### Modo prueba (sin login) — solo desarrollo / demos

- URL: **`/club/?dev=1`** o en la pantalla de acceso: **«Entrar en modo prueba (sin sesión)»**.
- Guarda el modo en `sessionStorage` hasta que pulses **«Salir del modo prueba»** o cierres la pestaña.
- **Público general:** sin ese enlace, sigue viendo la pantalla de **personal del club** + login — es lo correcto para producción.

## Mismo sitio en otro dominio (ej. Billares Master VIP)

Si el club apunta su dominio a Netlify, las rutas son las mismas:

- `https://tu-dominio/jugador/`
- `https://tu-dominio/club/` (tras login staff)
- `https://tu-dominio/admin/`

## “MASTER PRUEBA JH” repetido

Suele ser **nombre en caché** (`localStorage`) o datos viejos de prueba. Tras **corregir nombre/logo en Supabase** (tabla `clubs` y perfil), probá ventana privada o borrar datos del sitio para esa URL.

## Guías

- Auth: `docs/PASOS_AUTH_EMPEZAR.md`
- Rol `club_admin` y RLS mesas: `docs/PASO1_RLS_MESAS.md`
- Leer `clubs` desde el portal: `docs/SQL_CLUBS_LEER_PORTAL.md`
