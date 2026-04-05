-- Meta por mesa (VIP, extensiones futuras)
ALTER TABLE public.mesas
  ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.mesas.meta IS 'JSON: es_vip (bool), etc.';
