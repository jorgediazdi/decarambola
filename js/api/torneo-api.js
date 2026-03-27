/**
 * API torneos e inscripciones.
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

export async function listTorneos(clubId) {
  try {
    const cid = await resolveClubId(clubId);
    var q = supabase.from('torneos').select('*').order('created_at', { ascending: false });
    if (cid) q = q.eq('club_id', cid);
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertTorneo(payload) {
  try {
    const { data, error } = await supabase.from('torneos').insert(payload).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateTorneo(id, payload) {
  try {
    const { data, error } = await supabase.from('torneos').update(payload).eq('id', id).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function deleteTorneosBorradorAntes(isoDate) {
  try {
    const { data, error } = await supabase
      .from('torneos')
      .delete()
      .eq('estado', 'BORRADOR')
      .lt('updated_at', isoDate)
      .select('id');
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertInscripcion(payload) {
  try {
    const { data, error } = await supabase.from('inscripciones').insert(payload).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function fetchInscripcionesActivasTorneo(torneoId) {
  try {
    const { data, error } = await supabase
      .from('inscripciones')
      .select('numero_orden, jugador_id, jugadores(nombre,promedio,categoria)')
      .eq('torneo_id', torneoId)
      .eq('estado', 'ACTIVO')
      .order('numero_orden', { ascending: true });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/**
 * Brackets / llaves: hoy viven en localStorage (TORNEOS_LISTA).
 * TODO: migrar a Supabase en Fase 2 (tabla torneo_rondas o jsonb en torneos).
 */
export async function getBracketsTorneo(_torneoId) {
  return {
    data: null,
    error: null,
    meta: { todo: 'migrar brackets a Supabase en Fase 2; usar localStorage hasta entonces.' }
  };
}

export async function listTorneosFinalizados(clubId, limit) {
  try {
    var lim = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
    var q = supabase
      .from('torneos')
      .select('*')
      .eq('estado', 'FINALIZADO')
      .order('created_at', { ascending: false })
      .limit(lim);
    if (clubId) q = q.eq('club_id', clubId);
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Muro público de torneos (columnas usadas en torneos.html). */
export async function listTorneosMuroPublico() {
  try {
    const { data, error } = await supabase
      .from('torneos')
      .select(
        'id,nombre,codigo,club_id,modalidad,sistema,estado,fecha_inicio,inscripcion,cupo_max,visible_muro,ciudad,lugar_encuentro'
      )
      .order('fecha_inicio', { ascending: false });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}
