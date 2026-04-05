/**
 * Pantallas de sala / mesas sensibles — exige Supabase Auth + profiles.role.
 * club_admin necesita club_id; superadmin no.
 *
 * Uso (al final del body, después de definir window.__salaBoot):
 *   <script type="module">
 *   import { guardSalaPage } from '/js/sala-supabase-gate.js';
 *   await guardSalaPage({ pageTitle: 'Salón en vivo' });
 *   </script>
 */
import { supabase } from './supabase-client.js';

const DEV_MODE_KEY = 'dev_mode_activo';
/**
 * Por ahora: acceso libre a pantallas de sala (sin email / sesión obligatoria).
 * Roadmap: pasar a `false` y exigir Supabase Auth + email verificado + rol en `profiles`
 * (club_admin / superadmin). Ver docs/ACCESO_SALA_ROADMAP.md
 */
const OPEN_ACCESS_PUBLIC = false;

function esModoDevActivo() {
    try {
        var p = new URLSearchParams(window.location.search);
        if (p.get('dev') === '1') return true;
    } catch (e) {}
    return sessionStorage.getItem(DEV_MODE_KEY) === '1';
}

function ensureOverlay() {
    var id = 'dc-sala-gate-overlay';
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText =
        'position:fixed;inset:0;z-index:2147483647;background:#0b0b0b;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;';
    el.innerHTML =
        '<div style="max-width:400px;color:#aaa;font-size:0.88rem;line-height:1.5"><p id="dc-sala-gate-msg">Verificando acceso del personal…</p></div>';
    document.body.appendChild(el);
    return el;
}

function setGateMessage(html) {
    var el = document.getElementById('dc-sala-gate-msg');
    if (el) el.innerHTML = html;
}

function removeOverlay() {
    var el = document.getElementById('dc-sala-gate-overlay');
    if (el) el.remove();
}

function bodyReveal() {
    try {
        document.body.style.visibility = 'visible';
    } catch (e) {}
}

/**
 * @param {{ role: string }} r
 * @param {string[]|undefined} allowedRoles
 * @returns {boolean}
 */
function roleAllowed(r, allowedRoles) {
    if (!allowedRoles || !allowedRoles.length) return true;
    var skip = r.role === 'open_public' || r.role === 'dev';
    if (skip) return true;
    var rn = String(r.role || '').trim().toLowerCase();
    for (var i = 0; i < allowedRoles.length; i++) {
        if (String(allowedRoles[i]).trim().toLowerCase() === rn) return true;
    }
    return false;
}

async function checkStaffAccess() {
    if (OPEN_ACCESS_PUBLIC) {
        var openCid = null;
        try {
            var openPerfil = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
            openCid = openPerfil.club_id || null;
        } catch (e) {}
        return { ok: true, role: 'open_public', clubId: openCid };
    }

    if (esModoDevActivo()) {
        sessionStorage.setItem(DEV_MODE_KEY, '1');
        var devCid = null;
        try {
            var mp = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
            devCid = mp.club_id || null;
        } catch (e) {}
        return { ok: true, role: 'dev', clubId: devCid };
    }

    /* Refrescar primero: getSession() puede devolver JWT cacheado y stale tras expiración. */
    await supabase.auth.refreshSession();
    var _s = await supabase.auth.getSession();
    var session = _s && _s.data && _s.data.session;
    if (!session) {
        return { ok: false, reason: 'no_session' };
    }

    var q = await supabase.from('profiles').select('role, club_id').eq('id', session.user.id).maybeSingle();

    if (q.error) {
        return { ok: false, reason: 'profile_error', message: q.error.message };
    }

    if (!q.data) {
        return { ok: false, reason: 'no_profile' };
    }

    var role = q.data.role != null ? String(q.data.role).trim() : '';
    if (!role) {
        return { ok: false, reason: 'role', role: '(vacío)' };
    }

    var clubIdOut = null;
    if (q.data && q.data.club_id != null && String(q.data.club_id).trim()) {
        clubIdOut = String(q.data.club_id).trim();
    }

    if (role === 'club_admin') {
        if (!clubIdOut) {
            return { ok: false, reason: 'no_club_id' };
        }
    }

    return { ok: true, role: role, clubId: clubIdOut };
}

/** Para que lecturas/escrituras con cliente Supabase (RLS) encuentren club_id aunque el staff no pasó por la app jugador. */
function syncClubIdToLocalStorage(clubId) {
    if (!clubId || !String(clubId).trim()) return;
    try {
        var perfil = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
        if (perfil.club_id === clubId) return;
        perfil.club_id = clubId;
        localStorage.setItem('mi_perfil', JSON.stringify(perfil));
    } catch (e) {}
}

/**
 * @param {{ pageTitle?: string }} opts
 * @returns {Promise<boolean>}
 */
export async function guardSalaPage(opts) {
    opts = opts || {};
    var title = opts.pageTitle || 'Área del club';

    /**
     * Acceso abierto: no cubrir la UI con overlay (bloqueaba taps hasta resolver el módulo;
     * en móvil parecía que «SIGUIENTE» no hacía nada).
     */
    if (OPEN_ACCESS_PUBLIC) {
        try {
            var rOpen = await checkStaffAccess();
            removeOverlay();
            syncClubIdToLocalStorage(rOpen.clubId);
            bodyReveal();
            if (typeof window.__salaBoot === 'function') {
                try {
                    window.__salaBoot();
                } catch (e) {
                    console.error(e);
                }
            }
            return true;
        } catch (e) {
            ensureOverlay();
            setGateMessage('<strong style="color:#e88">Error de red</strong><p style="margin-top:12px">No se pudo contactar Supabase.</p>');
            return false;
        }
    }

    ensureOverlay();

    try {
        var r = await checkStaffAccess();
        if (!r.ok) {
            if (r.reason === 'no_session') {
                setGateMessage(
                    '<strong style="color:#d4af37">' +
                        title +
                        '</strong><p style="margin-top:12px">Inicia sesión con tu cuenta de <strong>personal del club</strong> (Supabase).</p>' +
                        '<p style="margin-top:16px;font-size:0.8rem"><a href="/login.html" style="color:#6cf">Iniciar sesión</a> · <a href="/jugador/" style="color:#8c8">App jugador</a> · <a href="/index.html" style="color:#d4af37">Inicio</a></p>'
                );
            } else if (r.reason === 'no_profile') {
                setGateMessage(
                    '<strong style="color:#c98">Sin fila en <code>profiles</code></strong><p style="margin-top:12px">Tu usuario de Auth existe pero <strong>no tiene perfil</strong> en la tabla <code>profiles</code> (o RLS no deja leerla). En Supabase: creá/actualizá la fila con el mismo <code>id</code> que en Authentication → Users. Ver <strong>docs/FIX_PROFILES_ROLE_SUPABASE.md</strong>.</p>' +
                        '<p style="margin-top:16px;font-size:0.8rem"><a href="/login.html" style="color:#6cf">Volver a auth</a></p>'
                );
            } else if (r.reason === 'role') {
                setGateMessage(
                    '<strong style="color:#c98">Sin permiso</strong><p style="margin-top:12px">Tu rol (<code>' +
                        (r.role || '—') +
                        '</code>) no puede operar mesas. Si está vacío: en Supabase ejecutá <code>UPDATE profiles SET role = \'club_admin\', club_id = \'MVIP-001\'</code> (ajustá código) para tu usuario.</p>' +
                        '<p style="margin-top:16px;font-size:0.8rem"><a href="/jugador/">App jugador</a> · <a href="/login.html">Otra cuenta</a></p>'
                );
            } else if (r.reason === 'no_club_id') {
                setGateMessage(
                    '<strong style="color:#c98">Cuenta sin club</strong><p style="margin-top:12px">Tu usuario <strong>club_admin</strong> no tiene <code>club_id</code> en <code>profiles</code>. Revisa <strong>docs/PASO1_RLS_MESAS.md</strong>.</p>'
                );
            } else {
                setGateMessage(
                    '<strong style="color:#e88">Error</strong><p style="margin-top:12px">' + (r.message || 'No se pudo verificar el acceso.') + '</p>'
                );
            }
            return false;
        }

        if (!roleAllowed(r, opts.allowedRoles)) {
            setGateMessage(
                '<strong style="color:#c98">Solo administración del club</strong><p style="margin-top:12px">Esta pantalla es para <strong>club_admin</strong> o <strong>superadmin</strong>.</p>' +
                    '<p style="margin-top:16px;font-size:0.8rem"><a href="/jugador/" style="color:#6cf">App jugador</a> · <a href="/login.html" style="color:#8c8">Otra cuenta</a> · <a href="/index.html" style="color:#c9a84c">Inicio</a></p>'
            );
            return false;
        }

        removeOverlay();
        syncClubIdToLocalStorage(r.clubId);
        bodyReveal();
        if (typeof window.__salaBoot === 'function') {
            try {
                window.__salaBoot();
            } catch (e) {
                console.error(e);
            }
        }
        return true;
    } catch (e) {
        setGateMessage('<strong style="color:#e88">Error de red</strong><p style="margin-top:12px">No se pudo contactar Supabase.</p>');
        return false;
    }
}
