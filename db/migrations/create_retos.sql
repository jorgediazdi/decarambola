-- ═══════════════════════════════════════════════════════════════════════════
-- DDL documentado: tabla public.retos (retos / duelos entre jugadores).
-- Inferido del uso en reto_crear.html, apps/social/social-engine.js, jugador/index.html, js/api/jugador-api.js.
-- NO ejecutar ciegamente si la tabla ya existe en producción: comparar columnas y ajustar.
-- club_id en la app es TEXT (clubs.codigo o id en string) — no UUID fijo a clubs(id).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.retos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación del club (texto; mismo criterio que profiles.club_id / mi_perfil.club_id)
  club_id TEXT,

  retador_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  retado_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,

  estado TEXT NOT NULL DEFAULT 'pendiente',
  -- estados usados en código: pendiente, aceptado, en_curso, finalizado, cancelado
  -- social-engine también trata como finalizado: completado, cerrado (mayúsc/minúsc)

  codigo TEXT UNIQUE,

  -- JSON principal del flujo de creación (sharePayload en reto_crear.html)
  detalle JSONB DEFAULT '{}'::jsonb,
  -- Columnas alternativas leídas por detalleDesdeRow / normalizeRetoRow
  payload JSONB DEFAULT '{}'::jsonb,
  -- Objeto alternativo al detalle (detalleDesdeRow usa row.meta como documento JSON)
  meta JSONB,

  -- Espejo opcional de campos del detalle (columnas planas)
  modalidad TEXT,
  formato TEXT,
  apuesta NUMERIC DEFAULT 0,
  entrada_objetivo INTEGER,
  partida_id UUID,
  deporte TEXT DEFAULT 'carambola',
  fecha DATE,
  hora TIME,
  fecha_hora TIMESTAMPTZ,
  tipo TEXT DEFAULT 'publico',
  con_handicap BOOLEAN DEFAULT FALSE,
  meta_rival TEXT,

  retador_nombre TEXT,
  rival_nombre TEXT,
  retado_nombre TEXT,

  promedio_ganador NUMERIC,
  ganador_nombre TEXT,
  score TEXT,
  bolsa NUMERIC DEFAULT 0,
  resultado JSONB,
  resultado_texto TEXT,

  partida_corta BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.retos.club_id IS 'clubs.codigo o referencia textual al club; la app filtra con .eq(''club_id'', cid).';
COMMENT ON COLUMN public.retos.detalle IS 'Payload del creador (modalidad, formato, meta, fechaHora, retador, rival, bolsa, etc.).';
COMMENT ON COLUMN public.retos.payload IS 'Alias histórico / misma semántica que detalle (reto_crear detalleDesdeRow).';
COMMENT ON COLUMN public.retos.meta IS 'Documento JSON alternativo (cuando detalle/payload son null y row.meta es objeto).';

-- Índices
CREATE INDEX IF NOT EXISTS idx_retos_club_id ON public.retos (club_id);
CREATE INDEX IF NOT EXISTS idx_retos_estado ON public.retos (estado);
CREATE INDEX IF NOT EXISTS idx_retos_retador ON public.retos (retador_id);
CREATE INDEX IF NOT EXISTS idx_retos_retado ON public.retos (retado_id);
CREATE INDEX IF NOT EXISTS idx_retos_codigo ON public.retos (codigo);
CREATE INDEX IF NOT EXISTS idx_retos_club_updated ON public.retos (club_id, updated_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS retos_updated_at ON public.retos;
CREATE TRIGGER retos_updated_at
  BEFORE UPDATE ON public.retos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

COMMENT ON TABLE public.retos IS
'Retos y duelos entre jugadores. DDL inferido del código (reto_crear, social-engine, jugador-api). Verificar contra producción antes de ejecutar.';
