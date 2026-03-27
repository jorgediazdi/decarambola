-- 010 — Mapa físico (posición), streaming por mesa, sesiones con tarifa aplicada
-- Ejecutar después de supabase_mesas_instalaciones.sql y supabase_mesas_url_camara.sql (si aplica).

-- 1) Posición en el plano (0–100 % del contenedor del mapa; el cliente escala)
ALTER TABLE public.mesas
  ADD COLUMN IF NOT EXISTS posicion_x double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS posicion_y double precision DEFAULT 0;

COMMENT ON COLUMN public.mesas.posicion_x IS '% horizontal en el mapa de sala (0–100).';
COMMENT ON COLUMN public.mesas.posicion_y IS '% vertical en el mapa de sala (0–100).';

-- 2) URL de cámara / stream (Mux, YouTube, HLS, etc.)
ALTER TABLE public.mesas
  ADD COLUMN IF NOT EXISTS url_camara text;

COMMENT ON COLUMN public.mesas.url_camara IS 'URL principal de transmisión para previsualización en operación.';

-- 3) Historial de sesión: desglose de tarifa al cerrar (auditoría / TV / operario mismo dato)
ALTER TABLE public.mesas_historial
  ADD COLUMN IF NOT EXISTS tarifa_aplicada jsonb;

COMMENT ON COLUMN public.mesas_historial.tarifa_aplicada IS 'Snapshot: tarifa base, descuentos, fracciones/minuto al liquidar.';

-- 4) Vista compatible con nombre pedido en API (misma tabla fuente = una verdad)
CREATE OR REPLACE VIEW public.sesiones_mesa AS
SELECT
  id,
  mesa_id,
  club_id,
  inicio_sesion AS hora_inicio,
  fin_sesion AS hora_fin,
  tarifa_aplicada,
  costo_total AS total_pagar,
  estado,
  jugador_nombre,
  created_at
FROM public.mesas_historial;

COMMENT ON VIEW public.sesiones_mesa IS 'Alias de mesas_historial para integraciones; usar mesas_historial para INSERT/UPDATE.';

-- Nota RLS: las políticas existentes sobre mesas_historial aplican a la tabla base;
-- la vista hereda permisos según el rol de Postgres (habitualmente mismo que tabla).
