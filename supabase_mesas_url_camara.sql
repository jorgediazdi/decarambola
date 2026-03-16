-- Añadir URL de cámara/stream por mesa (para duelo en TV y streaming).
-- Ejecutar en Supabase SQL Editor si usas la tabla mesas para instalaciones.
-- Así la URL del stream no va en localStorage; solo se consulta por club_id + numero.

alter table mesas
  add column if not exists url_camara text;

comment on column mesas.url_camara is 'URL de transmisión/cámara para esta mesa (streaming duelo).';
