-- Tabla: solicitudes de configuración de club (alta o cambio).
-- Paso 3 (futuro): sustituir política "scc_allow_all_dev" por RLS granular:
--   SELECT/INSERT/UPDATE según auth.uid() = user_id (club_admin) o role = superadmin en profiles;
--   sin filtrar en cliente datos de otros clubes.

-- Compatibilidad: si existía la migración anterior con otro nombre de tabla, eliminarla.
DROP FUNCTION IF EXISTS public.aprobar_solicitud_config_club(uuid, text);
DROP FUNCTION IF EXISTS public.rechazar_solicitud_config_club(uuid, text);
DROP TABLE IF EXISTS public.solicitudes_configuracion_club CASCADE;

CREATE TABLE IF NOT EXISTS public.solicitudes_config_club (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  club_id TEXT NULL,
  nombre_club TEXT NOT NULL,
  metraje_ancho NUMERIC(10,2),
  metraje_largo NUMERIC(10,2),
  num_mesas INTEGER NOT NULL CHECK (num_mesas >= 1 AND num_mesas <= 50),
  ciudad TEXT,
  direccion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  comentario_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revisado_at TIMESTAMPTZ,
  revisado_por UUID REFERENCES auth.users (id)
);

CREATE INDEX IF NOT EXISTS idx_scc_club_id ON public.solicitudes_config_club (club_id);
CREATE INDEX IF NOT EXISTS idx_scc_user_id ON public.solicitudes_config_club (user_id);
CREATE INDEX IF NOT EXISTS idx_scc_estado ON public.solicitudes_config_club (estado);

COMMENT ON TABLE public.solicitudes_config_club IS 'Solicitudes alta/cambio club; aprobación superadmin. RLS pendiente paso 3.';
COMMENT ON COLUMN public.solicitudes_config_club.club_id IS 'clubs.codigo: NULL en alta nueva; set en solicitud de cambio.';

ALTER TABLE public.solicitudes_config_club ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scc_allow_all_dev" ON public.solicitudes_config_club;
CREATE POLICY "scc_allow_all_dev"
  ON public.solicitudes_config_club
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.aprobar_solicitud_config_club(p_solicitud_id uuid, p_comentario text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin text;
  v_sol public.solicitudes_config_club%ROWTYPE;
  v_codigo text;
  v_try int := 0;
  v_exists bigint;
  v_upd int;
BEGIN
  SELECT trim(role) INTO v_admin FROM public.profiles WHERE id = auth.uid();
  IF v_admin IS DISTINCT FROM 'superadmin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Solo superadmin');
  END IF;

  SELECT * INTO v_sol FROM public.solicitudes_config_club WHERE id = p_solicitud_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Solicitud no encontrada');
  END IF;
  IF v_sol.estado IS DISTINCT FROM 'pendiente' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'La solicitud ya fue procesada');
  END IF;

  IF v_sol.club_id IS NOT NULL AND trim(v_sol.club_id) <> '' THEN
    v_codigo := trim(v_sol.club_id);
    UPDATE public.clubs
    SET nombre = v_sol.nombre_club,
        ciudad = coalesce(v_sol.ciudad, clubs.ciudad)
    WHERE codigo = v_codigo;
    GET DIAGNOSTICS v_upd = ROW_COUNT;
    IF v_upd = 0 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Club no encontrado para el código indicado');
    END IF;
  ELSE
    LOOP
      v_try := v_try + 1;
      EXIT WHEN v_try > 12;
      v_codigo := 'DC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
      SELECT count(*) INTO v_exists FROM public.clubs WHERE codigo = v_codigo;
      EXIT WHEN v_exists = 0;
    END LOOP;
    IF v_try > 12 OR v_codigo IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'No se pudo generar un código único');
    END IF;
    INSERT INTO public.clubs (codigo, nombre, ciudad, color_primario, activo)
    VALUES (v_codigo, v_sol.nombre_club, coalesce(v_sol.ciudad, ''), '#d4af37', true);
  END IF;

  UPDATE public.profiles
  SET role = 'club_admin',
      club_id = v_codigo
  WHERE id = v_sol.user_id;

  UPDATE public.solicitudes_config_club
  SET estado = 'aprobada',
      comentario_admin = p_comentario,
      club_id = v_codigo,
      revisado_at = now(),
      revisado_por = auth.uid(),
      updated_at = now()
  WHERE id = p_solicitud_id;

  RETURN jsonb_build_object('ok', true, 'club_codigo', v_codigo);
END;
$$;

CREATE OR REPLACE FUNCTION public.rechazar_solicitud_config_club(p_solicitud_id uuid, p_comentario text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin text;
  v_n int;
BEGIN
  SELECT trim(role) INTO v_admin FROM public.profiles WHERE id = auth.uid();
  IF v_admin IS DISTINCT FROM 'superadmin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Solo superadmin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.solicitudes_config_club WHERE id = p_solicitud_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Solicitud no encontrada');
  END IF;

  UPDATE public.solicitudes_config_club
  SET estado = 'rechazada',
      comentario_admin = p_comentario,
      revisado_at = now(),
      revisado_por = auth.uid(),
      updated_at = now()
  WHERE id = p_solicitud_id AND estado = 'pendiente';

  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'La solicitud ya fue procesada');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.aprobar_solicitud_config_club(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rechazar_solicitud_config_club(uuid, text) TO authenticated;
