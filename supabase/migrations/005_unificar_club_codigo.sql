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
