-- Hoja de vida / ficha extendida por mesa (JSON: compra, paño, monitor, cronología manual).
-- Ejecutar en Supabase → SQL Editor si al guardar la ficha ves error de columna desconocida.

alter table if exists mesas
  add column if not exists hoja_vida jsonb default '{}'::jsonb;

comment on column mesas.hoja_vida is 'JSON: fecha_compra, detalle_compra, fecha_ultimo_cambio_pano, meses_intervalo_pano, fecha_proximo_pano_manual, url_monitor, notas_monitor, cronologia[]';
