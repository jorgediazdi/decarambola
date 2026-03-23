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
// Temporal por solicitud de negocio: portal abierto sin login.
const OPEN_ACCESS_PUBLIC = true;

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

function insertarBannerAccesoAbierto() {
    var main = document.getElementById('club-portal-main');
    if (!main || document.getElementById('club-open-banner')) return;
    var bar = document.createElement('div');
    bar.id = 'club-open-banner';
    bar.setAttribute('role', 'status');
    bar.style.cssText =
        'margin:0 auto 16px;max-width:540px;padding:12px 16px;border-radius:14px;' +
        'border:1px solid rgba(212,175,55,0.35);background:rgba(212,175,55,0.08);' +
        'font-size:0.72rem;line-height:1.45;color:#bba;text-align:center;';
    bar.innerHTML =
        '<strong style="color:#d4af37;">Acceso temporal abierto</strong> — sin clave ni login (modo operativo). ' +
        'Luego se reactivan roles.';
    main.insertBefore(bar, main.firstChild);
}

/** Barra visible: estás viendo el portal sin staff (solo ?dev=1). */
function insertarBannerModoPrueba() {
    var main = document.getElementById('club-portal-main');
    if (!main || document.getElementById('club-dev-banner')) return;
    var bar = document.createElement('div');
    bar.id = 'club-dev-banner';
    bar.setAttribute('role', 'status');
    bar.style.cssText =
        'margin:0 auto 16px;max-width:540px;padding:12px 16px;border-radius:14px;' +
        'border:1px solid rgba(212,175,55,0.4);background:rgba(40,32,12,0.85);' +
        'font-size:0.72rem;line-height:1.45;color:#cba;text-align:center;';
    bar.innerHTML =
        '<strong style="color:#d4af37;">Modo prueba</strong> — Panel visible sin sesión Supabase. ' +
        'Para uso real: <a href="/auth.html" style="color:#8cf;">iniciar sesión staff</a>. ' +
        '<a href="#" id="club-dev-salir" style="color:#e88;margin-left:6px;">Salir del modo prueba</a>';
    main.insertBefore(bar, main.firstChild);
    var salir = document.getElementById('club-dev-salir');
    if (salir) {
        salir.addEventListener('click', function (e) {
            e.preventDefault();
            try {
                sessionStorage.removeItem(DEV_MODE_KEY);
            } catch (err) {}
            window.location.href = '/club/';
        });
    }
}

export async function initClubPortalGate() {
    var gate = document.getElementById('club-access-gate');
    var main = document.getElementById('club-portal-main');
    var msg = document.getElementById('club-gate-msg');

    function deny(html, sub, opts) {
        opts = opts || {};
        if (msg) {
            var pruebaBlock = '';
            if (opts.showDevShortcut) {
                pruebaBlock =
                    '<div style="margin-top:20px;padding:14px 16px;border-radius:14px;border:1px solid rgba(212,175,55,0.28);background:rgba(212,175,55,0.06);text-align:left;">' +
                    '<div style="font-size:0.62rem;letter-spacing:0.14em;color:#a08;font-weight:700;margin-bottom:8px;">MODO PRUEBA (equipo / desarrollo)</div>' +
                    '<p style="color:#888;font-size:0.78rem;line-height:1.45;margin:0 0 10px;">Para <strong>probar el panel sin login</strong> (solo tests): tocá abajo. Quien llegue sin este enlace debe usar <strong>sesión staff</strong> en producción.</p>' +
                    '<a href="?dev=1" style="display:inline-block;padding:10px 16px;border-radius:12px;background:rgba(212,175,55,0.2);border:1px solid rgba(212,175,55,0.45);color:#d4af37;font-size:0.72rem;font-weight:700;text-decoration:none;letter-spacing:0.06em;">Entrar en modo prueba (sin sesión)</a>' +
                    '</div>';
            }
            msg.innerHTML =
                html +
                (sub || '') +
                pruebaBlock +
                '<p style="margin-top:18px;font-size:0.75rem;line-height:1.5;"><a href="/jugador/" style="color:#6cf;">App jugador</a> · <a href="/index.html" style="color:#d4af37;">Inicio</a> · <a href="/auth.html" style="color:#aaa;">Iniciar sesión (staff)</a></p>';
        }
        if (main) main.style.display = 'none';
        if (gate) gate.style.display = 'flex';
    }

    function allow() {
        if (gate) gate.style.display = 'none';
        if (main) main.style.display = 'block';
    }

    if (OPEN_ACCESS_PUBLIC) {
        allow();
        insertarBannerAccesoAbierto();
        try {
            var perfilOpen = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
            if (perfilOpen && perfilOpen.club_id) {
                pintarHeroPortalClub(String(perfilOpen.club_id).trim());
            }
        } catch (e) {}
        return;
    }

    if (esModoDevActivo()) {
        sessionStorage.setItem(DEV_MODE_KEY, '1');
        allow();
        insertarBannerModoPrueba();
        return;
    }

    try {
        var _s = await supabase.auth.getSession();
        var session = _s && _s.data && _s.data.session;
        if (!session) {
            deny(
                '<h1 style="font-size:1rem;letter-spacing:0.06em;margin-bottom:10px;color:#d4af37;">Acceso al portal del club</h1>' +
                    '<p style="color:#aaa;font-size:0.85rem;line-height:1.5;">Entra con tu cuenta de <strong>personal del club</strong> (Supabase). El PIN de la app principal <strong>no</strong> sustituye el inicio de sesión aquí.</p>',
                '<p style="color:#666;font-size:0.78rem;margin-top:12px;">¿Eres jugador? Usa la <a href="/jugador/" style="color:#6cf;">app jugador</a>.</p>',
                { showDevShortcut: true }
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
                '<h1 style="font-size:1rem;margin-bottom:10px;color:#c98;">Falta tu perfil en la base de datos</h1>' +
                    '<p style="color:#aaa;font-size:0.82rem;line-height:1.5;"><strong>No es un problema de la app</strong>: tu correo ya existe en Supabase Auth, pero falta una fila en la tabla <code>public.profiles</code>.</p>' +
                    '<ol style="color:#888;font-size:0.78rem;line-height:1.55;margin:0.9em 0 0 1.1em;padding:0;text-align:left;">' +
                    '<li style="margin-bottom:6px;">Entrá a <strong>Supabase</strong> → tu proyecto → <strong>SQL</strong>.</li>' +
                    '<li style="margin-bottom:6px;">Ejecutá el archivo del repo <code style="font-size:0.7rem;color:#a6a;">supabase/migrations/008_backfill_profiles_desde_auth.sql</code> (copiar/pegar todo → Run).</li>' +
                    '<li>Cerrá sesión aquí, volvé a entrar en <a href="/auth.html" style="color:#8cf;">auth</a> y probá otra vez <code>/club/</code>.</li>' +
                    '</ol>' +
                    '<p style="color:#666;font-size:0.72rem;margin-top:12px;">Guía con capturas de texto: <a href="/docs/FIX_PROFILES_ROLE_SUPABASE.md" style="color:#d4af37;">docs/FIX_PROFILES_ROLE_SUPABASE.md</a></p>',
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
