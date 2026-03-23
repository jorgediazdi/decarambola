-- Columna para iluminación / señal en UI (index Administración de Mesas)
ALTER TABLE public.mesas
  ADD COLUMN IF NOT EXISTS luz_encendida boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.mesas.luz_encendida IS 'Estado visual luz (TV/lámpara) — usado desde la app';
