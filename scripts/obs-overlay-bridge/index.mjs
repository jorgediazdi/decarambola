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
import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';
import OBSWebSocket from 'obs-websocket-js';
import WebSocket from 'ws';
import { maybeUpdateYoutubeBroadcastTitle } from './youtube-title.mjs';

const execAsync = promisify(exec);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLUB_ID = (process.env.DECA_CLUB_ID || '').trim();

const OVERLAY_BASE = (process.env.OVERLAY_BASE_URL || 'https://decarambola.com').replace(/\/$/, '');
const OBS_WS = 'ws://127.0.0.1:4455';

if (!SUPABASE_URL || !SERVICE_KEY || !CLUB_ID) {
  console.error('Faltan SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o DECA_CLUB_ID');
  process.exit(1);
}

/** En Node < 22 no hay WebSocket global; Realtime exige `transport: ws` (ver @supabase/realtime-js). */
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: {
    transport: WebSocket,
  },
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** macOS: OBS Studio suele exponer el proceso como `OBS`. */
async function isObsRunningMac() {
  try {
    await execAsync('pgrep -x OBS', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function ensureObs() {
  await loadClubObsConfig();
  if (obsConnected) return;

  if (process.platform === 'darwin') {
    const running = await isObsRunningMac();
    if (!running) {
      try {
        await execAsync('open -a OBS');
        console.log('[bridge] OBS no estaba en ejecución; lanzado con open -a OBS. Esperando 3s…');
        await delay(3000);
      } catch (e) {
        console.warn('[bridge] No se pudo ejecutar open -a OBS:', e.message);
      }
    }
  }

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

    /**
     * YouTube + OBS (sobre todo en Mac): si no hay una emisión/broadcast creada en el perfil de
     * transmisión, StartStream puede fallar o no publicar. Eso no se arregla con requests extra
     * al WebSocket (p. ej. Identified es solo el handshake, no configura YouTube).
     * Solución rápida manual: en OBS → Administrar emisión → activar "Recordar estos ajustes" →
     * "Crear emisión y comenzar a transmitir" (o equivalente según idioma). Luego el bridge puede
     * llamar StartStream cuando la TV pida transmitir.
     */
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

function logRealtimeStatus(status, err) {
  if (status === 'SUBSCRIBED') {
    console.log('[bridge] Realtime SUBSCRIBED');
    return;
  }
  if (status === 'CHANNEL_ERROR') {
    const msg = err && err.message ? err.message : String(err || 'unknown');
    console.error('[bridge] Realtime CHANNEL_ERROR', msg);
    return;
  }
  if (status === 'TIMED_OUT') {
    console.error('[bridge] Realtime TIMED_OUT (revisá red, API keys y que overlay_state esté en la publicación supabase_realtime)');
    return;
  }
  if (status === 'CLOSED') {
    console.warn('[bridge] Realtime CLOSED');
    return;
  }
  console.log('[bridge] Realtime', status, err != null ? err : '');
}

async function main() {
  await loadClubObsConfig();

  /** Sin esto, el join puede ir sin JWT: connect() dispara setAuth en background (race). */
  await supabase.realtime.setAuth(SERVICE_KEY);

  const rtFilter = `club_id=eq.${encodeURIComponent(CLUB_ID)}`;

  supabase
    .channel(`deca-bridge-overlay-${encodeURIComponent(CLUB_ID)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'overlay_state',
        filter: rtFilter,
      },
      (payload) => {
        const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
        processOverlayPayload(row).catch((e) =>
          console.warn('[bridge] realtime handler', e.message)
        );
      }
    )
    .subscribe((status, err) => logRealtimeStatus(status, err));

  setInterval(() => {
    pollFallback().catch((e) => console.warn('[bridge] poll', e.message));
  }, 4000);

  void pollFallback().catch((e) => console.warn('[bridge] initial poll', e.message));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
