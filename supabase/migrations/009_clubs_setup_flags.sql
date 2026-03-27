-- Flags de checklist “Puesta en marcha” (pasos 5–6) en tabla public.clubs.
-- Tras ejecutar, asegurate de tener una política RLS que permita UPDATE a quien administre ese club
-- (ej. club_admin con profiles.club_id = clubs.codigo). Ver comentario abajo.

ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS setup_cameras_ok BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS setup_tv_ok BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.clubs.setup_cameras_ok IS 'Checklist paso 5: cámaras / ficha instalación (js/club-setup-guide.js)';
COMMENT ON COLUMN public.clubs.setup_tv_ok IS 'Checklist paso 6: Duelo TV / OBS (js/club-setup-guide.js)';

-- Si RLS está activo en clubs y el UPDATE falla desde la app, necesitás algo como (ajustá a tu modelo de auth):
--
-- CREATE POLICY "clubs_update_setup_by_staff"
--   ON public.clubs FOR UPDATE TO authenticated
--   USING (
--     codigo = (SELECT club_id FROM public.profiles WHERE id = auth.uid())
--     OR id::text = (SELECT club_id FROM public.profiles WHERE id = auth.uid())
--   )
--   WITH CHECK (
--     codigo = (SELECT club_id FROM public.profiles WHERE id = auth.uid())
--     OR id::text = (SELECT club_id FROM public.profiles WHERE id = auth.uid())
--   );
--
