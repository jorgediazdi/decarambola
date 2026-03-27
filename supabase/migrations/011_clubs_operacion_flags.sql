-- Flags de operación / onboarding pasos 3–4 en clubs (fuente de verdad en Supabase).
-- Tras ejecutar, actualizar desde la app al guardar mesas_config / tarifas (js/sync-club-operacion-flags.js).
-- RLS: permitir UPDATE de setup_salon_ok / setup_tarifas_ok al staff del club (mismo criterio que otros campos).

ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS setup_salon_ok boolean NOT NULL DEFAULT false;

ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS setup_tarifas_ok boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.clubs.setup_salon_ok IS 'Paso 3: existe mesas_config para el club y al menos 1 fila en mesas';
COMMENT ON COLUMN public.clubs.setup_tarifas_ok IS 'Paso 4: en mesas_config.tarifas hay al menos hora|media|manana|noche|finde > 0';
