-- ═══════════════════════════════════════════════════════════════════════════
-- UN SOLO ARCHIVO PARA COPIAR/PEGAR EN SUPABASE → SQL EDITOR
-- Abre ESTE archivo en Cursor → Cmd+A → Cmd+C → pega en Supabase → Run
--
-- ANTES (solo si NO tienes tablas mesas/mesas_config): ejecuta aparte:
--   supabase_mesas_instalaciones.sql  (en la raíz del proyecto)
-- Luego corre TODO este script de una vez (o por bloques si prefieres).
-- ═══════════════════════════════════════════════════════════════════════════


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 001_profiles_auth.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- DeCarambola — Auth: perfiles + RLS mínimo
-- Ejecutar en Supabase → SQL Editor (una vez)

-- 1) Tabla de perfil ligada al usuario de Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'jugador' CHECK (role IN ('jugador', 'club_admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfil app; auth.users es la fuente de identidad';

-- 2) RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Lectura pública opcional desactivada: solo el dueño ve su fila

-- 3) Al registrarse: crear fila en profiles (bypass RLS con SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4) Permisos
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 002_mesas_luz_encendida.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Columna para iluminación / señal en UI (index Administración de Mesas)
ALTER TABLE public.mesas
  ADD COLUMN IF NOT EXISTS luz_encendida boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.mesas.luz_encendida IS 'Estado visual luz (TV/lámpara) — usado desde la app';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 003_mesas_hora_apertura.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Inicio de sesión de cobro al abrir mesa (index / administración de mesas)
ALTER TABLE public.mesas
  ADD COLUMN IF NOT EXISTS hora_apertura TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.mesas.hora_apertura IS 'Marca de tiempo al abrir mesa para calcular cobro por tiempo';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 004_mesas_rls_paso1.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 005_unificar_club_codigo.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ═══════════════════════════════════════════════════════════════════════════
-- REGLA ÚNICA — docs/CANON_CLUB_ID.md
-- profiles.club_id, mesas.club_id, mesas_config.club_id = clubs.codigo (texto)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'clubs'
  ) THEN
    -- A) profiles: uuid guardado como texto → codigo
    UPDATE public.profiles p
    SET club_id = c.codigo
    FROM public.clubs c
    WHERE p.club_id IS NOT NULL
      AND btrim(p.club_id) = c.id::text;

    UPDATE public.profiles p
    SET club_id = c.codigo
    FROM public.clubs c
    WHERE p.club_id IS NOT NULL
      AND lower(btrim(p.club_id)) = lower(btrim(c.codigo))
      AND btrim(p.club_id) IS DISTINCT FROM c.codigo;

    -- mesas_config
    UPDATE public.mesas_config mc
    SET club_id = c.codigo
    FROM public.clubs c
    WHERE mc.club_id IS NOT NULL
      AND btrim(mc.club_id) = c.id::text;

    -- mesas: uuid → codigo
    UPDATE public.mesas m
    SET club_id = c.codigo
    FROM public.clubs c
    WHERE m.club_id IS NOT NULL
      AND btrim(m.club_id) = c.id::text;
  END IF;
END $$;

-- D) mesas: heredar del salón (no requiere tabla clubs)
UPDATE public.mesas m
SET club_id = mc.club_id
FROM public.mesas_config mc
WHERE m.salon_id = mc.id
  AND mc.club_id IS NOT NULL
  AND btrim(mc.club_id) <> ''
  AND (m.club_id IS NULL OR btrim(m.club_id) = '');

-- E) reservas / historial desde mesa
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mesas_reservas') THEN
    UPDATE public.mesas_reservas r
    SET club_id = m.club_id
    FROM public.mesas m
    WHERE r.mesa_id = m.id
      AND m.club_id IS NOT NULL
      AND btrim(m.club_id) <> ''
      AND (r.club_id IS NULL OR btrim(r.club_id) = '');
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mesas_historial') THEN
    UPDATE public.mesas_historial h
    SET club_id = m.club_id
    FROM public.mesas m
    WHERE h.mesa_id = m.id
      AND m.club_id IS NOT NULL
      AND btrim(m.club_id) <> ''
      AND (h.club_id IS NULL OR btrim(h.club_id) = '');
  END IF;
END $$;
