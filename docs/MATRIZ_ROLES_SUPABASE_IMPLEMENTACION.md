# Matriz de roles y Supabase para implementación

**Objetivo:** operar con una sola base Supabase y tres apps:

- `Jugador`
- `Club` (incluye grupo `Organizador`)
- `Superadmin` (dueño/plataforma)

---

## 1) Roles operativos

| Rol | App | Alcance |
|-----|-----|---------|
| `jugador` | Jugador | Consumo de juego, perfil, torneos, retos, contacto |
| `club_admin` | Club | Operación del club: sala, torneos, señal local, reportes de su club |
| `superadmin` | Backoffice/Superadmin | Gobierno plataforma: clubes, reportes globales, streaming central, cobros, PQRS |

---

## 2) Matriz funcional (quién usa / escribe / aprueba)

| Módulo | Usa | Escribe | Aprueba/autoriza | Tabla(s) sugeridas Supabase | Política RLS sugerida |
|--------|-----|---------|------------------|-----------------------------|-----------------------|
| Perfil jugador | jugador | jugador | n/a | `players`, `player_stats` | `jugador` solo su registro; `club_admin` lectura limitada por club; `superadmin` lectura global |
| Historial y ranking | jugador, club_admin | sistema/club_admin | n/a | `matches`, `ranking_snapshots` | `jugador` lectura propia y pública permitida; `club_admin` por `club_id`; `superadmin` global |
| Torneos (crear/control) | club_admin, jugador (consulta) | club_admin | club_admin / superadmin (si torneo oficial) | `tournaments`, `tournament_rounds`, `tournament_matches`, `inscriptions` | `club_admin` write por `club_id`; `jugador` read/insert inscripción; `superadmin` full |
| Brackets / posiciones | jugador, club_admin | club_admin | n/a | `tournament_matches`, `standings` | lectura compartida; write solo `club_admin`/`superadmin` |
| Certificados | club_admin, jugador | club_admin | superadmin opcional (si certificado oficial plataforma) | `certificates` | `jugador` solo sus certificados; `club_admin` por `club_id`; `superadmin` global |
| Retos y duelos | jugador | jugador/sistema | n/a | `challenges`, `challenge_events` | jugadores involucrados write/read; `superadmin` auditoría |
| Administración sala (mesas/reservas) | club_admin | club_admin | n/a | `venues`, `tables`, `reservations`, `table_sessions` | `club_admin` write/read por `club_id`; `superadmin` global; `jugador` lectura pública limitada |
| Reportes de club | club_admin | sistema | n/a | vistas sobre `table_sessions`, `reservations`, `payments` | `club_admin` solo su `club_id` |
| Reportes globales plataforma | superadmin | sistema | superadmin | `platform_kpis` (vista/materializada), `clubs`, `payments` | solo `superadmin` |
| Gestión de clubes | superadmin, club_admin (datos propios) | superadmin / club_admin (campos limitados) | superadmin | `clubs`, `club_memberships`, `club_plans` | `club_admin` update limitado a su club; `superadmin` full |
| Streaming premium (señal mesa) | club_admin, superadmin | club_admin (operación local), superadmin (config global) | superadmin para habilitar; club_admin para uso diario | `stream_channels`, `stream_sessions`, `stream_policies`, `stream_billing` | `club_admin` por `club_id`; `superadmin` full |
| Cobros/planes streaming | club_admin (lectura de su club), superadmin | superadmin | superadmin | `billing_accounts`, `billing_invoices`, `stream_billing` | `club_admin` solo lectura por `club_id`; `superadmin` full |
| PQRS / Contacto | jugador, club_admin, superadmin | jugador/club_admin | superadmin (resolución) | `pqrs_tickets`, `pqrs_events` | creador ve sus tickets; `club_admin` ve tickets de su club; `superadmin` full |

---

## 3) Reparto final por app

### App Jugador
- `duelo-tv.html` (modo móvil)
- `mi_partida.html`, `entrenamiento.html`
- `perfil.html`, `historial.html`, `ranking.html`, `categorias.html`
- `inscripciones.html`, `Brackets.html`, `posiciones.html`, `Certificados.html`, `torneos.html`, `torneo_amigos.html`
- `reto_crear.html`
- `Sensei.html`, `Sensei.html?contacto=1`

### App Club (incluye Organizador)
- **Administración sala:** `admin_sede.html`, `Configurador formato.html`, `mesas.html`, `instalacion_ficha.html`, `mesas_config.html`, `reservas_admin.html`, `historial_mesas.html`, `reportes.html`, `socios.html`
- **Organizador torneos:** `organizador.html`, `torneo_crear.html`, `inscripciones.html`, `control_torneo.html`, `Brackets.html`, `posiciones.html`, `Certificados.html`, `torneos.html`
- **Streaming local (señal mesa):** `club/duelo_premium_tv.html`, `duelo-tv.html`, `overlay_marcador.html`, `duelo-tv-preview.html`
- **Contacto:** `Sensei.html?contacto=1`

### App Superadmin
- `pqrs_admin.html`
- nuevos módulos recomendados: gestión clubes, reportes globales, control streaming global, cobros/planes
- `Sensei.html?contacto=1` como canal unificado de contacto

---

## 4) Reglas de implementación

1. No eliminar funcionalidades compartidas; usar vistas por rol.
2. Todo registro sensible debe tener `club_id` (cuando aplique) y trazabilidad (`created_by`, `updated_by`).
3. RLS primero en lectura y escritura antes de mover UI.
4. Superadmin controla habilitación global de streaming; club administra ejecución local.
5. Club y superadmin pueden coexistir sobre módulos duales (streaming, reportes, clubes, cobros), con permisos distintos.

---

## 5) Orden recomendado de ejecución

1. Definir tabla/perfil de roles (`jugador`, `club_admin`, `superadmin`) y claims.
2. Ajustar RLS en tablas actuales.
3. Implementar módulo superadmin de clubes + reportes globales.
4. Implementar módulo superadmin de streaming/cobros.
5. Conectar app club a flujo de autorización/consumo de streaming.
6. QA cruzado por rol (jugador/club/superadmin).
