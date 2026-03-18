-- NOTA: Si no tienes tabla clubs, cambia
-- "club_id UUID REFERENCES clubs(id) ON DELETE CASCADE"
-- por "club_id UUID" en mesas_config

-- 1. CONFIGURACIÓN DEL SALÓN
create table if not exists mesas_config (
  id uuid default gen_random_uuid() primary key,
  club_id text,
  nombre_salon text not null,
  filas integer default 2,
  columnas integer default 4,
  apertura time default '08:00',
  cierre time default '23:00',
  moneda text default 'COP',
  tarifas jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. INSTALACIONES (mesas, canchas, pistas, etc.)
create table if not exists mesas (
  id uuid default gen_random_uuid() primary key,
  club_id text,
  salon_id uuid references mesas_config(id) on delete cascade,
  numero integer not null,
  nombre text,
  tipo_instalacion text default 'INSTALACIÓN',
  estado text default 'libre' check (estado in ('libre','ocupada','reservada','mantenimiento','fuera_servicio')),
  tarifa_hora numeric(10,2) default 0,
  sesion_activa jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. RESERVAS
create table if not exists mesas_reservas (
  id uuid default gen_random_uuid() primary key,
  mesa_id uuid references mesas(id) on delete cascade,
  club_id text,
  jugador_nombre text,
  fecha_reserva timestamptz,
  duracion_minutos integer,
  estado text default 'pendiente',
  notas text,
  created_at timestamptz default now()
);

-- 4. HISTORIAL DE SESIONES
create table if not exists mesas_historial (
  id uuid default gen_random_uuid() primary key,
  mesa_id uuid references mesas(id) on delete cascade,
  club_id text,
  jugador_nombre text,
  inicio_sesion timestamptz,
  fin_sesion timestamptz,
  horas_reales numeric(8,2),
  costo_total numeric(10,2),
  estado text default 'abierta' check (estado in ('abierta','cerrada')),
  notas text,
  created_at timestamptz default now()
);

-- 5. COMPONENTES DE MANTENIMIENTO
create table if not exists instalaciones_componentes (
  id uuid default gen_random_uuid() primary key,
  mesa_id uuid references mesas(id) on delete cascade,
  club_id text,
  nombre text not null,
  tipo text default 'ESTANDAR' check (tipo in ('CRITICO','ESTANDAR','CONSUMIBLE')),
  horas_uso_actual integer default 0,
  horas_uso_optimo integer default 500,
  horas_uso_alerta integer default 800,
  estado text default 'optimo' check (estado in ('optimo','desgaste','urgente')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. HISTORIAL DE MANTENIMIENTO
create table if not exists instalaciones_mantenimiento (
  id uuid default gen_random_uuid() primary key,
  mesa_id uuid references mesas(id) on delete cascade,
  componente_id uuid references instalaciones_componentes(id),
  club_id text,
  tipo_trabajo text check (tipo_trabajo in ('REVISION','REEMPLAZO','LIMPIEZA','REPARACION')),
  descripcion text,
  costo numeric(10,2) default 0,
  responsable text,
  fecha timestamptz default now(),
  created_at timestamptz default now()
);

-- ÍNDICES
create index if not exists idx_mesas_club on mesas(club_id);
create index if not exists idx_mesas_salon on mesas(salon_id);
create index if not exists idx_mesas_estado on mesas(estado);
create index if not exists idx_historial_mesa on mesas_historial(mesa_id, inicio_sesion);
create index if not exists idx_componentes_mesa on instalaciones_componentes(mesa_id);
create index if not exists idx_mantenimiento_mesa on instalaciones_mantenimiento(mesa_id);

-- RLS (Row Level Security) — allow all con anon key
alter table mesas_config enable row level security;
alter table mesas enable row level security;
alter table mesas_reservas enable row level security;
alter table mesas_historial enable row level security;
alter table instalaciones_componentes enable row level security;
alter table instalaciones_mantenimiento enable row level security;

create policy "allow all mesas_config" on mesas_config for all using (true) with check (true);
create policy "allow all mesas" on mesas for all using (true) with check (true);
create policy "allow all mesas_reservas" on mesas_reservas for all using (true) with check (true);
create policy "allow all mesas_historial" on mesas_historial for all using (true) with check (true);
create policy "allow all instalaciones_componentes" on instalaciones_componentes for all using (true) with check (true);
create policy "allow all instalaciones_mantenimiento" on instalaciones_mantenimiento for all using (true) with check (true);
