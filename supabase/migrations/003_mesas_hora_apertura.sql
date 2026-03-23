-- Inicio de sesión de cobro al abrir mesa (index / administración de mesas)
ALTER TABLE public.mesas
  ADD COLUMN IF NOT EXISTS hora_apertura TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.mesas.hora_apertura IS 'Marca de tiempo al abrir mesa para calcular cobro por tiempo';
