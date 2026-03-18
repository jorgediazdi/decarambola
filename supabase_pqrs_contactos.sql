-- Tabla para PQRS / Contacto (agente Joe).
-- Ejecutar en Supabase SQL Editor.
-- Ver docs/SUPABASE_RECOMENDACIONES_EXPERTO.md.

create table if not exists pqrs (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  contacto text not null,
  mensaje text not null,
  tipo text default 'peticion' check (tipo in ('peticion','queja','reclamo','sugerencia')),
  estado text default 'pendiente_revision' check (estado in ('pendiente_revision','autorizado','rechazado','cerrado')),
  respuesta_texto text,
  respuesta_autorizada_at timestamptz,
  club_id text,
  created_at timestamptz default now()
);

create index if not exists idx_pqrs_estado on pqrs(estado);
create index if not exists idx_pqrs_created on pqrs(created_at desc);
create index if not exists idx_pqrs_club on pqrs(club_id);

alter table pqrs enable row level security;
create policy "allow all pqrs" on pqrs for all using (true) with check (true);
-- En producción: restringir por club_id o auth.uid().

comment on table pqrs is 'PQRS y contactos (agente Joe). Admin autoriza respuesta antes de cerrar.';
