# Overlay en OBS - receta corta

> QA post-deploy: `docs/QA_STREAMING.md`
> Capas completas y refrescos: `STREAMING_QUE_SE_TRANSMITE.md`

Este archivo queda como **referencia rapida** para overlay.

## 1) Fuente navegador principal (marcador)

- URL: `https://decarambola.com/duelo-tv-preview.html?obs=1`
- Fondo transparente: **activo**
- Camara: debajo de esta fuente

## 2) Fuente overlay (opcional)

- URL base: `https://decarambola.com/overlay_marcador.html?match_id=TU_MATCH_ID`
- Grabacion: `&rec=1` o `&interval=30`
- Vivo YouTube: `&interval=120` (opcional)

## 3) Problemas comunes

- Negro en centro: falta `?obs=1` o transparencia.
- No sale barra: falta `match_id` o URL de overlay mal escrita.
- Se ve solo camara: el navegador del marcador esta debajo, debe ir encima.
