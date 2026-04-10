# DeCarambola — Social Media Engine

Módulo para generar **borradores** de contenido social (copy + formatos) a partir de datos en Supabase (`retos`, `overlay_state`, `partidas` / ranking). **No publica** en Meta ni TikTok en esta fase: el operador exporta PNG y pega el texto manualmente.

## Archivos

| Archivo | Rol |
|--------|-----|
| `social-engine.js` | Lógica: normalización de filas, construcción de posts, suscripciones Realtime, ranking semanal, copy con Anthropic (opcional). |
| `social.css` | Estilos compartidos (mobile first, paleta #0a0a0a / #c9a84c). |
| `card-generator.html` | Herramienta interna: últimos retos finalizados, preview de card en canvas, edición de copy, descarga PNG (1080² o 1080×1920). |
| `panel-social.html` | Cola local, historial, configuración de hashtags/tono, escucha Realtime, disparo de ranking los lunes 09:00 (hora local). |

## Autenticación y club

- Las páginas usan el mismo cliente que el resto del sitio: `/js/supabase-client.js` (sin `service_role` en el navegador).
- El **club_id** sale de `profiles.club_id` del usuario autenticado (alineado con `clubs.codigo`).

## Disparadores (Realtime)

1. **Resultado de partida:** `UPDATE` en `retos` cuando `estado` pasa a uno de `RETO_ESTADOS_FINALIZADO`.
2. **Reto con apuesta:** `INSERT` en `retos` con bolsa/apuesta &gt; 0 (`parseApuesta`).
3. **En vivo:** cambios en `overlay_state` (p. ej. `duelo_premium_tv`). En el panel podés limitar a **solo INSERT** para anunciar al iniciar la partida (`enVivoSoloAlInsertar`).
4. **Ranking semanal:** `scheduleWeeklyRankingMonday` — cada lunes 09:00 hora local del navegador.

## Copy con IA (Anthropic)

- Modelo por defecto: `claude-sonnet-4-20250514` (constante `ANTHROPIC_DEFAULT_MODEL`).
- **Recomendado:** `proxyUrl` hacia un backend o Edge Function que llame a Anthropic con la API key en servidor. Así evitás exponer la clave y problemas de **CORS** (la API de Anthropic no está pensada para llamadas directas desde el navegador).
- El panel permite pegar clave en `sessionStorage` solo para pruebas; no la guardes en el repositorio.

## URLs en producción

- Panel: `https://decarambola.com/apps/social/panel-social.html`
- Cards: `https://decarambola.com/apps/social/card-generator.html`

## Próximas fases

- Publicación vía Meta Graph API y TikTok for Developers.
- Cola persistente en Supabase en lugar de `localStorage`.
- Tablas dedicadas de rankings/torneos cuando estén en el esquema.
