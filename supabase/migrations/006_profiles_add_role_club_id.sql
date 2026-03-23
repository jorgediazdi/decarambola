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
