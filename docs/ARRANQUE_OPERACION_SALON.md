# Arranque — operación salón + streaming (orden recomendado)

Checklist única para **no saltarse pasos**. Marca cada ítem cuando esté OK en tu entorno (local o Netlify).

---

## 1) Supabase — proyecto y credenciales

- [ ] Proyecto creado; en `core.js` (raíz) coinciden `SUPABASE_URL` y `SUPABASE_KEY` con **Settings → API** del mismo proyecto.
- [ ] Auth habilitado si usás login (jugadores/club).

---

## 2) Migraciones SQL (orden)

Ejecutá en **SQL Editor** (o CLI) **en este orden**, si aún no corrieron:

| Orden | Archivo | Notas |
|------|---------|--------|
| Base | `supabase_mesas_instalaciones.sql` (raíz del repo) | Esquema mesas / salón si partís de cero |
| Opc. | `supabase_mesas_url_camara.sql` | URLs por mesa (si no está ya en migraciones posteriores) |
| 001–009 | `supabase/migrations/001_*.sql` … `009_*.sql` | Perfiles, mesas RLS, clubs, etc. |
| 010 | `supabase/migrations/010_mesas_mapa_posicion_tarifas.sql` | `posicion_x/y`, `url_camara`, `tarifa_aplicada`, vista `sesiones_mesa` |

> **Importante:** había dos archivos con prefijo `006_` (perfiles vs mesas). El de **mesas/mapa/tarifas** quedó renombrado a **`010_`** para evitar solapamiento y confusiones al desplegar.

- [ ] Sin errores al ejecutar; si falla RLS, revisá `004_mesas_rls_paso1.sql` y políticas según tu política de acceso.

---

## 3) Club y sesión

- [ ] El usuario club tiene `profiles.role` / `club_id` acorde a `docs/CANON_CLUB_ID.md` (o convención del proyecto).
- [ ] `mi_perfil` / `club_activo` en el navegador del operario con el **mismo** `club_id` que las filas en `mesas`.

---

## 4) Onboarding salón (pasos 3 y 4)

- [ ] **Configurar instalaciones:** `mesas_config.html` (desde portal: `/apps/club/sala/mesas_config.html`) — plano, mesas guardadas.
- [ ] **Tarifas:** al menos un valor &gt; 0 (hora/media/mañana/noche/finde según tu formulario) en `mesas_salon_config` + sync con `mesas_config` en Supabase cuando hay `salon_id`.

Si esto falta, **Salón en vivo** puede mostrar el gate de onboarding (`js/mesas-operacion-onboarding.js`).

---

## 5) Salón en vivo y cámaras

- [ ] En cada mesa (Supabase o formulario de instalación): `url_camara` o `urls_camaras` si usás stream por mesa.
- [ ] **URL canónica del portal:** `/apps/club/sala/mesas.html` (menú Portal club).
- [ ] Copia en raíz `mesas.html` mantenida igual que `apps/club/sala/mesas.html` si servís también desde la raíz (evitar drift).

---

## 6) Duelo TV + OBS + YouTube

- [ ] `docs/OBS_DUELO_TV.md` + `PASOS_DUELO_TV_INICIO.md`.
- [ ] Misma **referencia de mesa** entre Duelo (fase 1) y la URL de cámara de esa mesa.

---

## 7) Deploy (Netlify u otro)

- [ ] `QA_NETLIFY.md` — rutas absolutas `/apps/...` resuelven bien.
- [ ] Tras cambios: `docs/QA_CHECKLIST_SUBIDA.md`.

---

## Documentación relacionada

- `docs/MODULO_OPERACION_MESAS.md` — módulo mesas + vista `sesiones_mesa`.
- `docs/README.md` — índice QA y streaming.
