/**
 * Puente DeCarambola: corre en el mismo Mac que OBS (pm2).
 * - Lee club_obs_config (contraseña WS, nombre Browser Source) por DECA_CLUB_ID.
 * - Realtime + polling sobre overlay_state para este club_id.
 * - estado transmitir → SetInputSettings + StartStream + título YouTube (opcional).
 * - estado finalizado/terminado en la partida activa → StopStream.
 * - Errores → obs_logs (no rompe la partida).
 *
 * Variables obligatorias: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DECA_CLUB_ID
 * Opcional: DECA_YT_STREAM_KEY (documentación OBS; la clave va en perfil OBS),
 *          YouTube Data API: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, DECA_YOUTUBE_LIVE_BROADCAST_ID
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OBSWebSocket from 'obs-websocket-js';
import { maybeUpdateYoutubeBroadcastTitle } from './youtube-title.mjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLUB_ID = (process.env.DECA_CLUB_ID || '').trim();

const OVERLAY_BASE = (process.env.OVERLAY_BASE_URL || 'https://decarambola.com').replace(/\/$/, '');
const OBS_WS = 'ws://127.0.0.1:4455';

if (!SUPABASE_URL || !SERVICE_KEY || !CLUB_ID) {
  console.error('Faltan SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o DECA_CLUB_ID');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const obs = new OBSWebSocket();
let obsConnected = false;
let obsPassword = '';
let browserSourceName = 'Overlay DeCarambola';

let configLoadedAt = 0;
const CONFIG_TTL_MS = 60_000;

/** match_id en la que iniciamos streaming desde este proceso */
let activeLiveMatchId = null;
/** dedupe StartStream por (match_id|updated_at) */
let lastTransmitKey = null;

function normEstado(s) {
  return String(s || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

async function logObs(level, message, detail) {
  try {
    await supabase.from('obs_logs').insert({
      club_id: CLUB_ID,
      match_id: detail && detail.match_id ? String(detail.match_id) : activeLiveMatchId,
      level: level || 'error',
      message: String(message).slice(0, 2000),
      detail: detail && typeof detail === 'object' ? detail : null,
    });
  } catch (e) {
    console.error('[bridge] obs_logs insert failed', e.message);
  }
}

async function loadClubObsConfig() {
  const now = Date.now();
  if (now - configLoadedAt < CONFIG_TTL_MS && configLoadedAt > 0) return;
  const { data, error } = await supabase
    .from('club_obs_config')
    .select('obs_ws_password, obs_browser_source_name')
    .eq('club_id', CLUB_ID)
    .maybeSingle();
  if (error) {
    console.warn('[bridge] club_obs_config:', error.message);
    await logObs('error', 'club_obs_config: ' + error.message, { club_id: CLUB_ID });
    return;
  }
  if (data) {
    obsPassword = data.obs_ws_password ? String(data.obs_ws_password) : '';
    if (data.obs_browser_source_name && String(data.obs_browser_source_name).trim()) {
      browserSourceName = String(data.obs_browser_source_name).trim();
    }
  }
  configLoadedAt = now;
  console.log('[bridge] Config OBS club', CLUB_ID, 'source=', browserSourceName);
}

async function ensureObs() {
  await loadClubObsConfig();
  if (obsConnected) return;
  try {
    await obs.connect(OBS_WS, obsPassword || undefined);
    obsConnected = true;
    console.log('[bridge] OBS conectado', OBS_WS);
  } catch (e) {
    obsConnected = false;
    throw e;
  }
}

async function disconnectObsSafe() {
  try {
    await obs.disconnect();
  } catch (_) {}
  obsConnected = false;
}

function buildStreamTitle(row) {
  const club = row.club_nombre || '';
  const j1 = row.j1_nombre || '';
  const j2 = row.j2_nombre || '';
  const mesa = row.mesa || '';
  const fecha = new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  return [club, `${j1} vs ${j2}`, mesa, fecha].filter(Boolean).join(' | ').slice(0, 100);
}

async function handleTransmitir(row) {
  const matchId = row.match_id;
  if (!matchId) return;

  const key = String(matchId) + '|' + String(row.updated_at || '');
  if (key === lastTransmitKey) return;

  try {
    await ensureObs();
    const overlayUrl = `${OVERLAY_BASE}/overlay_marcador.html?match_id=${encodeURIComponent(matchId)}`;
    await obs.call('SetInputSettings', {
      inputName: browserSourceName,
      inputSettings: { url: overlayUrl, width: 1920, height: 1080 },
    });
    console.log('[bridge] SetInputSettings', browserSourceName, overlayUrl);

    await obs.call('StartStream');
    console.log('[bridge] StartStream');
    activeLiveMatchId = String(matchId);

    await supabase
      .from('overlay_state')
      .update({
        stream_bridge_status: 'live',
        stream_bridge_at: new Date().toISOString(),
      })
      .eq('match_id', matchId);

    const title = buildStreamTitle(row);
    await maybeUpdateYoutubeBroadcastTitle(title);
    lastTransmitKey = key;
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    console.error('[bridge] handleTransmitir:', msg);
    await logObs('error', 'Transmitir OBS: ' + msg, { match_id: matchId });
    await supabase
      .from('overlay_state')
      .update({
        stream_bridge_status: 'error_obs',
        stream_bridge_at: new Date().toISOString(),
      })
      .eq('match_id', matchId);
    await disconnectObsSafe();
  }
}

async function handleFinalizado(matchId) {
  if (!activeLiveMatchId || String(matchId) !== String(activeLiveMatchId)) return;
  try {
    await ensureObs();
    await obs.call('StopStream');
    console.log('[bridge] StopStream');
  } catch (e) {
    await logObs('error', 'StopStream: ' + (e.message || e), { match_id: matchId });
  } finally {
    activeLiveMatchId = null;
  }
}

async function fetchLatestTransmitRow() {
  const { data, error } = await supabase
    .from('overlay_state')
    .select('*')
    .eq('club_id', CLUB_ID)
    .order('updated_at', { ascending: false })
    .limit(25);

  if (error) {
    console.warn('[bridge] overlay_state list:', error.message);
    return null;
  }
  const rows = data || [];
  for (const r of rows) {
    if (normEstado(r.estado) === 'TRANSMITIR') return r;
  }
  return null;
}

async function processOverlayPayload(row) {
  if (!row) return;
  if (btrim(row.club_id) !== btrim(CLUB_ID)) return;
  const st = normEstado(row.estado);
  if (st === 'TRANSMITIR') {
    await handleTransmitir(row);
    return;
  }
  if (st === 'FINALIZADO' || st === 'TERMINADO') {
    await handleFinalizado(row.match_id);
    lastTransmitKey = null;
  }
}

function btrim(s) {
  return String(s || '').trim();
}

async function pollFallback() {
  const row = await fetchLatestTransmitRow();
  if (row) await handleTransmitir(row);
}

async function main() {
  await loadClubObsConfig();

  supabase
    .channel(`deca-bridge-overlay-${CLUB_ID}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'overlay_state',
        filter: `club_id=eq.${CLUB_ID}`,
      },
      (payload) => {
        const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
        processOverlayPayload(row).catch((e) =>
          console.warn('[bridge] realtime handler', e.message)
        );
      }
    )
    .subscribe((status) => console.log('[bridge] Realtime', status));

  setInterval(() => {
    pollFallback().catch((e) => console.warn('[bridge] poll', e.message));
  }, 4000);

  await pollFallback();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
