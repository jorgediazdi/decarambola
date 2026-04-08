# Puente OBS ↔ Supabase (transmisión centralizada)

Proceso **Node en el mismo Mac que OBS** (pm2). La TV publica `estado: 'transmitir'` en `overlay_state`; este puente se entera por **Realtime + polling**, lee `obs_ws_password` y `obs_browser_source_name` desde **`club_obs_config`** (configurada en `/club/obs-setup.html`), actualiza el **Browser Source** y llama **StartStream** / **StopStream**.

En HTTPS el navegador no puede abrir `ws://127.0.0.1:4455`; por eso el control de OBS va en Node, no en la web.

## Requisitos

- OBS con **obs-websocket** en **4455**.
- Fila en **`club_obs_config`** para `DECA_CLUB_ID` (técnico).
- Variables **`SUPABASE_URL`**, **`SUPABASE_SERVICE_ROLE_KEY`**, **`DECA_CLUB_ID`**.
- En OBS, perfil de transmisión con **`DECA_YT_STREAM_KEY`** (canal DeCarambola) si usás RTMP centralizado.

## Uso

```bash
cd scripts/obs-overlay-bridge
cp .env.example .env
# Completá SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DECA_CLUB_ID
npm install
npm start
```

Recomendado: **pm2** para mantener el proceso vivo.

## Variables

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor; no uses anon en producción. |
| `DECA_CLUB_ID` | Código de club (`clubs.codigo`). |
| `OVERLAY_BASE_URL` | Origen de `overlay_marcador.html` (ej. `https://decarambola.com`). |
| `DECA_YT_STREAM_KEY` | Referencia para documentar la clave del canal; la clave suele configurarse en OBS. |
| YouTube API | Opcional: ver `youtube-title.mjs` y comentarios en `index.mjs`. |

La contraseña WebSocket y el nombre del Browser Source **no** van en `.env`: salen de **`club_obs_config`**.
