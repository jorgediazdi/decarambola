/**
 * API club / sala — Supabase. Usa cliente central + club_id (Auth o fallback localStorage).
 */
import { supabase } from '/js/supabase-client.js';
import { getClubId } from '/js/auth-manager.js';

function wrap(data, error) {
  if (error) return { data: null, error };
  return { data, error: null };
}

/**
 * true si la clave tiene forma UUID (clubs.id). Si es false, tratarla como clubs.codigo
 * en filtros REST — nunca usar .eq('id', código) (PostgREST 400 en columna uuid).
 */
export function isClubKeyLikelyUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || '').trim()
  );
}

/** club_id para filtros: perfil Auth, si no mi_perfil / club_activo (legacy). */
export async function resolveClubIdForQuery(explicitClubId) {
  try {
    if (explicitClubId) return { data: String(explicitClubId), error: null };
    const r = await getClubId();
    if (r.data) return { data: r.data, error: null };
    try {
      const p = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
      if (p.club_id) return { data: String(p.club_id), error: null };
      const c = JSON.parse(localStorage.getItem('club_activo') || 'null');
      if (c && c.codigo) return { data: String(c.codigo), error: null };
    } catch (e) {}
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function patchClub(clubUuid, payload) {
  try {
    const { data, error } = await supabase.from('clubs').update(payload).eq('id', clubUuid).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertClub(payload) {
  try {
    const { data, error } = await supabase.from('clubs').insert(payload).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Una fila de club por id (uuid) o por codigo (texto). Nunca pide id= con código MVIP-001. */
export async function getClubByIdOrCodigo(clubKey) {
  try {
    var key = String(clubKey || '').trim();
    if (!key) return { data: null, error: null };
    const sel = 'id,nombre,codigo,ciudad,color_primario,logo_url,video_ia_activo';
    if (isClubKeyLikelyUuid(key)) {
      const byId = await supabase.from('clubs').select(sel).eq('id', key).maybeSingle();
      if (byId.error) return wrap(null, byId.error);
      if (byId.data) return wrap(byId.data, null);
      const byCodigoAfterUuid = await supabase.from('clubs').select(sel).eq('codigo', key).maybeSingle();
      return wrap(byCodigoAfterUuid.data, byCodigoAfterUuid.error);
    }
    const byCodigo = await supabase.from('clubs').select(sel).eq('codigo', key).maybeSingle();
    return wrap(byCodigo.data, byCodigo.error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Una mesa por club_id + número (texto o uuid según BD). */
export async function getMesaByClubNumero(clubId, numeroMesa) {
  try {
    if (!clubId || numeroMesa === undefined || numeroMesa === null) {
      return { data: null, error: new Error('clubId y numero requeridos') };
    }
    var num = typeof numeroMesa === 'string' ? parseInt(numeroMesa, 10) : numeroMesa;
    if (isNaN(num)) return { data: null, error: new Error('numero inválido') };
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('club_id', String(clubId))
      .eq('numero', num)
      .limit(1)
      .maybeSingle();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function getStreamUrlMesa(clubId, numeroMesa) {
  const { data: m, error } = await getMesaByClubNumero(clubId, numeroMesa);
  if (error) return { data: null, error };
  if (!m) return { data: null, error: null };
  if (m.urls_camaras && Array.isArray(m.urls_camaras) && m.urls_camaras.length > 0) {
    var first = m.urls_camaras[0];
    var url =
      first && typeof first === 'object' && first.url
        ? first.url
        : typeof first === 'string'
          ? first
          : null;
    return { data: url, error: null };
  }
  var u = (m.url_camara || '').trim();
  return { data: u || null, error: null };
}

export async function getStreamUrlsMesa(clubId, numeroMesa) {
  const { data: m, error } = await getMesaByClubNumero(clubId, numeroMesa);
  if (error) return { data: null, error };
  if (!m) return { data: [], error: null };
  if (m.urls_camaras && Array.isArray(m.urls_camaras) && m.urls_camaras.length > 0) {
    return {
      data: m.urls_camaras
        .map(function (c) {
          if (typeof c === 'string') return { nombre: 'Cámara', url: c };
          return { nombre: (c && c.nombre) || 'Cámara', url: (c && c.url) || '' };
        })
        .filter(function (c) {
          return c.url;
        }),
      error: null
    };
  }
  if (m.url_camara && m.url_camara.trim()) {
    return { data: [{ nombre: 'Cámara 1', url: m.url_camara.trim() }], error: null };
  }
  return { data: [], error: null };
}

export async function listMesas(clubId, opts) {
  try {
    if (!clubId) return { data: [], error: new Error('clubId requerido') };
    var q = supabase.from('mesas').select('*').eq('club_id', String(clubId));
    if (opts && opts.orderBy === 'numero') {
      q = q.order('numero', { ascending: true });
    }
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasConfig(clubId) {
  try {
    if (!clubId) return { data: [], error: new Error('clubId requerido') };
    const { data, error } = await supabase
      .from('mesas_config')
      .select('*')
      .eq('club_id', String(clubId))
      .order('created_at', { ascending: false });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateMesasConfig(id, payload) {
  try {
    const { data, error } = await supabase.from('mesas_config').update(payload).eq('id', id).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertMesasConfig(payload) {
  try {
    const { data, error } = await supabase.from('mesas_config').insert(payload).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasReservas(clubId) {
  try {
    if (!clubId) return { data: [], error: new Error('clubId requerido') };
    const { data, error } = await supabase
      .from('mesas_reservas')
      .select('*')
      .eq('club_id', String(clubId))
      .order('created_at', { ascending: false });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasHistorial(clubId, limit) {
  try {
    if (!clubId) return { data: [], error: new Error('clubId requerido') };
    var lim = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const { data, error } = await supabase
      .from('mesas_historial')
      .select('*')
      .eq('club_id', String(clubId))
      .order('created_at', { ascending: false })
      .limit(lim);
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Snapshot de tarifas (jsonb en mesas_config). */
export async function getTarifasForClub(clubId) {
  const { data: rows, error } = await listMesasConfig(clubId);
  if (error) return { data: null, error };
  if (!rows || !rows.length) return { data: null, error: null };
  var tar = rows[0].tarifas;
  return { data: tar != null ? tar : null, error: null, meta: { mesas_config_id: rows[0].id } };
}

/** Primera fila mesas_config por club_id (texto: código o uuid según cómo esté guardado en BD). */
export async function getFirstMesasConfigByClubId(clubId) {
  try {
    var key = String(clubId || '').trim();
    if (!key) return { data: null, error: new Error('clubId requerido') };
    const { data, error } = await supabase
      .from('mesas_config')
      .select('*')
      .eq('club_id', key)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) return wrap(null, error);
    return wrap(data && data.length ? data[0] : null, null);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function getMesasConfigByClubAndNombreSalon(clubId, nombreSalon) {
  try {
    const { data, error } = await supabase
      .from('mesas_config')
      .select('*')
      .eq('club_id', String(clubId))
      .eq('nombre_salon', nombreSalon)
      .limit(1)
      .maybeSingle();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasBySalonId(salonId) {
  try {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('salon_id', salonId)
      .order('numero', { ascending: true });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasLimited(limit) {
  try {
    var lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);
    const { data, error } = await supabase.from('mesas').select('*').limit(lim);
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Siguiendo mesas_historial.estado=abierta con filtro club opcional. */
export async function listMesasHistorialAbierta(clubId) {
  try {
    var q = supabase.from('mesas_historial').select('*').eq('estado', 'abierta');
    if (clubId) q = q.eq('club_id', String(clubId));
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasHistorialCerradas(clubId) {
  try {
    var q = supabase.from('mesas_historial').select('*').eq('estado', 'cerrada');
    if (clubId) q = q.eq('club_id', String(clubId));
    q = q.order('created_at', { ascending: false });
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

/** Reportes / historial: mesas por club o primeras 200 si no hay club. */
export async function listMesasForReporte(clubId) {
  try {
    if (clubId) return listMesas(clubId, { orderBy: 'numero' });
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .order('numero', { ascending: true })
      .limit(200);
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateMesa(id, patch) {
  try {
    const { data, error } = await supabase.from('mesas').update(patch).eq('id', id).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertMesaRow(row) {
  try {
    const { data, error } = await supabase.from('mesas').insert(row).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertMesasHistorialRow(row) {
  try {
    const { data, error } = await supabase.from('mesas_historial').insert(row).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateMesasHistorialRow(id, patch) {
  try {
    const { data, error } = await supabase.from('mesas_historial').update(patch).eq('id', id).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateMesasHistorial(id, patch) {
  return updateMesasHistorialRow(id, patch);
}

export async function listInstalacionesComponentesByMesa(mesaId) {
  try {
    const { data, error } = await supabase.from('instalaciones_componentes').select('*').eq('mesa_id', mesaId);
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateInstalacionComponenteRow(id, patch) {
  try {
    const { data, error } = await supabase.from('instalaciones_componentes').update(patch).eq('id', id).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertInstalacionComponenteRow(row) {
  try {
    const { data, error } = await supabase.from('instalaciones_componentes').insert(row).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertMesasReservaRow(row) {
  try {
    const { data, error } = await supabase.from('mesas_reservas').insert(row).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updateMesasReservaRow(id, patch) {
  try {
    const { data, error } = await supabase.from('mesas_reservas').update(patch).eq('id', id).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function getMesaById(mesaId) {
  try {
    const { data, error } = await supabase.from('mesas').select('*').eq('id', mesaId).limit(1).maybeSingle();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasHistorialByMesaId(mesaId) {
  try {
    const { data, error } = await supabase
      .from('mesas_historial')
      .select('*')
      .eq('mesa_id', mesaId)
      .order('created_at', { ascending: false });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listMesasReservasByMesaId(mesaId) {
  try {
    const { data, error } = await supabase
      .from('mesas_reservas')
      .select('*')
      .eq('mesa_id', mesaId)
      .order('created_at', { ascending: false });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listInstalacionesMantenimientoByMesa(mesaId) {
  try {
    const { data, error } = await supabase
      .from('instalaciones_mantenimiento')
      .select('*')
      .eq('mesa_id', mesaId)
      .order('created_at', { ascending: false });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertInstalacionesMantenimientoRow(row) {
  try {
    const { data, error } = await supabase.from('instalaciones_mantenimiento').insert(row).select();
    return wrap(data && data[0] ? data[0] : data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function listClubsActivos() {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('id,nombre,ciudad,video_ia_activo,video_ia_costo')
      .eq('activo', true)
      .order('nombre', { ascending: true });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}
