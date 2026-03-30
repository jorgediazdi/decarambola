/**
 * OBS autostream: Supabase Realtime (mesas → ocupada/libre) + obs-websocket v5 nativo.
 * Sin librerías externas; Web Crypto + WebSocket.
 */
import { supabase } from '/js/supabase-client.js';

const OBS_WS_URL = 'ws://127.0.0.1:4456';

function normalizeEstado(e) {
  return String(e || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function isOcupada(estado) {
  return normalizeEstado(estado) === 'ocupada';
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** Autenticación obs-websocket v5 (Hello → Identify). */
async function obsAuthString(password, saltB64, challengeB64) {
  const enc = new TextEncoder();
  const salt = base64ToBytes(saltB64);
  const challenge = base64ToBytes(challengeB64);
  const passBytes = enc.encode(password);
  const buf1 = new Uint8Array(passBytes.length + salt.length);
  buf1.set(passBytes, 0);
  buf1.set(salt, passBytes.length);
  const secret = new Uint8Array(await crypto.subtle.digest('SHA-256', buf1));
  const buf2 = new Uint8Array(secret.length + challenge.length);
  buf2.set(secret, 0);
  buf2.set(challenge, secret.length);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', buf2));
  return bytesToBase64(hash);
}

function createObsClient() {
  let ws = null;
  let identifiedPromise = null;
  let identifiedResolve = null;
  let identifiedReject = null;
  let identifiedOk = false;
  const pending = new Map();
  let reqSeq = 0;

  function connect() {
    if (ws && ws.readyState === WebSocket.OPEN && identifiedOk) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      if (ws) {
        try {
          ws.close();
        } catch (e) {}
        ws = null;
      }
      identifiedOk = false;

      identifiedPromise = new Promise((res, rej) => {
        identifiedResolve = res;
        identifiedReject = rej;
      });

      ws = new WebSocket(OBS_WS_URL);

      const to = setTimeout(() => {
        try {
          ws.close();
        } catch (e) {}
        identifiedReject(new Error('OBS WebSocket timeout'));
      }, 15000);

      ws.onmessage = async function (ev) {
        let msg;
        try {
          msg = JSON.parse(typeof ev.data === 'string' ? ev.data : new TextDecoder().decode(ev.data));
        } catch (e) {
          return;
        }
        const op = msg.op;
        const d = msg.d || {};

        if (op === 0) {
          try {
            const hello = d;
            const rpcVersion = hello.rpcVersion != null ? hello.rpcVersion : 1;
            const identify = { rpcVersion };
            if (hello.authentication && hello.authentication.challenge && hello.authentication.salt) {
              var obsPassword = (window.DC_OBS_PASSWORD || '');
              identify.authentication = await obsAuthString(
                obsPassword,
                hello.authentication.salt,
                hello.authentication.challenge
              );
            }
            ws.send(JSON.stringify({ op: 1, d: identify }));
          } catch (e) {
            clearTimeout(to);
            identifiedReject(e);
          }
          return;
        }

        if (op === 2) {
          clearTimeout(to);
          identifiedOk = true;
          identifiedResolve(true);
          return;
        }

        if (op === 7) {
          const id = d.requestId;
          const pendingReq = pending.get(id);
          if (pendingReq) {
            pending.delete(id);
            const st = d.requestStatus || {};
            const ok = st.result === true || st.code === 100;
            if (ok) pendingReq.resolve(d.responseData);
            else {
              pendingReq.reject(new Error(st.comment || 'OBS request failed ' + (st.code != null ? st.code : '')));
            }
          }
          return;
        }
      };

      ws.onerror = function () {
        clearTimeout(to);
        identifiedReject(new Error('WebSocket error'));
      };

      ws.onclose = function () {
        identifiedOk = false;
        pending.forEach(function (p) {
          p.reject(new Error('WebSocket closed'));
        });
        pending.clear();
        ws = null;
      };

      identifiedPromise.then(() => clearTimeout(to)).catch(() => clearTimeout(to));

      identifiedPromise.then(resolve).catch(reject);
    });
  }

  async function request(requestType, requestData) {
    await connect();
    if (!ws || ws.readyState !== WebSocket.OPEN) throw new Error('OBS no conectado');
    await identifiedPromise;
    const requestId = 'obs-' + ++reqSeq + '-' + Date.now();
    return new Promise(function (resolve, reject) {
      pending.set(requestId, { resolve, reject });
      ws.send(
        JSON.stringify({
          op: 6,
          d: {
            requestType,
            requestId,
            requestData: requestData || {}
          }
        })
      );
      setTimeout(function () {
        if (pending.has(requestId)) {
          pending.delete(requestId);
          reject(new Error('OBS request timeout: ' + requestType));
        }
      }, 12000);
    });
  }

  return {
    startStream: function () {
      return request('StartStream', {});
    },
    stopStream: function () {
      return request('StopStream', {});
    },
    setScene: function (sceneName) {
      return request('SetCurrentProgramScene', { sceneName: sceneName });
    },
    getStreamStatus: function () {
      return request('GetStreamStatus', {});
    },
    disconnect: function () {
      identifiedOk = false;
      try {
        if (ws) ws.close();
      } catch (e) {}
      ws = null;
      identifiedPromise = null;
    }
  };
}

let singletonChannel = null;

/**
 * Escucha mesas del club por Realtime; al pasar a ocupada inicia stream en OBS,
 * al quedar sin mesas ocupadas detiene stream.
 * @param {string} clubId
 * @returns {function} cleanup — desuscribe y desconecta OBS
 */
export function initObsAutostream(clubId) {
  const cid = clubId != null ? String(clubId).trim() : '';
  if (!cid) {
    console.warn('[obs-autostream] clubId vacío');
    return function () {};
  }

  if (singletonChannel) {
    console.warn('[obs-autostream] ya hay una instancia; llamá al cleanup antes de reiniciar');
    return function () {};
  }

  const ocupadas = new Set();
  const obs = createObsClient();
  let streamStarted = false;

  async function syncStreamToObs() {
    const shouldRun = ocupadas.size > 0;
    try {
      if (shouldRun && !streamStarted) {
        await obs.startStream();
        streamStarted = true;
        console.log('[obs-autostream] StartStream OK');
      } else if (!shouldRun && streamStarted) {
        await obs.stopStream();
        streamStarted = false;
        console.log('[obs-autostream] StopStream OK');
      }
    } catch (e) {
      console.error('[obs-autostream]', e);
      if (shouldRun) streamStarted = false;
    }
  }

  function onPayload(payload) {
    const ev = payload.eventType || payload.event;
    const n = payload.new;
    const o = payload.old;

    if (ev === 'INSERT') {
      if (n && String(n.club_id || '').trim() === cid && n.id && isOcupada(n.estado)) {
        ocupadas.add(n.id);
        syncStreamToObs();
      }
      return;
    }
    if (ev === 'UPDATE') {
      if (o && String(o.club_id || '').trim() === cid && o.id && isOcupada(o.estado)) {
        ocupadas.delete(o.id);
      }
      if (n && String(n.club_id || '').trim() === cid && n.id) {
        if (isOcupada(n.estado)) ocupadas.add(n.id);
        else ocupadas.delete(n.id);
      }
      syncStreamToObs();
      return;
    }
    if (ev === 'DELETE') {
      if (o && String(o.club_id || '').trim() === cid && o.id && isOcupada(o.estado)) {
        ocupadas.delete(o.id);
        syncStreamToObs();
      }
    }
  }

  const filter = 'club_id=eq.' + cid;
  const chName = 'obs-autostream-' + encodeURIComponent(cid.replace(/[^a-zA-Z0-9_-]/g, '_'));

  singletonChannel = supabase
    .channel(chName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'mesas', filter },
      function (payload) {
        try {
          onPayload(payload);
        } catch (e) {
          console.error('[obs-autostream] payload', e);
        }
      }
    )
    .subscribe(function (status) {
      if (status === 'CHANNEL_ERROR') {
        console.error('[obs-autostream] Realtime CHANNEL_ERROR');
      }
    });

  return function cleanup() {
    try {
      if (singletonChannel) supabase.removeChannel(singletonChannel);
    } catch (e) {}
    singletonChannel = null;
    ocupadas.clear();
    obs.disconnect();
  };
}
