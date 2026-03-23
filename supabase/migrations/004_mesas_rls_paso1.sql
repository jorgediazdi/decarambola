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
