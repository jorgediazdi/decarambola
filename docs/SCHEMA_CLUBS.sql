-- ═══════════════════════════════════════════════════════════════════════════
-- Referencia: tabla public.clubs (DeCarambola)
-- Si la tabla YA existe en tu Supabase, no ejecutes este CREATE otra vez;
-- usalo para nuevos entornos o para comparar columnas con el Table Editor.
-- Identificador operativo típico: codigo (único) — ver docs/CANON_CLUB_ID.md
-- ═══════════════════════════════════════════════════════════════════════════

create table public.clubs (
  id uuid not null default gen_random_uuid (),
  nombre text not null,
  ciudad text null,
  departamento text null,
  activo boolean null default true,
  logo_url text null,
  color_primario text null default '#d4af37'::text,
  descripcion text null,
  whatsapp text null,
  created_at timestamp with time zone null default now(),
  codigo text null,
  pin text null default '0000'::text,
  admin_email text null,
  pais text null default 'CO'::text,
  deporte text not null default 'billar'::text,
  dominio text null,
  subdominio text null,
  tema jsonb null,
  constraint clubs_pkey primary key (id),
  constraint clubs_codigo_key unique (codigo)
) tablespace pg_default;
