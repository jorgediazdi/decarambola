# Roadmap — Toda la app (3 superficies)

**Objetivo:** organizar DeCarambola en **Jugador**, **Club** y **Backoffice**, sin cortar producción: la raíz del repo sigue siendo la fuente desplegable hasta migrar cada bloque.

**Referencias:** `docs/INVENTARIO_ARQUITECTURA_ROLES.md`, `docs/MATRIZ_ROLES_SUPABASE_IMPLEMENTACION.md`, `docs/SUPABASE_TABLAS.md`.

---

## Estado resumido (2026-03)

| Bloque | Estado | Ubicación canónica hoy |
|--------|--------|-------------------------|
| **Hub principal** (pestañas Jugador / Club / Organizador) | Estable | `index.html` (raíz) |
| **Portal club** (menú dedicado) | Estable | `club/index.html` |
| **Administración sala** (mesas, reservas, reportes, sede, formato…) | **Lote 1 avanzado** | Copias en `apps/club/sala/` + enlaces desde `club/index.html` |
| **App jugador** (entrada) | Parcial | `jugador/index.html` (raíz) — carpeta `apps/jugador/` aún sin HTML productivo |
| **Organizador / torneos** | **Fase B** (copias migradas + hubs) | `apps/organizador/*.html` + copias en raíz sin borrar |
| **Backoffice (PQRS, staff)** | En raíz | `pqrs_admin.html` — `apps/superadmin/` solo README |
| **Núcleo técnico** | Compartido | `core.js`, `session.js`, `whitelabel.js`, `Version.js`, `sw.js` en raíz |

---

## Principios (no negociables en migración)

1. **No borrar** HTML de la raíz mientras exista un enlace o un deploy que lo use.
2. **Copiar → ajustar rutas → enlazar hub → probar →** luego deprecar enlaces viejos si se desea.
3. Un **`Version.js`** por despliegue; bump al subir cambios relevantes.
4. Rutas a `core.js`: usar `/core.js` (u otras rutas absolutas desde la raíz del sitio).

---

## Fases sugeridas

### Fase A — Club · Sala (**Lote 1**) ✅ casi cerrado

- [x] `apps/club/sala/` con pantallas sala + `admin_sede` + `configurador_formato`.
- [x] `club/index.html` apunta a `apps/club/sala/...`.
- [ ] Commit/deploy y QA manual del portal club.

### Fase B — Club · Organizador (torneos “en casa”)

- Copiar a `apps/club/organizador/` (o subcarpeta acordada):  
  `organizador.html`, `torneo_crear.html`, `control_torneo.html`, `torneos.html`, `Brackets.html`, `posiciones.html`, `inscripciones.html` (según matriz de dependencias).
- Actualizar `club/index.html` y pestaña Organizador del `index.html` principal cuando esté validado.
- **Riesgo:** alto (muchas entradas y `core.js`).

### Fase C — App Jugador

- Consolidar entradas en `apps/jugador/` o mantener `jugador/index.html` como hub y copiar pantallas progresivamente: `perfil`, `historial`, `ranking`, `reto_crear`, `mi_partida`, etc.
- Un solo estilo de rutas relativas a `core.js`.

### Fase D — Backoffice

- Shell mínimo `apps/superadmin/index.html` (auth staff / lista PQRS).
- Mover o enlazar `pqrs_admin.html` sin exponer operaciones sensibles.

### Fase E — Refactor grande (opcional / largo plazo)

- Partir `core.js` en módulos o SDK.
- Auth unificada (Supabase Auth + claims `club_id` / rol).
- `index.html` como router liviano o tres builds.

---

## Próximo paso inmediato recomendado

1. **QA Fase B:** probar flujo completo desde `club/index.html` y pestaña Organizador del hub principal.
2. **Fase C** (jugador) o hardening según prioridad.
3. Mantener este documento actualizado al cerrar cada fase.

---

## Hub técnico `apps/index.html`

Sirve como **mapa de navegación interna** hacia jugador, club y (futuro) superadmin; no sustituye al `index.html` principal del producto.
