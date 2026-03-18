-- Añadir URL de cámara/stream por mesa (para duelo en TV y streaming).
-- Ejecutar en Supabase SQL Editor si usas la tabla mesas para instalaciones.
-- Así la URL del stream no va en localStorage; solo se consulta por club_id + numero.

alter table mesas
  add column if not exists url_camara text;

comment on column mesas.url_camara is 'URL de transmisión/cámara para esta mesa (streaming duelo).';

-- Varias cámaras por mesa: array de { "nombre": "Cámara 1", "url": "https://..." }
alter table mesas
  add column if not exists urls_camaras jsonb default '[]';

comment on column mesas.urls_camaras is 'Lista de cámaras/streams de esta mesa. La primera es la principal para Duelo.';

-- Migrar url_camara existente a urls_camaras (solo si urls_camaras está vacío)
update mesas
set urls_camaras = jsonb_build_array(jsonb_build_object('nombre', 'Cámara 1', 'url', url_camara))
where url_camara is not null and trim(url_camara) <> ''
  and (urls_camaras is null or urls_camaras = '[]'::jsonb);
