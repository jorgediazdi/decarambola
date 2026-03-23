# Club - Administracion Sala

Destino del Lote 1 de migracion.

Pantallas en esta carpeta:

- `admin_sede.html` — logo / color / sede (`whitelabel.js`).
- `configurador_formato.html` — diseñador de formato de torneo (`core.js`, `whitelabel.js`).
- `mesas.html`, `mesas_config.html`, `tarifas_salon.html`, `instalacion_ficha.html`
- `reservas_admin.html`, `historial_mesas.html`, `reportes.html`, `socios.html`

Referencia operativa:

- `docs/LOTE_1_CLUB_SALA_CHECKLIST.md`

**Staff solo Supabase:** al pasar `sala-supabase-gate.js` / portal, se copia `profiles.club_id` a `localStorage.mi_perfil.club_id` para que `getClubId()` en estas pantallas coincida con RLS al guardar mesas.

**Logo del dueño + URLs del salón (varios clubes):** `docs/CLUB_LOGO_Y_URLS_SALA.md` · identificador canónico del club: `docs/CANON_CLUB_ID.md`.
