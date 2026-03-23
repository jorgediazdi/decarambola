-- ═══════════════════════════════════════════════════════════════════════════
-- “Falta fila en profiles” — tu usuario está en Auth pero no en public.profiles
-- Supabase → SQL Editor → Run UNA VEZ (no hace falta tocar el código de la app)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'jugador';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS club_id TEXT;

INSERT INTO public.profiles (id, role, club_id)
SELECT u.id, 'jugador', NULL::text
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Después, si sos staff, asigná rol en FIX_PROFILES_ROLE_SUPABASE.md (UPDATE club_admin + club_id).
