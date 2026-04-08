-- Estado del marcador para overlay / OBS (TV salón premium). Upsert por match_id desde club/duelo_premium_tv.html

CREATE TABLE IF NOT EXISTS public.overlay_state (
    match_id text NOT NULL,
    club_nombre text NULL,
    j1_nombre text NULL,
    j2_nombre text NULL,
    j1_carambolas integer NOT NULL DEFAULT 0,
    j2_carambolas integer NOT NULL DEFAULT 0,
    j1_entradas integer NOT NULL DEFAULT 0,
    j2_entradas integer NOT NULL DEFAULT 0,
    j1_promedio double precision NOT NULL DEFAULT 0,
    j2_promedio double precision NOT NULL DEFAULT 0,
    objetivo integer NOT NULL DEFAULT 0,
    estado text NOT NULL DEFAULT 'en_juego',
    mesa text NULL,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT overlay_state_pkey PRIMARY KEY (match_id)
);

COMMENT ON TABLE public.overlay_state IS 'Marcador publicado por TV salón (mesa-tv-*) para consumo en overlay u otros clientes.';

ALTER TABLE public.overlay_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "overlay_state_rw" ON public.overlay_state;
CREATE POLICY "overlay_state_rw"
    ON public.overlay_state
    FOR ALL
    USING (true)
    WITH CHECK (true);
