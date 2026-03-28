/**
 * Solicitudes de configuración de club — capas separadas club_admin vs superadmin.
 * Validación de rol en cliente (getRole); RLS restrictiva en paso 3.
 * No modifica sala-supabase-gate ni OPEN_ACCESS_PUBLIC.
 */
import { supabase } from './supabase-client.js';
import { getSession, getRole } from './auth-manager.js';

const TABLE = 'solicitudes_config_club';

// ─── Comprobaciones de rol (auth-manager) ───────────────────────────────────

/** @returns {Promise<{ session: import('@supabase/supabase-js').Session|null, userId: string|null }>} */
async function obtenerSesionYOUsuario() {
    var sessionRes = await getSession();
    var session = sessionRes && sessionRes.data;
    if (!session || !session.user) return { session: null, userId: null };
    return { session, userId: session.user.id };
}

/** Solo club_admin. */
export async function assertRoleClubAdmin() {
    var r = await getRole();
    var role = r && r.data != null ? String(r.data) : 'jugador';
    if (role !== 'club_admin') {
        return { ok: false, error: 'Se requiere rol club_admin.' };
    }
    return { ok: true, role };
}

/** Solo superadmin (mismo criterio que pqrs_admin.html). */
export async function assertRoleSuperadmin() {
    var r = await getRole();
    if (!r || r.data !== 'superadmin') {
        return { ok: false, error: 'Se requiere rol superadmin.' };
    }
    return { ok: true };
}

// ─── Club admin: solo filas propias (user_id = auth.uid) ────────────────────

/**
 * Última solicitud del usuario actual. No expone datos de otros.
 * @returns {Promise<object|null>}
 */
export async function club_fetchUltimaSolicitudMiUsuario() {
    var { userId } = await obtenerSesionYOUsuario();
    if (!userId) return null;
    var { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
    if (error) {
        console.warn('[solicitud-config] club_fetchUltimaSolicitudMiUsuario:', error.message);
        return null;
    }
    return data && data[0] ? data[0] : null;
}

/** ¿Hay alguna solicitud pendiente para este usuario? */
export async function club_tienePendiente() {
    var { userId } = await obtenerSesionYOUsuario();
    if (!userId) return false;
    var { data, error } = await supabase
        .from(TABLE)
        .select('id')
        .eq('user_id', userId)
        .eq('estado', 'pendiente')
        .limit(1);
    if (error) return false;
    return data && data.length > 0;
}

/**
 * Reglas: no enviar si hay pendiente; si última es aprobada, solo con solicitudCambio explícito.
 * @param {boolean} solicitudCambio — Checkbox "solicitar cambio" cuando ya hubo aprobación.
 */
export async function club_evaluarPuedeEnviar(solicitudCambio) {
    var a = await assertRoleClubAdmin();
    if (!a.ok) return { ok: false, mensaje: a.error };

    if (await club_tienePendiente()) {
        return {
            ok: false,
            mensaje: 'Ya tenés una solicitud pendiente. Esperá la resolución antes de enviar otra.',
        };
    }

    var ultima = await club_fetchUltimaSolicitudMiUsuario();
    if (ultima && ultima.estado === 'aprobada' && !solicitudCambio) {
        return {
            ok: false,
            mensaje:
                'Tu configuración ya fue aprobada. Si necesitás modificar datos, marcá «Solicitar cambio de datos aprobados» y enviá de nuevo.',
        };
    }

    return { ok: true };
}

/**
 * Inserta solicitud. Valida rol club_admin y reglas de envío.
 * @param {object} payload — nombre_club, metraje_ancho, metraje_largo, num_mesas, ciudad, direccion
 * @param {{ solicitudCambio?: boolean }} opts
 */
export async function club_enviarSolicitud(payload, opts) {
    opts = opts || {};
    var solicitudCambio = !!opts.solicitudCambio;

    var sessionRes = await getSession();
    var session = sessionRes && sessionRes.data;
    if (!session || !session.user) {
        return { ok: false, error: 'Iniciá sesión para enviar la solicitud.' };
    }

    var admin = await assertRoleClubAdmin();
    if (!admin.ok) {
        return { ok: false, error: admin.error };
    }

    var puede = await club_evaluarPuedeEnviar(solicitudCambio);
    if (!puede.ok) {
        return { ok: false, error: puede.mensaje };
    }

    var uid = session.user.id;
    var pr = await supabase.from('profiles').select('club_id').eq('id', uid).maybeSingle();
    var clubIdPerfil = pr.data && pr.data.club_id ? String(pr.data.club_id).trim() : null;

    if (solicitudCambio && !clubIdPerfil) {
        return { ok: false, error: 'Falta club_id en el perfil para solicitar un cambio. Contactá soporte.' };
    }

    var clubIdFila = solicitudCambio && clubIdPerfil ? clubIdPerfil : null;

    var insert = {
        user_id: uid,
        club_id: clubIdFila,
        nombre_club: String(payload.nombre_club || '').trim(),
        metraje_ancho: payload.metraje_ancho != null && payload.metraje_ancho !== '' ? Number(payload.metraje_ancho) : null,
        metraje_largo: payload.metraje_largo != null && payload.metraje_largo !== '' ? Number(payload.metraje_largo) : null,
        num_mesas: Math.max(1, Math.min(50, parseInt(payload.num_mesas, 10) || 1)),
        ciudad: String(payload.ciudad || '').trim() || null,
        direccion: String(payload.direccion || '').trim() || null,
        estado: 'pendiente',
        updated_at: new Date().toISOString(),
    };

    if (!insert.nombre_club) {
        return { ok: false, error: 'El nombre del club es obligatorio.' };
    }

    var { error } = await supabase.from(TABLE).insert(insert);
    if (error) {
        console.error('[solicitud-config] club_enviarSolicitud', error);
        return { ok: false, error: error.message || 'No se pudo guardar la solicitud.' };
    }
    return { ok: true };
}

/** Estado para banner en portal / solicitud_config (solo datos propios). */
export async function club_getResumenPortal() {
    var { userId } = await obtenerSesionYOUsuario();
    if (!userId) {
        return { autenticado: false, ultima: null, puedeEnviar: false, mensaje: null };
    }
    var admin = await assertRoleClubAdmin();
    if (!admin.ok) {
        return { autenticado: true, ultima: null, puedeEnviar: false, mensaje: admin.error };
    }

    var ultima = await club_fetchUltimaSolicitudMiUsuario();
    var pend = await club_tienePendiente();
    var mostrarCheckboxCambio = !!(ultima && ultima.estado === 'aprobada' && !pend);
    var ev = await club_evaluarPuedeEnviar(false);
    var evCambio = await club_evaluarPuedeEnviar(true);

    return {
        autenticado: true,
        ultima: ultima,
        tienePendiente: pend,
        puedeEnviarNueva: ev.ok,
        puedeEnviarConCambio: evCambio.ok,
        mostrarCheckboxCambio: mostrarCheckboxCambio,
        mensajeBloqueo: ev.ok ? null : ev.mensaje,
    };
}

// ─── Superadmin: listado global; aprobar / rechazar con RPC (valida rol en BD) ─

/**
 * Lista todas las solicitudes. Solo llamar tras comprobar getRole() === 'superadmin' en la página.
 */
export async function superadmin_listarSolicitudes(estadoFiltro) {
    var gate = await assertRoleSuperadmin();
    if (!gate.ok) return { data: [], error: gate.error };

    var q = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (estadoFiltro) q = q.eq('estado', estadoFiltro);
    var { data, error } = await q;
    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
}

export async function superadmin_aprobarSolicitud(solicitudId, comentario) {
    var gate = await assertRoleSuperadmin();
    if (!gate.ok) return { ok: false, error: gate.error };

    var { data, error } = await supabase.rpc('aprobar_solicitud_config_club', {
        p_solicitud_id: solicitudId,
        p_comentario: comentario || null,
    });
    if (error) {
        console.error(error);
        return { ok: false, error: error.message || 'Error al aprobar.' };
    }
    if (!data || data.ok !== true) {
        return { ok: false, error: (data && data.error) || 'No se pudo aprobar.' };
    }
    return { ok: true, club_codigo: data.club_codigo };
}

export async function superadmin_rechazarSolicitud(solicitudId, comentario) {
    var gate = await assertRoleSuperadmin();
    if (!gate.ok) return { ok: false, error: gate.error };

    var { data, error } = await supabase.rpc('rechazar_solicitud_config_club', {
        p_solicitud_id: solicitudId,
        p_comentario: comentario || null,
    });
    if (error) {
        console.error(error);
        return { ok: false, error: error.message || 'Error al rechazar.' };
    }
    if (!data || data.ok !== true) {
        return { ok: false, error: (data && data.error) || 'No se pudo rechazar.' };
    }
    return { ok: true };
}
