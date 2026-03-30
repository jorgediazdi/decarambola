/**
 * API jugadores, partidas (jugador entrenamiento), ranking_historico, utilidades mesa-historial vía list que ya está en club-api.
 */
import { supabase } from '/js/supabase-client.js';
import { getClubId } from '/js/auth-manager.js';

function wrap(data, error) {
  if (error) return { data: null, error };
  return { data, error: null };
}

async function resolveClubId(explicit) {
  if (explicit) return explicit;
  const r = await getClubId();
  if (r.data) return r.data;
  try {
    const p = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
    return p.club_id || null;
  } catch (e) {
    return null;
  }
}

export async function listJugadores(clubId, opts) {
  try {
    const cid = await resolveClubId(clubId);
    var q = supabase.from('jugadores').select('*').order('created_at', { ascending: false });
    if (cid) q = q.eq('club_id', cid);
    if (opts && opts.soloActivos) q = q.eq('activo', true);
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Portal jugador: una fila por cédula (sin filtro de club). */
export async function getJugadorByCedula(cedula) {
  try {
    const c = String(cedula || '').trim();
    if (!c) return { data: null, error: null };
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .eq('cedula', c)
      .limit(1)
      .maybeSingle();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Una fila en `jugadores` por PK (p. ej. mismo UUID que `auth.users.id`). */
export async function getJugadorById(id) {
  try {
    const uid = String(id || '').trim();
    if (!uid) return { data: null, error: null };
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateJugador(id, payload) {
  try {
    const { data, error } = await supabase.from('jugadores').update(payload).eq('id', id).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertJugador(payload) {
  try {
    const { data, error } = await supabase.from('jugadores').insert(payload).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Partida “entrenamiento / historial jugador” (shape compatible HISTORIAL.guardarPartida). */
export async function insertPartidaHistorialJugador(datos) {
  try {
    const row = {
      jugador_id: datos.jugador_id,
      rival_nombre: datos.rival_nombre || null,
      promedio: datos.promedio_partida != null ? datos.promedio_partida : datos.promedio,
      entradas: datos.entradas_jugador != null ? datos.entradas_jugador : datos.entradas,
      carambolas: datos.carambolas_jugador != null ? datos.carambolas_jugador : datos.carambolas,
      gano: datos.gano != null ? datos.gano : false,
      tipo: datos.tipo || 'torneo',
      serie_mayor: datos.serie_mayor || 0,
      created_at: datos.fecha || new Date().toISOString()
    };
    const { data, error } = await supabase.from('partidas').insert(row).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listPartidasPorJugador(jugadorId, limit) {
  try {
    var lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const { data, error } = await supabase
      .from('partidas')
      .select('*')
      .eq('jugador_id', jugadorId)
      .order('created_at', { ascending: false })
      .limit(lim);
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Partida de torneo (marcador + resultado). */
export async function insertPartidaTorneo(payload) {
  try {
    const { data, error } = await supabase.from('partidas').insert(payload).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertRankingHistorico(payload) {
  try {
    const { data, error } = await supabase.from('ranking_historico').insert(payload).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function patchJugadoresInactivosAntes(isoDate) {
  try {
    const { data, error } = await supabase
      .from('jugadores')
      .update({ activo: false })
      .lt('updated_at', isoDate)
      .eq('activo', true)
      .select('id');
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Conteo de partidas (KPI organizador); club opcional. */
export async function countPartidasForClub(clubId) {
  try {
    var q = supabase.from('partidas').select('*', { count: 'exact', head: true });
    if (clubId) q = q.eq('club_id', clubId);
    const { count, error } = await q;
    return wrap(count != null ? count : 0, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Top jugadores por promedio (dashboard). */
export async function listTopJugadoresByPromedio(clubId, limit) {
  try {
    var lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
    var q = supabase
      .from('jugadores')
      .select('nombre,promedio')
      .eq('activo', true)
      .gt('promedio', 0)
      .order('promedio', { ascending: false })
      .limit(lim);
    if (clubId) q = q.eq('club_id', clubId);
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Vista ranking_club: top por posición (ascendente) para un club (campo `club`, ej. wl_club_id). */
export async function listRankingClubTop(club, limit) {
  try {
    const cid = String(club || '').trim();
    if (!cid) return { data: [], error: null };
    const lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
    const { data, error } = await supabase
      .from('ranking_club')
      .select('*')
      .eq('club', cid)
      .order('posicion', { ascending: true })
      .limit(lim);
    return wrap(data || [], error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Retos del club (tabla retos). */
export async function listRetosByClubId(clubId, limit) {
  try {
    const cid = String(clubId || '').trim();
    if (!cid) return { data: [], error: null };
    const lim = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);
    const { data, error } = await supabase.from('retos').select('*').eq('club_id', cid).limit(lim);
    return wrap(data || [], error);
  } catch (e) {
    return { data: null, error: e };
  }
}
