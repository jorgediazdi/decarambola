/**
 * ══════════════════════════════════════════════════════
 *  DECARAMBOLA — WHITE LABEL ENGINE  v2.1
 *  Archivo: whitelabel.js
 *
 *  FIXES v2.1:
 *  ✅ Invalida caché cuando cambia ?club= en la URL
 *  ✅ Elimina mix-blend-mode que hace invisible logos oscuros
 *  ✅ Reintenta inyectar si el DOM no tiene .logo-img aún
 *  ✅ Logs de debug en consola (WL.debug())
 *  ✅ Cache-busting en URL del logo
 * ══════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    var SUPABASE_URL = 'https://iwvogyloebvieloequzr.supabase.co';
    var SUPABASE_KEY = 'sb_publishable_wD_gKc2Doa_LXu8YLoZOcw_RczMuK-J';
    var DEBUG = true;

    function log() {
        if (!DEBUG) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[WL v2.1]');
        console.log.apply(console, args);
    }

    /* ── Helpers localStorage ── */
    function get(key)    { try { return localStorage.getItem(key); } catch(e) { return null; } }
    function set(key, v) { try { localStorage.setItem(key, v); } catch(e) {} }
    function getObj(key) { try { var v=localStorage.getItem(key); return v?JSON.parse(v):null; } catch(e){ return null; } }
    function del(key)    { try { localStorage.removeItem(key); } catch(e) {} }

    /* ── Leer ?club= de la URL ── */
    function getClubSlug() {
        try {
            return new URLSearchParams(window.location.search).get('club') || null;
        } catch(e) {
            var m = window.location.search.match(/[?&]club=([^&]+)/);
            return m ? decodeURIComponent(m[1]) : null;
        }
    }

    /* ── Inyectar logo del club en .logo-img ── */
    function aplicarLogo(club, intentos) {
        intentos = intentos || 0;
        var logoImg = document.querySelector('.logo-img');
        log('aplicarLogo() intento', intentos, '| .logo-img:', !!logoImg, '| logo_url:', club.logo_url);

        if (!logoImg && intentos < 5) {
            setTimeout(function() { aplicarLogo(club, intentos + 1); }, 200);
            return;
        }

        if (logoImg && club.logo_url) {
            // FIX CLAVE: quitar mix-blend-mode:lighten que hace invisible logos
            logoImg.style.mixBlendMode = 'normal';
            logoImg.style.background   = 'rgba(0,0,0,0.5)';
            logoImg.style.padding      = '6px';
            logoImg.style.objectFit    = 'contain';
            logoImg.style.borderRadius = '50%';
            // Cache-busting para forzar nueva descarga
            var sep = club.logo_url.indexOf('?') >= 0 ? '&' : '?';
            logoImg.src = club.logo_url + sep + 'wl=' + Date.now();
            logoImg.alt = club.nombre || 'Club';
            log('✅ Logo aplicado a .logo-img');
        }
    }

    /* ── Inyectar header completo ── */
    function inyectarHeader(club) {
        log('inyectarHeader() →', club.nombre);

        // 0. Deporte activo: usado para estilos multi‑deporte (billar, futbol, padel…)
        var deporte = (club && club.deporte) || get('wl_club_deporte') || 'billar';
        try {
            deporte = String(deporte).toLowerCase();
            set('wl_club_deporte', deporte);
            if (document.body) {
                document.body.setAttribute('data-deporte', deporte);
                document.body.classList.add('deporte-' + deporte);
            }
        } catch(e) {}

        // 1. Logo principal
        aplicarLogo(club, 0);

        // 2. Nombre en título (si no es página interna)
        var PAGINAS = ['CATEGORÍAS','RANKING','INSCRIPCIONES','TORNEOS','BRACKETS',
            'PERFIL','DUELO','RETO','SENSEI','CERTIFICADOS','POSICIONES','ENTRENAMIENTO'];
        var tituloEl = document.querySelector('.titulo, .header h1, h1');
        if (tituloEl && club.nombre) {
            var txt = (tituloEl.textContent||'').trim().toUpperCase();
            var esPagina = PAGINAS.some(function(p){ return txt.indexOf(p)>=0; });
            if (!esPagina) tituloEl.textContent = club.nombre;
        }

        // 3. Subtítulo o badge powered by
        var subEl = document.querySelector('.subtitulo, .header small, .header-sub');
        if (subEl) {
            subEl.innerHTML = 'POWERED BY <span style="color:#d4af37;opacity:1;">decarambol.com</span>';
            subEl.style.opacity = '0.7';
        } else {
            inyectarBadge();
        }

        // 4. Color del club
        if (club.color_primario) {
            var prev = document.getElementById('wl-color-style');
            if (prev) prev.remove();
            var s = document.createElement('style');
            s.id = 'wl-color-style';
            s.textContent =
                '.titulo,.header h1{color:' + club.color_primario + '!important;}' +
                '.logo-img{filter:drop-shadow(0 0 20px ' + club.color_primario + '88)!important;}';
            document.head.appendChild(s);
        }

        // 5. Title del navegador
        if (club.nombre && document.title.indexOf('DeCarambola') >= 0) {
            document.title = document.title.replace('DeCarambola', club.nombre + ' · DeCarambola');
        }

        // 6. Badge logo slider
        var badgeLogo = document.getElementById('badge-club-logo');
        if (badgeLogo && club.logo_url && !badgeLogo.querySelector('img')) {
            badgeLogo.innerHTML = '<img src="' + club.logo_url +
                '" style="width:20px;height:20px;border-radius:50%;object-fit:contain;background:#111;" alt="">';
        }

        // 7. Avatar mini
        var miniLogo = document.getElementById('club-logo-mini');
        if (miniLogo && club.logo_url) {
            miniLogo.innerHTML = '<img src="' + club.logo_url +
                '" style="width:100%;height:100%;object-fit:contain;border-radius:50%;background:#111;" alt="">';
        }
    }

    /* ── Badge flotante ── */
    function inyectarBadge() {
        if (document.getElementById('wl-powered-badge')) return;
        var b = document.createElement('div');
        b.id = 'wl-powered-badge';
        b.style.cssText = 'position:fixed;bottom:70px;right:12px;z-index:999;' +
            'background:rgba(0,0,0,0.75);border:1px solid rgba(212,175,55,0.3);' +
            'border-radius:20px;padding:4px 10px;font-family:Arial,sans-serif;' +
            'font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:1px;pointer-events:none;';
        b.innerHTML = 'powered by <strong style="color:#d4af37;">decarambol.com</strong>';
        document.body.appendChild(b);
    }

    /* ── Limpiar caché ── */
    function limpiarCache() {
        ['wl_club_nombre','wl_club_logo_url','wl_club_color','wl_club_slug','wl_club_cache','wl_club_deporte']
            .forEach(del);
    }

    /* ── Buscar club en Supabase ── */
    async function cargarClub(slug) {
        log('cargarClub() slug:', slug);

        // Invalidar caché si el slug cambió
        var slugCache = get('wl_club_slug');
        if (slugCache && slugCache !== slug) {
            log('Slug cambió. Limpiando caché: ' + slugCache + ' → ' + slug);
            limpiarCache();
        }

        // Usar caché si coincide
        var cache = getObj('wl_club_cache');
        if (cache && cache.codigo === slug) {
            log('Usando caché para:', slug);
            inyectarHeader(cache);
            return;
        }

        // Fetch a Supabase
        try {
            var url = SUPABASE_URL + '/rest/v1/clubs?codigo=eq.' +
                encodeURIComponent(slug) + '&select=id,nombre,codigo,logo_url,color_primario,deporte';
            log('Fetch:', url);
            var res = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            });
            var rows = await res.json();
            log('Respuesta:', res.status, '| Filas:', rows ? rows.length : 0);

            if (rows && rows.length > 0) {
                var club = rows[0];
                // Normalizar deporte — siempre minúsculas, default billar
                club.deporte = (club.deporte || 'billar').toLowerCase();
                // Guardar caché
                set('wl_club_slug',     slug);
                set('wl_club_nombre',   club.nombre);
                set('wl_club_logo_url', club.logo_url || '');
                set('wl_club_color',    club.color_primario || '');
                set('wl_club_deporte',  club.deporte);
                set('wl_club_cache',    JSON.stringify(club));
                inyectarHeader(club);
            } else {
                log('Club no encontrado para slug:', slug);
            }
        } catch(e) {
            log('Error Supabase:', e.message);
            var fallback = getObj('wl_club_cache');
            if (fallback) { log('Usando fallback caché'); inyectarHeader(fallback); }
        }
    }

    /* ── API pública ── */
    window.WL = window.WL || {};

    window.WL.setClub = function(data) {
        if (!data) return;
        if (data.nombre)         set('wl_club_nombre',   data.nombre);
        if (data.logo_url)       set('wl_club_logo_url', data.logo_url);
        if (data.color_primario) set('wl_club_color',    data.color_primario);
        // Deporte: billar por defecto, siempre minúsculas
        if (data.deporte) {
            set('wl_club_deporte', String(data.deporte).toLowerCase());
        } else if (!get('wl_club_deporte')) {
            set('wl_club_deporte', 'billar');
        }
        var slug = data.slug || data.codigo;
        if (slug) set('wl_club_slug', slug);
        set('wl_club_cache', JSON.stringify(data));
        inyectarHeader(data);
    };

    window.WL.clearClub    = limpiarCache;
    window.WL.getLogoUrl   = function() { return get('wl_club_logo_url') || null; };
    window.WL.getNombre    = function() { return get('wl_club_nombre')   || null; };
    window.WL.getDeporte   = function() { return get('wl_club_deporte')  || 'billar'; };
    // Alias compatibilidad
    window.WL.getNombreClub = window.WL.getNombre;

    // Debug desde consola: WL.debug()
    window.WL.debug = function() {
        console.group('[WL] Estado');
        console.log('slug URL:',   getClubSlug());
        console.log('slug cache:', get('wl_club_slug'));
        console.log('nombre:',     get('wl_club_nombre'));
        console.log('logo_url:',   get('wl_club_logo_url'));
        console.log('.logo-img:',  document.querySelector('.logo-img'));
        console.groupEnd();
    };

    /* ── MAIN ── */
    function init() {
        var slug = getClubSlug();
        log('init() | readyState:', document.readyState, '| slug:', slug);

        if (slug) {
            cargarClub(slug);
        } else {
            log('Sin ?club= en URL → solo badge');
            if (document.body) {
                inyectarBadge();
            } else {
                document.addEventListener('DOMContentLoaded', inyectarBadge);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

})();