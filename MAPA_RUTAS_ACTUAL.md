# Mapa de rutas actuales — DeCarambola

Documentación de URLs públicas y correspondencia con archivos en el repo (marzo 2026).  
Los duplicados en la raíz muchas veces **redirigen 301** a la ruta canónica bajo `/apps/club/` (ver `_redirects`).

---

## Público / inicio

| URL servida | Archivo físico (repo) |
|-------------|------------------------|
| `/` | `index.html` |
| `/apps/` | `apps/index.html` (hub con sesión; sin login → `/auth.html`) |
| `/auth.html` | `auth.html` |
| `/404.html` | `404.html` |

---

## Jugador

| URL servida | Archivo físico (repo) |
|-------------|------------------------|
| `/jugador/` | `jugador/index.html` |
| `/mi_partida.html` | `mi_partida.html` |
| `/duelo-tv.html` | `duelo-tv.html` |
| `/perfil.html`, `/ranking.html`, `/historial.html`, … | raíz (respectivos `.html`) |

---

## Club — portal

| URL servida | Archivo físico (repo) |
|-------------|------------------------|
| `/club/` | `club/index.html` |
| `/club/duelo_premium_tv.html` | `club/duelo_premium_tv.html` |

---

## Club — sala (canónico)

Prefijo **`/apps/club/sala/`** (desde raíz del sitio).

| Ruta ejemplo | Archivo (repo) |
|--------------|----------------|
| `/apps/club/sala/mesas.html` | `apps/club/sala/mesas.html` |
| `/apps/club/sala/mesas_config.html` | `apps/club/sala/mesas_config.html` |
| `/apps/club/sala/admin_sede.html` | `apps/club/sala/admin_sede.html` |
| `/apps/club/sala/tarifas_salon.html` | `apps/club/sala/tarifas_salon.html` |
| `/apps/club/sala/reservas_admin.html` | `apps/club/sala/reservas_admin.html` |
| `/apps/club/sala/historial_mesas.html` | `apps/club/sala/historial_mesas.html` |
| `/apps/club/sala/reportes.html` | `apps/club/sala/reportes.html` |
| `/apps/club/sala/socios.html` | `apps/club/sala/socios.html` |
| `/apps/club/sala/instalacion_ficha.html` | `apps/club/sala/instalacion_ficha.html` |
| `/apps/club/sala/configurador_formato.html` | `apps/club/sala/configurador_formato.html` |

**Atajo Netlify:** `/club/sala/*` → `/apps/club/sala/:splat` (301).

**Redirecciones 301 desde raíz:** `/mesas.html`, `/mesas_config.html`, `/admin_sede.html`, etc. → equivalente en `/apps/club/sala/` (lista completa en `_redirects`).

---

## Club — organizador (canónico)

Prefijo **`/apps/organizador/`**.

| Ruta ejemplo | Archivo (repo) |
|--------------|----------------|
| `/apps/organizador/organizador.html` | `apps/organizador/organizador.html` |
| `/apps/organizador/torneo_crear.html` | `apps/organizador/torneo_crear.html` |
| `/apps/organizador/torneos.html` | `apps/organizador/torneos.html` |
| `/apps/organizador/control_torneo.html` | `apps/organizador/control_torneo.html` |
| `/apps/organizador/inscripciones.html` | `apps/organizador/inscripciones.html` |
| `/apps/organizador/Brackets.html` | `apps/organizador/Brackets.html` |
| `/apps/organizador/posiciones.html` | `apps/organizador/posiciones.html` |
| `/apps/organizador/Certificados.html` | `apps/organizador/Certificados.html` |

**Redirecciones 301 desde raíz:** `/organizador.html`, `/torneos.html`, etc. → equivalente bajo `/apps/organizador/` (ver `_redirects`).

---

## Admin / plataforma

| URL servida | Archivo físico (repo) |
|-------------|------------------------|
| `/admin/` | `admin/index.html` |
| `/pqrs_admin.html` | `pqrs_admin.html` |

---

## Otros fijos útiles

| URL | Archivo |
|-----|---------|
| `/Sensei.html` | `Sensei.html` |
| `/overlay_marcador.html` | `overlay_marcador.html` |

---

## Auth (post-login sugerido en código)

| Rol (profiles.role) | Destino típico |
|---------------------|----------------|
| `superadmin` | `/admin/` |
| `club_admin` | `/apps/club/sala/mesas.html` |
| `operador` | `/apps/club/sala/mesas.html` (misma operación; sin `operacion.html` dedicado) |
| `jugador` (u otro) | `/jugador/` |

---

*Última actualización: consolidación Fase 1 (_redirects) + hub `apps/index.html`.*
