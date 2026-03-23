# DB

Carpeta objetivo para scripts de base de datos.

Destino sugerido:

- `migrations/`
- `seeds/`

Scripts actuales en raíz y en `db/`:

- `supabase_rls_produccion.sql`
- `supabase_mesas_instalaciones.sql`
- `supabase_mesas_url_camara.sql`
- `supabase_pqrs_contactos.sql`
- **`db/alter_mesas_hoja_vida.sql`** — columna JSON `hoja_vida` en `mesas` (ficha / hoja de vida desde `instalacion_ficha.html`).
