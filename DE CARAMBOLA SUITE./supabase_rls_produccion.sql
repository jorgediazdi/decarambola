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
  using (club_id = auth.current_club_id_uuid())
  with check (club_id = auth.current_club_id_uuid());

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
  using (club_id::text = auth.current_club_id_text() or club_id = auth.current_club_id_uuid())
  with check (club_id::text = auth.current_club_id_text() or club_id = auth.current_club_id_uuid());

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
-- PQRS: solo filas del club del JWT (o sin club_id = ver todos para superadmin si se implementa)
-- ═══════════════════════════════════════════════════════════════
drop policy if exists "allow all pqrs" on pqrs;
drop policy if exists "pqrs_club" on pqrs;
create policy "pqrs_club" on pqrs for all
  using (club_id is null or club_id = public.current_club_id_text())
  with check (club_id is null or club_id = public.current_club_id_text());
