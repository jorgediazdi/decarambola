/**
 * Portal club (/club/) — solo Supabase Auth + staff.
 * - Sesión Supabase + profiles.role ∈ { club_admin, superadmin }
 * - club_admin debe tener club_id (mismo criterio que RLS mesas)
 * - O ?dev=1 (pruebas; fija sessionStorage dev_mode_activo)
 *
 * El PIN del index ya no abre este portal (solo ayuda a ver menús en la app principal).
 */
import { supabase } from './supabase-client.js';

const DEV_MODE_KEY = 'dev_mode_activo';

/**
 * Sustituye "Portal club" por el nombre real y el logo desde tabla clubs (ej. MVIP-001).
 */
function limpiarUrlLogo(url) {
    var u = String(url || '').trim().replace(/^["']|["']$/g, '');
    return u;
}

function placeholderLogoHero(logoEl) {
    if (!logoEl) return;
    logoEl.innerHTML = '<span style="font-size:2.2rem;opacity:0.45;line-height:1" aria-hidden="true">🏛️</span>';
}

/**
 * Muestra el logo: primero la URL tal como viene de Supabase (Storage ya la devuelve bien).
 * Si falla la carga, reintenta con encodeURI (solo espacios sin codificar en el path).
 */
function montarLogoHero(logoEl, logoUrlRaw) {
    if (!logoEl || !logoUrlRaw) {
        placeholderLogoHero(logoEl);
        return;
    }
    var primaria = limpiarUrlLogo(logoUrlRaw);
    if (!primaria || primaria.indexOf('http') !== 0) {
        placeholderLogoHero(logoEl);
        return;
    }

    logoEl.innerHTML = '';
    var img = document.createElement('img');
    img.setAttribute('alt', '');
    img.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block';
    img.decoding = 'async';

    var intento = 0;
    var urls = [primaria];
    try {
        if (primaria.indexOf(' ') >= 0) urls.push(encodeURI(primaria));
    } catch (e) {}

    function fallo() {
        intento++;
        if (intento < urls.length) {
            img.src = urls[intento];
            return;
        }
        placeholderLogoHero(logoEl);
    }

    img.onload = function () {
        try {
            localStorage.setItem('wl_club_logo_url', primaria);
        } catch (e) {}
    };
    img.onerror = fallo;
    img.src = urls[0];
    logoEl.appendChild(img);
}

async function pintarHeroPortalClub(clubKey) {
    if (!clubKey || !String(clubKey).trim()) return;
    var key = String(clubKey).trim();
    var q = await supabase.from('clubs').select('nombre, logo_url, color_primario').eq('codigo', key).maybeSingle();
    if (q.error || !q.data) {
        var isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key);
        if (isUuid) {
            q = await supabase.from('clubs').select('nombre, logo_url, color_primario').eq('id', key).maybeSingle();
        }
    }
    if (q.error || !q.data) {
        var subEl = document.querySelector('.hero > p');
        if (subEl) {
            subEl.innerHTML =
                'Un solo lugar para administrar tu sede, torneos y señal en pantalla. · Código: <strong>' +
                key +
                '</strong><br><span style="color:#a65;font-size:0.72rem;display:block;margin-top:10px;line-height:1.4">Si no ves el <strong>nombre</strong> ni el <strong>logo</strong> del club, en Supabase falta permiso de lectura en la tabla <code>clubs</code> para usuarios logueados. Ejecutá el SQL de <strong>docs/SQL_CLUBS_LEER_PORTAL.md</strong> (política <code>clubs_select_authenticated</code>).</span>';
        }
        if (q.error && typeof console !== 'undefined' && console.warn) {
            console.warn('[DeCarambola portal] clubs:', q.error.message);
        }
        return;
    }
    var row = q.data;
    var h1 = document.querySelector('.hero h1');
    if (h1 && row.nombre) {
        h1.textContent = row.nombre;
    }
    var sub = document.querySelector('.hero > p');
    if (sub) {
        sub.textContent =
            'Un solo lugar para administrar tu sede, torneos y señal en pantalla. · Código club: ' + key;
    }
    var logoEl = document.getElementById('club-logo-mini');
    if (!logoEl) return;

    var logoUrl = row.logo_url != null && String(row.logo_url).trim() ? String(row.logo_url).trim() : '';
    if (!logoUrl) {
        try {
            var wl = localStorage.getItem('wl_club_logo_url');
            if (wl && String(wl).trim().indexOf('http') === 0) logoUrl = String(wl).trim();
        } catch (e) {}
    }

    if (logoUrl) {
        montarLogoHero(logoEl, logoUrl);
    } else {
        placeholderLogoHero(logoEl);
    }
}

function esModoDevActivo() {
    try {
        var p = new URLSearchParams(window.location.search);
        if (p.get('dev') === '1') return true;
    } catch (e) {}
    return sessionStorage.getItem(DEV_MODE_KEY) === '1';
}

export async function initClubPortalGate() {
    var gate = document.getElementById('club-access-gate');
    var main = document.getElementById('club-portal-main');
    var msg = document.getElementById('club-gate-msg');

    function deny(html, sub) {
        if (msg) {
            msg.innerHTML =
                html +
                (sub || '') +
                '<p style="margin-top:18px;font-size:0.75rem;line-height:1.5;"><a href="/jugador/" style="color:#6cf;">App jugador</a> · <a href="/index.html" style="color:#d4af37;">Inicio</a> · <a href="/auth.html" style="color:#aaa;">Iniciar sesión (staff)</a></p>';
        }
        if (main) main.style.display = 'none';
        if (gate) gate.style.display = 'flex';
    }

    function allow() {
        if (gate) gate.style.display = 'none';
        if (main) main.style.display = 'block';
    }

    if (esModoDevActivo()) {
        sessionStorage.setItem(DEV_MODE_KEY, '1');
        allow();
        return;
    }

    try {
        var _s = await supabase.auth.getSession();
        var session = _s && _s.data && _s.data.session;
        if (!session) {
            deny(
                '<h1 style="font-size:1rem;letter-spacing:0.06em;margin-bottom:10px;color:#d4af37;">Acceso al portal del club</h1>' +
                    '<p style="color:#aaa;font-size:0.85rem;line-height:1.5;">Entra con tu cuenta de <strong>personal del club</strong> (Supabase). El PIN de la app principal <strong>no</strong> sustituye el inicio de sesión aquí.</p>',
                '<p style="color:#666;font-size:0.78rem;margin-top:12px;">¿Eres jugador? Usa la <a href="/jugador/" style="color:#6cf;">app jugador</a>.</p>'
            );
            return;
        }

        var q = await supabase
            .from('profiles')
            .select('role, club_id')
            .eq('id', session.user.id)
            .maybeSingle();

        if (q.error) {
            deny('<p style="color:#e88;">No se pudo verificar el perfil.</p>', '<p style="color:#666;font-size:0.8rem;">' + q.error.message + '</p>');
            return;
        }

        if (!q.data) {
            deny(
                '<h1 style="font-size:1rem;margin-bottom:10px;color:#c98;">Falta fila en profiles</h1>' +
                    '<p style="color:#aaa;font-size:0.85rem;line-height:1.5;">Tu usuario existe en <strong>Authentication</strong> pero no hay fila en <code>profiles</code> (o RLS no deja leerla). Guía: <strong>docs/FIX_PROFILES_ROLE_SUPABASE.md</strong></p>',
                ''
            );
            return;
        }

        var role = q.data.role != null ? String(q.data.role).trim() : '';
        if (role !== 'club_admin' && role !== 'superadmin') {
            var sub =
                !role
                    ? '<p style="color:#888;font-size:0.8rem;margin-top:10px;">El campo <code>role</code> está <strong>vacío</strong>. En SQL: <code>UPDATE profiles SET role = \'club_admin\', club_id = \'MVIP-001\' …</code></p>'
                    : '';
            deny(
                '<h1 style="font-size:1rem;margin-bottom:10px;color:#c98;">Sin permiso de staff</h1>' +
                    '<p style="color:#aaa;font-size:0.85rem;line-height:1.5;">Tu rol actual: <code>' +
                    (role || '(vacío)') +
                    '</code>. Aquí hace falta <strong>club_admin</strong> o <strong>superadmin</strong>.</p>' +
                    sub,
                ''
            );
            return;
        }

        var cidSync = q.data && q.data.club_id != null ? String(q.data.club_id).trim() : '';
        if (role === 'club_admin') {
            if (!cidSync) {
                deny(
                    '<h1 style="font-size:1rem;margin-bottom:10px;color:#c98;">Cuenta sin club</h1>' +
                        '<p style="color:#aaa;font-size:0.85rem;">Tu usuario <strong>club_admin</strong> necesita <code>club_id</code> en <code>profiles</code> (mismo valor que en mesas). Ver <strong>docs/PASO1_RLS_MESAS.md</strong>.</p>',
                    ''
                );
                return;
            }
        }
        if (cidSync) {
            try {
                var perfil = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
                perfil.club_id = cidSync;
                localStorage.setItem('mi_perfil', JSON.stringify(perfil));
            } catch (e) {}
        }

        allow();

        if (cidSync) {
            try {
                await pintarHeroPortalClub(cidSync);
            } catch (e) {}
        }
    } catch (e) {
        deny('<p style="color:#e88;">Error de conexión al verificar acceso.</p>', '');
    }
}
