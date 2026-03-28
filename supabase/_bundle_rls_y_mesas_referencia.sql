-- =====================================================================
-- BUNDLE SOLO LECTURA / COPIA POR SECCIONES
-- No ejecutar todo el archivo de una vez sin revisar: hay políticas
-- que se solapan o contradicen entre scripts (p. ej. mesas RLS).
-- Archivo generado: SQL puro, sin texto de chat.
-- =====================================================================

-- >>> supabase_rls_produccion.sql
-- RLS para producción — DeCarambola
-- Ejecutar SOLO cuando tengas Supabase Auth y guardes club_id en app_metadata (auth.jwt() -> 'app_metadata' ->> 'club_id').
-- Ver docs/RLS_PRODUCCION.md.
-- Las tablas clubs, jugadores, torneos, inscripciones, partidas, ranking_historico deben existir (creadas a mano o por otro script).

-- Funciones auxiliares en public (auth.jwt() es del schema auth de Supabase)
create or replace function public.current_club_id_text()
returns text language sql stable set search_path = public as $$
  select auth.jwt() -> 'app_metadata' ->> 'club_id';
$$;

create or replace function public.current_club_id_uuid()
returns uuid language sql stable set search_path = public as $$
  select (auth.jwt() -> 'app_metadata' ->> 'club_id')::uuid;
$$;

-- Activar RLS en tablas de sala (requerido antes de sus políticas)
alter table if exists mesas_config enable row level security;
alter table if exists mesas enable row level security;
alter table if exists mesas_reservas enable row level security;
alter table if exists mesas_historial enable row level security;

-- ═══════════════════════════════════════════════════════════════
-- CLUBS: SELECT abierto (unirse por código); INSERT/UPDATE/DELETE solo propio club
-- ═══════════════════════════════════════════════════════════════
alter table if exists clubs enable row level security;
drop policy if exists "allow all clubs" on clubs;
drop policy if exists "clubs_select_all" on clubs;
drop policy if exists "clubs_modify_own" on clubs;
create policy "clubs_select_all" on clubs for select using (true);
create policy "clubs_modify_own" on clubs for all
  using (id = public.current_club_id_uuid())
  with check (id = public.current_club_id_uuid());

-- ═══════════════════════════════════════════════════════════════
-- JUGADORES: solo filas del club del JWT (club_id uuid)
-- ═══════════════════════════════════════════════════════════════
alter table if exists jugadores enable row level security;
drop policy if exists "allow all jugadores" on jugadores;
drop policy if exists "jugadores_club" on jugadores;
create policy "jugadores_club" on jugadores for all
  using (club_id = public.current_club_id_uuid())
  with check (club_id = public.current_club_id_uuid());

-- ═══════════════════════════════════════════════════════════════
-- TORNEOS: solo filas del club del JWT
-- ═══════════════════════════════════════════════════════════════
alter table if exists torneos enable row level security;
drop policy if exists "allow all torneos" on torneos;
drop policy if exists "torneos_club" on torneos;
create policy "torneos_club" on torneos for all
  using (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid())
  with check (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid());

-- ═══════════════════════════════════════════════════════════════
-- INSCRIPCIONES: acceso por club_id del torneo o de la fila
-- ═══════════════════════════════════════════════════════════════
alter table if exists inscripciones enable row level security;
drop policy if exists "allow all inscripciones" on inscripciones;
drop policy if exists "inscripciones_club" on inscripciones;
create policy "inscripciones_club" on inscripciones for all
  using (
    (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid())
    or exists (select 1 from torneos t where t.id = torneo_id and (t.club_id::text = public.current_club_id_text() or t.club_id = public.current_club_id_uuid()))
  )
  with check (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid());

-- ═══════════════════════════════════════════════════════════════
-- PARTIDAS: solo filas del club del JWT
-- ═══════════════════════════════════════════════════════════════
alter table if exists partidas enable row level security;
drop policy if exists "allow all partidas" on partidas;
drop policy if exists "partidas_club" on partidas;
create policy "partidas_club" on partidas for all
  using (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid())
  with check (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid());

-- ═══════════════════════════════════════════════════════════════
-- RANKING_HISTORICO: solo filas del club del JWT
-- ═══════════════════════════════════════════════════════════════
alter table if exists ranking_historico enable row level security;
drop policy if exists "allow all ranking_historico" on ranking_historico;
drop policy if exists "ranking_historico_club" on ranking_historico;
create policy "ranking_historico_club" on ranking_historico for all
  using (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid())
  with check (club_id::text = public.current_club_id_text() or club_id = public.current_club_id_uuid());

-- ═══════════════════════════════════════════════════════════════
-- MESAS_* (club_id text)
-- ═══════════════════════════════════════════════════════════════
drop policy if exists "allow all mesas_config" on mesas_config;
drop policy if exists "mesas_config_club" on mesas_config;
create policy "mesas_config_club" on mesas_config for all
  using (club_id = public.current_club_id_text())
  with check (club_id = public.current_club_id_text());

drop policy if exists "allow all mesas" on mesas;
drop policy if exists "mesas_club" on mesas;
create policy "mesas_club" on mesas for all
  using (club_id = public.current_club_id_text())
  with check (club_id = public.current_club_id_text());

drop policy if exists "allow all mesas_reservas" on mesas_reservas;
drop policy if exists "mesas_reservas_club" on mesas_reservas;
create policy "mesas_reservas_club" on mesas_reservas for all
  using (club_id = public.current_club_id_text())
  with check (club_id = public.current_club_id_text());

drop policy if exists "allow all mesas_historial" on mesas_historial;
drop policy if exists "mesas_historial_club" on mesas_historial;
create policy "mesas_historial_club" on mesas_historial for all
  using (club_id = public.current_club_id_text())
  with check (club_id = public.current_club_id_text());

alter table if exists instalaciones_componentes enable row level security;
alter table if exists instalaciones_mantenimiento enable row level security;

drop policy if exists "allow all instalaciones_componentes" on instalaciones_componentes;
drop policy if exists "instalaciones_componentes_club" on instalaciones_componentes;
create policy "instalaciones_componentes_club" on instalaciones_componentes for all
  using (club_id = public.current_club_id_text())
  with check (club_id = public.current_club_id_text());

drop policy if exists "allow all instalaciones_mantenimiento" on instalaciones_mantenimiento;
drop policy if exists "instalaciones_mantenimiento_club" on instalaciones_mantenimiento;
create policy "instalaciones_mantenimiento_club" on instalaciones_mantenimiento for all
  using (club_id = public.current_club_id_text())
  with check (club_id = public.current_club_id_text());

-- ═══════════════════════════════════════════════════════════════
-- PQRS: club vía JWT; inserción pública (Sensei / anon); superadmin vía profiles
-- ═══════════════════════════════════════════════════════════════
alter table if exists pqrs enable row level security;
drop policy if exists "allow all pqrs" on pqrs;
drop policy if exists "pqrs_club" on pqrs;
drop policy if exists "pqrs_insert_public" on pqrs;
drop policy if exists "pqrs_superadmin_all" on pqrs;

create policy "pqrs_club" on pqrs for all
  using (club_id is null or club_id = public.current_club_id_text())
  with check (club_id is null or club_id = public.current_club_id_text());

-- Formulario público / Sensei sin sesión (combinada en modo PERMISSIVE con pqrs_club)
create policy "pqrs_insert_public" on pqrs
  for insert
  to anon, authenticated
  with check (true);

-- Panel PQRS: usuario autenticado con profiles.role = 'superadmin'
create policy "pqrs_superadmin_all" on pqrs
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- PROFILES: lectura y actualización de la propia fila
-- ═══════════════════════════════════════════════════════════════
alter table if exists public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Verificación post-ejecución
select tablename, policyname, cmd from pg_policies order by tablename, policyname;

-- >>> supabase/verificar_rls.sql
-- Post-ejecución: pegar en Supabase SQL Editor y revisar resultados

-- Tablas con RLS activo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Todas las políticas activas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Verificar funciones public.current_club_id_*
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%club_id%';

-- >>> supabase/migrations/004_mesas_rls_paso1.sql
-- Paso 1 — Mesas solo con sesión + club (reemplaza "allow all")
-- Requisitos: 001_profiles_auth.sql ya ejecutado
-- Después: asigna en profiles → role = 'club_admin', club_id = mismo texto que mesas.club_id

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS club_id TEXT;

COMMENT ON COLUMN public.profiles.club_id IS 'Identificador del club (texto; debe coincidir con mesas.club_id)';

CREATE INDEX IF NOT EXISTS idx_profiles_club_id ON public.profiles (club_id);

-- Quitar acceso anónimo total sobre mesas
DROP POLICY IF EXISTS "allow all mesas" ON public.mesas;

-- Lectura: superadmin ve todo; club_admin solo filas de su club
DROP POLICY IF EXISTS "mesas_select_club" ON public.mesas;
CREATE POLICY "mesas_select_club"
  ON public.mesas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'superadmin'
        OR (
          p.role = 'club_admin'
          AND p.club_id IS NOT NULL
          AND mesas.club_id IS NOT NULL
          AND btrim(mesas.club_id) = btrim(p.club_id)
        )
      )
    )
  );

-- Altas
DROP POLICY IF EXISTS "mesas_insert_club" ON public.mesas;
CREATE POLICY "mesas_insert_club"
  ON public.mesas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'superadmin'
        OR (
          p.role = 'club_admin'
          AND p.club_id IS NOT NULL
          AND club_id IS NOT NULL
          AND btrim(club_id) = btrim(p.club_id)
        )
      )
    )
  );

-- Cambios (abrir/cerrar mesa)
DROP POLICY IF EXISTS "mesas_update_club" ON public.mesas;
CREATE POLICY "mesas_update_club"
  ON public.mesas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'superadmin'
        OR (
          p.role = 'club_admin'
          AND p.club_id IS NOT NULL
          AND mesas.club_id IS NOT NULL
          AND btrim(mesas.club_id) = btrim(p.club_id)
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'superadmin'
        OR (
          p.role = 'club_admin'
          AND p.club_id IS NOT NULL
          AND mesas.club_id IS NOT NULL
          AND btrim(mesas.club_id) = btrim(p.club_id)
        )
      )
    )
  );

-- Bajas
DROP POLICY IF EXISTS "mesas_delete_club" ON public.mesas;
CREATE POLICY "mesas_delete_club"
  ON public.mesas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'superadmin'
        OR (
          p.role = 'club_admin'
          AND p.club_id IS NOT NULL
          AND mesas.club_id IS NOT NULL
          AND btrim(mesas.club_id) = btrim(p.club_id)
        )
      )
    )
  );

-- >>> supabase/migrations/006_profiles_add_role_club_id.sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Si el portal / sala muestra: "column profiles.role does not exist"
-- ejecutá esto UNA VEZ en Supabase → SQL → New query → Run
-- Alinea profiles con js/club-portal-gate.js y js/sala-supabase-gate.js
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'jugador';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS club_id TEXT;

-- Valor por defecto explícito para filas viejas sin role
UPDATE public.profiles
SET role = 'jugador'
WHERE role IS NULL;

-- Opcional: exigir NOT NULL solo si ya no hay NULLs
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'jugador';

-- (Si querés NOT NULL estricto, descomentá la siguiente línea)
-- ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

COMMENT ON COLUMN public.profiles.role IS 'jugador | club_admin | superadmin';
COMMENT ON COLUMN public.profiles.club_id IS 'Debe coincidir con clubs.codigo — ver docs/CANON_CLUB_ID.md';

CREATE INDEX IF NOT EXISTS idx_profiles_club_id ON public.profiles (club_id);

-- >>> supabase/migrations/007_clubs_select_authenticated.sql
-- Portal /club/: leer nombre y logo_url desde el navegador con sesión (rol authenticated).
-- Si el hero queda en "Portal club" sin logo, ejecutar esto en SQL Editor.

DROP POLICY IF EXISTS "clubs_select_authenticated" ON public.clubs;
CREATE POLICY "clubs_select_authenticated"
  ON public.clubs
  FOR SELECT
  TO authenticated
  USING (true);

-- >>> supabase_mesas_instalaciones.sql
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
