-- Ampliar CHECK de profiles.role para incluir 'organizador'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('jugador', 'club_admin', 'superadmin', 'organizador'));

COMMENT ON COLUMN public.profiles.role IS 'jugador | club_admin | superadmin | organizador';
