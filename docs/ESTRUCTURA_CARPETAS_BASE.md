# Estructura de carpetas base creada

Se creo estructura inicial sin mover archivos productivos:

- `apps/`
  - `apps/jugador/`
  - `apps/club/`
  - `apps/superadmin/`
- `shared/`
- `backend/`
- `db/`
- `public/`

## Estado actual

- Las pantallas productivas siguen funcionando desde sus rutas actuales.
- Los hubs `jugador/index.html`, `club/index.html`, `admin/index.html` se mantienen.
- Esta estructura sirve para migracion gradual por fases.

## Siguiente paso

1. Mover primero codigo comun a `shared/` sin romper rutas.
2. Definir `auth + RLS` por rol.
3. Migrar una pantalla por vez desde raiz a `apps/*`.

## Estado actual de ejecucion

- Se dejo preparado el **Lote 1** en `docs/LOTE_1_CLUB_SALA_CHECKLIST.md`.
- Carpetas listas para iniciar migracion real:
  - `apps/club/sala/`
  - `apps/club/organizador/`
