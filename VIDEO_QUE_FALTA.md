# Video - contexto y backlog

> QA tras cada subida: `docs/QA_STREAMING.md`

Este documento queda como **contexto** (no checklist principal).

## Punto clave de datos

- En streaming, en tablas/config se guarda una **URL** (embed/watch/stream).
- El archivo de video **no** se guarda en tu base; el video queda en YouTube.

## Flujo base (resumen)

1. OBS: navegador con `duelo-tv-preview.html?obs=1` + fondo transparente.
2. OBS: camara debajo del navegador.
3. OBS: clave de YouTube y salida en vivo.
4. Overlay barra opcional con `overlay_marcador.html?match_id=...`.

## Backlog

- URL/ID visible para jugador por torneo/partida (busqueda facil).
- Integracion MUX para torneos especiales/pago (fase posterior).
- Politica de audio/derechos en directos (operativo de sala + OBS).
