/**
 * DeCarambola — Social Media Engine
 * Generación estructurada de borradores para redes (Facebook, Instagram, TikTok)
 * a partir de datos en vivo: retos, overlay_state, partidas/ranking.
 *
 * Uso (página o worker con type="module"):
 *   import * as Social from '/apps/social/social-engine.js';
 *   Social.subscribeRetoFinalizado(clubId, (draft) => { ... });
 *
 * No publica automáticamente a APIs externas: entrega objetos "draft" + formatos.
 */
import { supabase } from '/js/supabase-client.js';

/** Formatos de salida recomendados (px). */
export const SOCIAL_FORMATS = {
  FEED_SQUARE: { width: 1080, height: 1080, aspect: '1:1', label: 'Instagram / Facebook feed' },
  STORY_VERTICAL: { width: 1080, height: 1920, aspect: '9:16', label: 'TikTok / Stories / Reels' },
};

/** Tipos de contenido que genera el motor. */
export const SOCIAL_CONTENT_KIND = {
  RESULTADO_PARTIDA: 'resultado_partida',
  RETO_EN_VIVO: 'reto_en_vivo',
  RANKING_SEMANAL: 'ranking_semanal',
  RETO_CASERITO: 'reto_caserito',
};

/** Modelo Claude (Anthropic). Configurable por opciones en generateCopyWithAnthropic. */
export const ANTHROPIC_DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export const ANTHROPIC_API_VERSION = '2023-06-01';

/**
 * Estados de reto considerados "cerrados" para post de resultado.
 * Ajustá en BD/app cuando defináis el flujo de cierre (hoy el alta usa `pendiente`).
 */
export const RETO_ESTADOS_FINALIZADO = [
  'finalizado',
  'FINALIZADO',
  'completado',
  'COMPLETADO',
  'cerrado',
  'CERRADO',
];

function btrim(s) {
  return String(s == null ? '' : s).trim();
}

/** Apuesta numérica desde `bolsa` / texto (reto caserito). */
export function parseApuesta(bolsaStr) {
  var s = btrim(bolsaStr).replace(/[$\s]/g, '').replace(',', '.');
  var n = parseFloat(s);
  return isNaN(n) || n <= 0 ? 0 : n;
}

/** URL pública para unirse al reto (mismo criterio que reto_crear). */
export function buildRetoJoinUrl(codigo, origin) {
  var base = origin != null ? String(origin).replace(/\/$/, '') : '';
  if (!base && typeof window !== 'undefined' && window.location && window.location.origin) {
    base = window.location.origin;
  }
  if (!base) base = 'https://decarambola.com';
  var c = encodeURIComponent(btrim(codigo));
  return base + '/reto_crear.html?reto=' + c;
}

/**
 * Extrae campos útiles de `retos.detalle` / `payload` / columnas planas (compatible con reto_crear.html).
 */
export function normalizeRetoRow(row) {
  if (!row || typeof row !== 'object') return null;
  var d = row.detalle != null ? row.detalle : row.payload != null ? row.payload : null;
  if (d == null && row.meta != null && typeof row.meta === 'object' && !Array.isArray(row.meta)) {
    d = row.meta;
  }
  if (typeof d === 'string') {
    try {
      d = JSON.parse(d);
    } catch (_e) {
      d = null;
    }
  }
  var fromJson = d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  var retador = fromJson.retador || row.retador_nombre || row.retador || '';
  var retado = fromJson.rival || row.rival_nombre || row.rival || row.retado_nombre || '';
  var modalidad = fromJson.modalidad || row.modalidad || '';
  var meta = fromJson.meta != null ? String(fromJson.meta) : row.meta != null ? String(row.meta) : '';
  var bolsa = fromJson.bolsa != null ? String(fromJson.bolsa) : row.bolsa != null ? String(row.bolsa) : '';
  var resultado = row.resultado != null ? String(row.resultado) : fromJson.resultado != null ? String(fromJson.resultado) : '';
  return {
    id: row.id,
    codigo: row.codigo,
    club_id: row.club_id != null ? String(row.club_id).trim() : '',
    retador_id: row.retador_id,
    retado_id: row.retado_id,
    estado: btrim(row.estado),
    retador: btrim(retador),
    retado: btrim(retado),
    modalidad: btrim(modalidad),
    meta: btrim(meta),
    bolsa: btrim(bolsa),
    resultado: btrim(resultado),
    ganador_nombre: btrim(row.ganador_nombre || fromJson.ganador || ''),
    score: row.score != null ? String(row.score) : fromJson.score != null ? String(fromJson.score) : '',
    promedio_ganador:
      row.promedio_ganador != null
        ? Number(row.promedio_ganador)
        : fromJson.promedio_ganador != null
          ? Number(fromJson.promedio_ganador)
          : null,
    updated_at: row.updated_at,
    created_at: row.created_at,
    raw: row,
  };
}

/** Normaliza fila overlay_state (TV salón / duelo premium). */
export function normalizeOverlayRow(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    match_id: row.match_id,
    club_id: row.club_id != null ? String(row.club_id).trim() : '',
    club_nombre: btrim(row.club_nombre),
    j1_nombre: btrim(row.j1_nombre),
    j2_nombre: btrim(row.j2_nombre),
    j1_carambolas: Number(row.j1_carambolas) || 0,
    j2_carambolas: Number(row.j2_carambolas) || 0,
    j1_promedio: Number(row.j1_promedio) || 0,
    j2_promedio: Number(row.j2_promedio) || 0,
    objetivo: Number(row.objetivo) || 0,
    estado: btrim(row.estado),
    mesa: btrim(row.mesa),
    stream_bridge_status: btrim(row.stream_bridge_status),
    updated_at: row.updated_at,
    raw: row,
  };
}

export function isRetoFinalizado(estado) {
  var e = btrim(estado).toLowerCase();
  for (var i = 0; i < RETO_ESTADOS_FINALIZADO.length; i++) {
    if (RETO_ESTADOS_FINALIZADO[i].toLowerCase() === e) return true;
  }
  return false;
}

/** Nombre del club para copy (codigo o nombre). */
export async function fetchClubNombre(clubId) {
  var cid = btrim(clubId);
  if (!cid) return 'DeCarambola';
  try {
    var byCode = await supabase.from('clubs').select('nombre, codigo').eq('codigo', cid).maybeSingle();
    if (!byCode.error && byCode.data && byCode.data.nombre) return btrim(byCode.data.nombre);
    var byId = await supabase.from('clubs').select('nombre, codigo').eq('id', cid).maybeSingle();
    if (!byId.error && byId.data && byId.data.nombre) return btrim(byId.data.nombre);
  } catch (_e) {}
  return cid;
}

/** Marca del club para cards (logo, ciudad). Sin hardcodear club_id: el caller pasa el id del perfil. */
export async function fetchClubBranding(clubId) {
  var cid = btrim(clubId);
  var out = { nombre: 'Club', logo_url: '', ciudad: '', codigo: cid };
  if (!cid) return out;
  try {
    var byCode = await supabase.from('clubs').select('nombre, codigo, logo_url, ciudad').eq('codigo', cid).maybeSingle();
    if (!byCode.error && byCode.data) {
      out.nombre = btrim(byCode.data.nombre) || out.nombre;
      out.logo_url = btrim(byCode.data.logo_url);
      out.ciudad = btrim(byCode.data.ciudad);
      out.codigo = btrim(byCode.data.codigo) || cid;
      return out;
    }
    var byId = await supabase.from('clubs').select('nombre, codigo, logo_url, ciudad').eq('id', cid).maybeSingle();
    if (!byId.error && byId.data) {
      out.nombre = btrim(byId.data.nombre) || out.nombre;
      out.logo_url = btrim(byId.data.logo_url);
      out.ciudad = btrim(byId.data.ciudad);
      out.codigo = btrim(byId.data.codigo) || cid;
    }
  } catch (_e) {}
  return out;
}

/**
 * 1) Post resultado de partida / reto cerrado.
 * @param {object} retoRow fila `retos`
 * @param {string} [clubNombre]
 */
export async function buildPostResultadoPartida(retoRow, clubNombre) {
  var r = normalizeRetoRow(retoRow);
  if (!r) return null;
  var club = clubNombre != null ? btrim(clubNombre) : await fetchClubNombre(r.club_id);
  var ganador = r.ganador_nombre || r.resultado || '—';
  var cuerpo =
    '🎱 Resultado en ' +
    club +
    '\n\n' +
    'Retador: ' +
    (r.retador || '—') +
    '\n' +
    'Rival: ' +
    (r.retado || '—') +
    '\n' +
    'Ganador: ' +
    ganador +
    (r.score ? '\nMarcador: ' + r.score : '') +
    (r.promedio_ganador != null && !isNaN(r.promedio_ganador)
      ? '\nPromedio: ' + r.promedio_ganador.toFixed(3)
      : '') +
    (r.modalidad ? '\nModalidad: ' + r.modalidad : '') +
    (r.meta ? '\nMeta: ' + r.meta : '') +
    (r.bolsa ? '\nBolsa: $' + r.bolsa : '') +
    '\n\n#Carambola #Billar #DeCarambola';
  return {
    kind: SOCIAL_CONTENT_KIND.RESULTADO_PARTIDA,
    title: 'Resultado — ' + club,
    body: cuerpo,
    hashtags: ['Carambola', 'Billar', 'DeCarambola', btrim(r.modalidad).replace(/\s+/g, '') || '3Bandas'].filter(Boolean),
    formats: [SOCIAL_FORMATS.FEED_SQUARE, SOCIAL_FORMATS.STORY_VERTICAL],
    carousel: false,
    source: { table: 'retos', id: r.id, codigo: r.codigo },
    data: r,
  };
}

/**
 * 2) Post “en vivo” desde marcador TV (overlay_state).
 * @param {object} overlayRow fila `overlay_state`
 */
export async function buildPostRetoEnVivo(overlayRow, clubNombre) {
  var o = normalizeOverlayRow(overlayRow);
  if (!o) return null;
  var club =
    clubNombre != null
      ? btrim(clubNombre)
      : o.club_nombre || (await fetchClubNombre(o.club_id));
  var j1 = o.j1_nombre || 'Jugador 1';
  var j2 = o.j2_nombre || 'Jugador 2';
  var cuerpo =
    'EN VIVO AHORA 🎱\n\n' +
    j1 +
    ' vs ' +
    j2 +
    '\n' +
    (o.mesa ? 'Mesa ' + o.mesa + '\n' : '') +
    club +
    '\n\n' +
    o.j1_carambolas +
    ' - ' +
    o.j2_carambolas +
    ' · meta ' +
    o.objetivo +
    '\n\n#EnVivo #Carambola #DeCarambola';
  return {
    kind: SOCIAL_CONTENT_KIND.RETO_EN_VIVO,
    title: 'En vivo — ' + club,
    body: cuerpo,
    hashtags: ['EnVivo', 'Carambola', 'DeCarambola'],
    formats: [SOCIAL_FORMATS.STORY_VERTICAL],
    carousel: false,
    source: { table: 'overlay_state', match_id: o.match_id },
    data: o,
  };
}

/**
 * 3) Ranking semanal Top 5 por promedio (partidas últimos 7 días, jugadores del club).
 * @param {string} clubId texto `profiles.club_id` / `clubs.codigo`
 */
export async function fetchWeeklyTopPlayers(clubId, limit) {
  var cid = btrim(clubId);
  var lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);
  if (!cid) return { data: [], error: null };

  var prof = await supabase.from('profiles').select('id').eq('club_id', cid);
  if (prof.error) return { data: [], error: prof.error };
  var ids = (prof.data || []).map(function (p) {
    return p.id;
  });
  if (!ids.length) return { data: [], error: null };

  var hace7 = new Date();
  hace7.setDate(hace7.getDate() - 7);
  var iso = hace7.toISOString();

  var part = await supabase
    .from('partidas')
    .select('jugador1_id, jugador2_id, promedio_j1, promedio_j2, created_at')
    .gte('created_at', iso);
  if (part.error) return { data: [], error: part.error };

  var idSet = {};
  ids.forEach(function (id) {
    idSet[id] = true;
  });

  var sums = {};
  function add(id, prom) {
    if (!id || !idSet[id]) return;
    var p = parseFloat(prom);
    if (isNaN(p) || p <= 0) return;
    if (!sums[id]) sums[id] = { total: 0, n: 0 };
    sums[id].total += p;
    sums[id].n += 1;
  }

  (part.data || []).forEach(function (row) {
    add(row.jugador1_id, row.promedio_j1);
    add(row.jugador2_id, row.promedio_j2);
  });

  var ranked = Object.keys(sums).map(function (id) {
    return { id: id, promedio: sums[id].total / sums[id].n };
  });
  ranked.sort(function (a, b) {
    return b.promedio - a.promedio;
  });
  ranked = ranked.slice(0, lim);

  var names = {};
  if (ranked.length) {
    var nomR = await supabase
      .from('profiles')
      .select('*')
      .in(
        'id',
        ranked.map(function (x) {
          return x.id;
        })
      );
    if (!nomR.error && nomR.data) {
      nomR.data.forEach(function (p) {
        names[p.id] = btrim(p.nombre_completo || p.display_name || p.email || '');
      });
    }
  }

  return {
    data: ranked.map(function (r, i) {
      return {
        pos: i + 1,
        jugador_id: r.id,
        nombre: names[r.id] || 'Jugador',
        promedio: r.promedio,
      };
    }),
    error: null,
  };
}

export async function buildPostRankingSemanal(clubId, clubNombre) {
  var top = await fetchWeeklyTopPlayers(clubId, 5);
  if (top.error) return { kind: SOCIAL_CONTENT_KIND.RANKING_SEMANAL, error: top.error };
  var club = clubNombre != null ? btrim(clubNombre) : await fetchClubNombre(clubId);
  var lines = top.data.map(function (r) {
    return r.pos + '. ' + r.nombre + ' — ' + r.promedio.toFixed(3);
  });
  var cuerpo =
    '📊 Top semanal — ' +
    club +
    '\n\n' +
    (lines.length ? lines.join('\n') : 'Sin partidas registradas esta semana.') +
    '\n\n#Ranking #Carambola #DeCarambola';
  return {
    kind: SOCIAL_CONTENT_KIND.RANKING_SEMANAL,
    title: 'Ranking semanal — ' + club,
    body: cuerpo,
    hashtags: ['Ranking', 'Carambola', 'DeCarambola'],
    formats: [SOCIAL_FORMATS.FEED_SQUARE],
    carousel: true,
    carouselSlides: top.data.map(function (r) {
      return {
        title: '#' + r.pos + ' ' + r.nombre,
        subtitle: 'Promedio ' + r.promedio.toFixed(3),
      };
    }),
    source: { table: 'partidas', window: '7d', club_id: btrim(clubId) },
    data: top.data,
  };
}

function inferPerdedorDesdeReto(r) {
  var g = btrim(r.ganador_nombre || r.resultado || '').toLowerCase();
  var a = btrim(r.retador).toLowerCase();
  var b = btrim(r.retado).toLowerCase();
  if (g && a && g === a) return btrim(r.retado) || '—';
  if (g && b && g === b) return btrim(r.retador) || '—';
  if (btrim(r.retador)) return btrim(r.retado) || '—';
  return '—';
}

/**
 * 4) Reto con apuesta (caserito): bolsa/apuesta &gt; 0.
 * @param {object} retoRow fila `retos`
 * @param {string} [origin] para URL de unión (default: window o decarambola.com)
 */
export async function buildPostRetoCaserito(retoRow, clubNombre, origin) {
  var r = normalizeRetoRow(retoRow);
  if (!r) return null;
  var ap = parseApuesta(r.bolsa);
  if (ap <= 0) return null;
  var club = clubNombre != null ? btrim(clubNombre) : await fetchClubNombre(r.club_id);
  var joinUrl = buildRetoJoinUrl(r.codigo || '', origin);
  var cuerpo =
    '¡Hay reto! ¿Quién gana? 🎱\n\n' +
    (r.retador || '—') +
    ' vs ' +
    (r.retado || '—') +
    '\nApuesta: $' +
    ap +
    '\n' +
    club +
    '\n\nÚnete: ' +
    joinUrl +
    '\n\n#Reto #Carambola #DeCarambola';
  return {
    kind: SOCIAL_CONTENT_KIND.RETO_CASERITO,
    title: 'Reto con apuesta — ' + club,
    body: cuerpo,
    hashtags: ['Reto', 'Carambola', 'DeCarambola'],
    formats: [SOCIAL_FORMATS.FEED_SQUARE],
    carousel: false,
    source: { table: 'retos', id: r.id, codigo: r.codigo },
    data: Object.assign({}, r, { apuesta_num: ap, join_url: joinUrl }),
  };
}

/** Retos en estado finalizado (últimos N) para cards / backoffice. */
export async function fetchRetosFinalizados(clubId, limit) {
  var cid = btrim(clubId);
  var lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
  if (!cid) return { data: [], error: null };
  var r = await supabase
    .from('retos')
    .select('*')
    .eq('club_id', cid)
    .order('updated_at', { ascending: false })
    .limit(Math.min(lim * 4, 80));
  if (r.error) return { data: [], error: r.error };
  var rows = (r.data || []).filter(function (row) {
    return isRetoFinalizado(row.estado);
  });
  rows = rows.slice(0, lim);
  return { data: rows.map(normalizeRetoRow), error: null };
}

/**
 * Prompt de usuario para Anthropic según tipo (sin hashtags en resultado: se piden aparte).
 * @param {string} kind SOCIAL_CONTENT_KIND.*
 * @param {object} vars ver generateCopyWithAnthropic
 */
export function buildAnthropicUserPrompt(kind, vars) {
  vars = vars || {};
  var nombre_club = btrim(vars.nombre_club) || 'el club';
  var tono = btrim(vars.tono) || 'casual';
  if (kind === SOCIAL_CONTENT_KIND.RESULTADO_PARTIDA) {
    var red = btrim(vars.red_social) || 'Instagram';
    return (
      'Eres el community manager de ' +
      nombre_club +
      ', un billar de carambola en Colombia.\n' +
      'Genera un post corto, emocionante y en español colombiano para ' +
      red +
      ' sobre este resultado: ' +
      btrim(vars.ganador) +
      ' venció a ' +
      btrim(vars.perdedor) +
      ' con score ' +
      btrim(vars.score) +
      ' y promedio ' +
      btrim(vars.promedio) +
      ' en ' +
      btrim(vars.modalidad) +
      '.\n' +
      'Máximo 3 líneas. Incluye 1 emoji relevante.\n' +
      'Tono: ' +
      tono +
      '.\n' +
      'NO uses hashtags (se agregan aparte).'
    );
  }
  if (kind === SOCIAL_CONTENT_KIND.RETO_EN_VIVO) {
    return (
      'Genera un texto corto para anunciar que ' +
      btrim(vars.jugador1) +
      ' vs ' +
      btrim(vars.jugador2) +
      ' están jugando EN VIVO AHORA en ' +
      nombre_club +
      '.\n' +
      'Máximo 2 líneas. Emocionante.\n' +
      'NO uses hashtags (se agregan aparte).'
    );
  }
  if (kind === SOCIAL_CONTENT_KIND.RANKING_SEMANAL) {
    return (
      'Genera un texto para presentar el ranking semanal de ' +
      nombre_club +
      '.\n' +
      'El líder es ' +
      btrim(vars.jugador1) +
      ' con promedio ' +
      btrim(vars.promedio) +
      '.\n' +
      'Máximo 2 líneas.\n' +
      'NO uses hashtags (se agregan aparte).'
    );
  }
  if (kind === SOCIAL_CONTENT_KIND.RETO_CASERITO) {
    return (
      'Eres el community manager de ' +
      nombre_club +
      ' (billar carambola, Colombia).\n' +
      'Genera un post corto y picante para anunciar un reto con apuesta: ' +
      btrim(vars.retador) +
      ' vs ' +
      btrim(vars.retado) +
      ', bolsa $' +
      btrim(vars.apuesta) +
      '.\n' +
      'Máximo 2 líneas, 1 emoji. Tono: ' +
      tono +
      '.\n' +
      'NO uses hashtags (se agregan aparte).'
    );
  }
  return '';
}

/**
 * Genera copy con Claude (Anthropic). No incluye API key en el repo: pasá `apiKey` desde el operador
 * (p. ej. sessionStorage) o `proxyUrl` a un backend / Edge Function que firme la petición.
 *
 * @param {object} opts
 * @param {string} opts.kind SOCIAL_CONTENT_KIND
 * @param {object} opts.vars placeholders del prompt
 * @param {string} [opts.apiKey]
 * @param {string} [opts.proxyUrl] POST JSON { model, max_tokens, messages } → respuesta Anthropic o { content: [{ text }] }
 * @param {string} [opts.model]
 * @returns {Promise<{ text: string, error: Error|null }>}
 */
export async function generateCopyWithAnthropic(opts) {
  opts = opts || {};
  var kind = opts.kind;
  var vars = opts.vars || {};
  var userPrompt = buildAnthropicUserPrompt(kind, vars);
  if (!userPrompt) return { text: '', error: new Error('Tipo de contenido no soportado para IA') };
  var model = btrim(opts.model) || ANTHROPIC_DEFAULT_MODEL;
  var maxTokens = opts.max_tokens != null ? opts.max_tokens : 256;
  var body = {
    model: model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: userPrompt }],
  };
  try {
    if (opts.proxyUrl) {
      var pr = await fetch(String(opts.proxyUrl), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      var pj = await pr.json().catch(function () {
        return null;
      });
      if (!pr.ok) {
        return {
          text: '',
          error: new Error((pj && pj.error) || pr.statusText || 'Error proxy Anthropic'),
        };
      }
      var txtProxy = extractAnthropicText(pj);
      return { text: txtProxy, error: txtProxy ? null : new Error('Respuesta vacía (proxy)') };
    }
    var apiKey = btrim(opts.apiKey);
    if (!apiKey) {
      return {
        text: '',
        error: new Error('Falta apiKey o proxyUrl para Anthropic (no se usa service_role en front)'),
      };
    }
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify(body),
    });
    var j = await res.json().catch(function () {
      return null;
    });
    if (!res.ok) {
      return {
        text: '',
        error: new Error((j && j.error && j.error.message) || res.statusText || 'Anthropic error'),
      };
    }
    var text = extractAnthropicText(j);
    return { text: text, error: text ? null : new Error('Respuesta vacía') };
  } catch (e) {
    return { text: '', error: e instanceof Error ? e : new Error(String(e)) };
  }
}

function extractAnthropicText(json) {
  if (!json || !json.content || !json.content.length) return '';
  var parts = [];
  for (var i = 0; i < json.content.length; i++) {
    var c = json.content[i];
    if (c && c.type === 'text' && c.text) parts.push(c.text);
  }
  return parts.join('\n').trim();
}

/** Vars para IA desde un draft estándar del motor (y club / red / tono desde panel). */
export function draftToAnthropicVars(draft, extras) {
  extras = extras || {};
  var nombre_club = btrim(extras.nombre_club) || 'DeCarambola';
  var tono = btrim(extras.tono) || 'casual';
  var red_social = btrim(extras.red_social) || 'Instagram';
  if (!draft || !draft.kind) return { nombre_club: nombre_club, tono: tono, red_social: red_social };
  if (draft.kind === SOCIAL_CONTENT_KIND.RESULTADO_PARTIDA) {
    var r = draft.data || {};
    var prom =
      r.promedio_ganador != null && !isNaN(r.promedio_ganador) ? r.promedio_ganador.toFixed(3) : '—';
    return {
      nombre_club: nombre_club,
      tono: tono,
      red_social: red_social,
      ganador: btrim(r.ganador_nombre || r.resultado || '—'),
      perdedor: inferPerdedorDesdeReto(r),
      score: btrim(r.score) || '—',
      promedio: prom,
      modalidad: btrim(r.modalidad) || 'carambola',
    };
  }
  if (draft.kind === SOCIAL_CONTENT_KIND.RETO_EN_VIVO) {
    var o = draft.data || {};
    return {
      nombre_club: nombre_club,
      tono: tono,
      jugador1: btrim(o.j1_nombre) || 'Jugador 1',
      jugador2: btrim(o.j2_nombre) || 'Jugador 2',
    };
  }
  if (draft.kind === SOCIAL_CONTENT_KIND.RANKING_SEMANAL) {
    var top = draft.data && draft.data[0];
    return {
      nombre_club: nombre_club,
      tono: tono,
      jugador1: top ? btrim(top.nombre) : '—',
      promedio: top && top.promedio != null ? Number(top.promedio).toFixed(3) : '—',
    };
  }
  if (draft.kind === SOCIAL_CONTENT_KIND.RETO_CASERITO) {
    var rc = draft.data || {};
    return {
      nombre_club: nombre_club,
      tono: tono,
      retador: btrim(rc.retador) || '—',
      retado: btrim(rc.retado) || '—',
      apuesta: rc.apuesta_num != null ? String(rc.apuesta_num) : parseApuesta(rc.bolsa) || '—',
    };
  }
  return { nombre_club: nombre_club, tono: tono, red_social: red_social };
}

/** Suscripción Realtime: nuevo reto con apuesta &gt; 0 (INSERT). */
export function subscribeRetoConApuesta(clubId, onDraft, opts) {
  opts = opts || {};
  var cid = btrim(clubId);
  var ch = supabase.channel('dc-social-retos-apuesta-' + (cid || 'all'));
  var insCfg = { event: 'INSERT', schema: 'public', table: 'retos' };
  if (cid) insCfg.filter = 'club_id=eq.' + cid;
  ch.on(
    'postgres_changes',
    insCfg,
    async function (payload) {
      var row = payload.new;
      if (!row) return;
      var n = normalizeRetoRow(row);
      if (parseApuesta(n.bolsa) <= 0) return;
      var draft = await buildPostRetoCaserito(row, null, opts.origin);
      if (draft && typeof onDraft === 'function') onDraft(draft);
    }
  );
  ch.subscribe();
  return function unsubscribe() {
    supabase.removeChannel(ch);
  };
}

/** Suscripción Realtime: reto pasa a estado finalizado (UPDATE). */
export function subscribeRetoFinalizado(clubId, onDraft) {
  var cid = btrim(clubId);
  var ch = supabase.channel('dc-social-retos-' + (cid || 'all'));
  var retCfg = { event: 'UPDATE', schema: 'public', table: 'retos' };
  if (cid) retCfg.filter = 'club_id=eq.' + cid;
  ch.on(
    'postgres_changes',
    retCfg,
    async function (payload) {
      var row = payload.new;
      if (!row || !isRetoFinalizado(row.estado)) return;
      var old = payload.old;
      if (old && isRetoFinalizado(old.estado)) return;
      var draft = await buildPostResultadoPartida(row);
      if (draft && typeof onDraft === 'function') onDraft(draft);
    }
  );
  ch.subscribe();
  return function unsubscribe() {
    supabase.removeChannel(ch);
  };
}

/** Suscripción Realtime: overlay actualizado (partida en curso en TV / duelo_premium_tv). */
export function subscribeOverlayEnVivo(clubId, onDraft, opts) {
  opts = opts || {};
  var cid = btrim(clubId);
  var debounceMs = opts.debounceMs != null ? opts.debounceMs : 15000;
  /** Si true, solo INSERT (inicio de partida al publicar overlay); si false, INSERT + UPDATE con debounce. */
  var soloInsert = opts.enVivoSoloAlInsertar === true;
  var lastKey = '';
  var t = null;
  var ch = supabase.channel('dc-social-overlay-' + (cid || 'all'));
  ch.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'overlay_state' },
    function (payload) {
      scheduleOverlayDraft(payload);
    }
  );
  if (!soloInsert) {
    ch.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'overlay_state' },
      function (payload) {
        scheduleOverlayDraft(payload);
      }
    );
  }
  function scheduleOverlayDraft(payload) {
    var row = payload.new || payload.old;
    if (!row) return;
    if (cid) {
      var rcid = btrim(row.club_id);
      if (rcid && rcid !== cid) return;
    }
    var o = normalizeOverlayRow(row);
    if (!o || o.estado === 'fin' || o.estado === 'final') return;
    var key = o.match_id + '|' + o.updated_at;
    if (key === lastKey) return;
    lastKey = key;
    if (t) clearTimeout(t);
    t = setTimeout(async function () {
      t = null;
      var fresh = await supabase.from('overlay_state').select('*').eq('match_id', o.match_id).maybeSingle();
      if (fresh.error || !fresh.data) return;
      var draft = await buildPostRetoEnVivo(fresh.data);
      if (draft && typeof onDraft === 'function') onDraft(draft);
    }, debounceMs);
  }
  ch.subscribe();
  return function unsubscribe() {
    if (t) clearTimeout(t);
    supabase.removeChannel(ch);
  };
}

/**
 * Programa un disparo cada lunes 09:00 (hora local) para ranking semanal.
 * Devuelve función cancel().
 */
export function scheduleWeeklyRankingMonday(clubId, onDraft) {
  var cancelled = false;
  var tid;
  function msUntilNextMondayNine() {
    var now = new Date();
    var d = new Date(now.getTime());
    var day = d.getDay();
    var daysToMon = (8 - day) % 7;
    d.setDate(d.getDate() + daysToMon);
    d.setHours(9, 0, 0, 0);
    if (d.getTime() <= now.getTime()) {
      d.setDate(d.getDate() + 7);
    }
    return Math.max(1000, d.getTime() - now.getTime());
  }
  function arm() {
    if (cancelled) return;
    clearTimeout(tid);
    tid = setTimeout(async function tick() {
      if (cancelled) return;
      var draft = await buildPostRankingSemanal(clubId);
      if (draft && !draft.error && typeof onDraft === 'function') onDraft(draft);
      arm();
    }, msUntilNextMondayNine());
  }
  arm();
  return function cancel() {
    cancelled = true;
    clearTimeout(tid);
  };
}

/** Últimos retos del club (para backoffice o cola manual). */
export async function fetchRetosRecientes(clubId, limit) {
  var cid = btrim(clubId);
  if (!cid) return { data: [], error: null };
  var lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  var r = await supabase
    .from('retos')
    .select('*')
    .eq('club_id', cid)
    .order('updated_at', { ascending: false })
    .limit(lim);
  if (r.error) return { data: [], error: r.error };
  return { data: (r.data || []).map(normalizeRetoRow), error: null };
}
