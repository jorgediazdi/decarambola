#!/bin/bash
# Espera hasta que haya conexión a Supabase (401 sin apikey cuenta como “servidor alcanzable”).
until curl -sS -o /dev/null --connect-timeout 5 --max-time 15 \
  "https://iwvogyloebvieloequzr.supabase.co/rest/v1/" 2>/dev/null; do
  echo "[bridge-wait] Esperando red..."
  sleep 5
done
echo "[bridge-wait] Red disponible — iniciando bridge"
cd ~/Desktop/decarambola/scripts/obs-overlay-bridge
exec /usr/local/bin/node index.mjs
