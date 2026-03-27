# Lote 1 — Club > Administracion Sala

Objetivo: migrar primero el bloque de sala del club sin romper produccion.

## Alcance del lote

Entradas del bloque (actualmente enlazadas desde `club/index.html`):

- `admin_sede.html`
- `Configurador formato.html`
- `mesas.html`
- `instalacion_ficha.html`
- `mesas_config.html`
- `reservas_admin.html`
- `historial_mesas.html`
- `reportes.html`
- `socios.html`

## Estructura destino

Carpeta destino de este lote:

- `apps/club/sala/`

## Estrategia segura (3 pasos)

1. **Copiar** (no mover) cada pantalla a `apps/club/sala/`.
2. Ajustar links internos de las copias para que funcionen dentro de `apps/club/sala/`.
3. Validar funcionalidad; luego actualizar rutas del hub `club/index.html`.

> No borrar archivos en raiz durante este lote.

## Checklist operativo

- [x] Crear `apps/club/sala/` y `README.md`.
- [x] Copiar `admin_sede.html` a `apps/club/sala/admin_sede.html`.
- [x] Copiar `Configurador formato.html` a `apps/club/sala/configurador_formato.html` (si se renombra, dejar alias temporal).
- [x] Copiar `mesas.html` a `apps/club/sala/mesas.html`.
- [x] Copiar `instalacion_ficha.html` a `apps/club/sala/instalacion_ficha.html`.
- [x] Copiar `mesas_config.html` a `apps/club/sala/mesas_config.html`.
- [x] Copiar `reservas_admin.html` a `apps/club/sala/reservas_admin.html`.
- [x] Copiar `historial_mesas.html` a `apps/club/sala/historial_mesas.html`.
- [x] Copiar `reportes.html` a `apps/club/sala/reportes.html`.
- [x] Copiar `socios.html` a `apps/club/sala/socios.html`.
- [x] Probar links internos y carga de `core.js`/`session.js` (revisión estática rutas absolutas `/css/`, `/js/`, etc.).
- [x] Actualizar `club/index.html` para apuntar a `../apps/club/sala/reservas_admin.html` (primer item migrado).
- [x] Actualizar `club/index.html` para apuntar a `../apps/club/sala/historial_mesas.html` (segundo item migrado).
- [x] Actualizar `club/index.html` para apuntar a `../apps/club/sala/reportes.html` (tercer item migrado).
- [x] Actualizar `club/index.html` para apuntar a `../apps/club/sala/socios.html` (cuarto item migrado).
- [x] Actualizar `club/index.html` para apuntar a `../apps/club/sala/mesas_config.html` (quinto item migrado).
- [x] Actualizar `club/index.html` para apuntar a `../apps/club/sala/mesas.html` (sexto item migrado).
- [x] Actualizar `club/index.html` para apuntar a `../apps/club/sala/instalacion_ficha.html` (séptimo item migrado).
- [x] Actualizar `club/index.html` para `admin_sede.html` y `configurador_formato.html` en `apps/club/sala/`.
- [ ] Subir cambios del lote.

## QA minimo

- [ ] Abre `club/index.html` y entra a cada item de Administracion Sala.
- [ ] Verifica lectura/escritura en Supabase para `mesas`, `reservas`, `reportes`.
- [ ] Verifica que no se rompieron `organizador` ni `streaming`.

## Siguiente fase (toda la app)

Ver **`docs/ROADMAP_APPS.md`**: Fase B (organizador/torneos en `apps/club/`), Fase C (jugador), Fase D (superadmin), y hub técnico `apps/index.html`.

## Rollback rapido

Si algo falla:

1. Revertir enlaces de `club/index.html` a rutas anteriores en raiz.
2. Mantener copias en `apps/club/sala/` para seguir corrigiendo sin impacto.
