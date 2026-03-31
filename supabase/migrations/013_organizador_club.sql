-- Vínculos usuario (organizador) ↔ club para panel organizador y home dinámico.
-- App: apps/organizador/organizador.html lee filas activas con organizador_id = auth.uid().
-- Ejecutar en Supabase SQL Editor si no usás CLI de migraciones.

-- Rol en profiles (documentación; sin CHECK en BD)
COMMENT ON COLUMN public.profiles.role IS 'jugador | organizador | club_admin | superadmin';

CREATE TABLE IF NOT EXISTS public.organizador_club (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizador_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  permisos jsonb NOT NULL DEFAULT '{}'::jsonb,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizador_club_org_club_unique UNIQUE (organizador_id, club_id)
);

CREATE INDEX IF NOT EXISTS idx_organizador_club_organizador_id ON public.organizador_club (organizador_id);
CREATE INDEX IF NOT EXISTS idx_organizador_club_club_id ON public.organizador_club (club_id);

COMMENT ON TABLE public.organizador_club IS 'Asigna organizadores a clubs; RLS: lectura propia + admin del club + superadmin.';

ALTER TABLE public.organizador_club ENABLE ROW LEVEL SECURITY;

-- SELECT: filas propias; superadmin; club_admin del club (id o codigo como en mesas RLS)
DROP POLICY IF EXISTS "organizador_club_select" ON public.organizador_club;
CREATE POLICY "organizador_club_select"
  ON public.organizador_club FOR SELECT
  TO authenticated
  USING (
    organizador_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.clubs c ON c.id = organizador_club.club_id
      WHERE p.id = auth.uid()
        AND p.role = 'club_admin'
        AND p.club_id IS NOT NULL
        AND (
          btrim(p.club_id) = btrim(c.id::text)
          OR btrim(p.club_id) = btrim(c.codigo)
        )
    )
  );

-- INSERT: superadmin o club_admin del club destino
DROP POLICY IF EXISTS "organizador_club_insert" ON public.organizador_club;
CREATE POLICY "organizador_club_insert"
  ON public.organizador_club FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.clubs c ON c.id = club_id
      WHERE p.id = auth.uid()
        AND p.role = 'club_admin'
        AND p.club_id IS NOT NULL
        AND (
          btrim(p.club_id) = btrim(c.id::text)
          OR btrim(p.club_id) = btrim(c.codigo)
        )
    )
  );

-- UPDATE: superadmin o club_admin del club de la fila
DROP POLICY IF EXISTS "organizador_club_update" ON public.organizador_club;
CREATE POLICY "organizador_club_update"
  ON public.organizador_club FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.clubs c ON c.id = organizador_club.club_id
      WHERE p.id = auth.uid()
        AND p.role = 'club_admin'
        AND p.club_id IS NOT NULL
        AND (
          btrim(p.club_id) = btrim(c.id::text)
          OR btrim(p.club_id) = btrim(c.codigo)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.clubs c ON c.id = club_id
      WHERE p.id = auth.uid()
        AND p.role = 'club_admin'
        AND p.club_id IS NOT NULL
        AND (
          btrim(p.club_id) = btrim(c.id::text)
          OR btrim(p.club_id) = btrim(c.codigo)
        )
    )
  );

-- DELETE: superadmin o club_admin del club
DROP POLICY IF EXISTS "organizador_club_delete" ON public.organizador_club;
CREATE POLICY "organizador_club_delete"
  ON public.organizador_club FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.clubs c ON c.id = organizador_club.club_id
      WHERE p.id = auth.uid()
        AND p.role = 'club_admin'
        AND p.club_id IS NOT NULL
        AND (
          btrim(p.club_id) = btrim(c.id::text)
          OR btrim(p.club_id) = btrim(c.codigo)
        )
    )
  );
