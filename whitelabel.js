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
            return new URLSearchParams(window.location.search).get('club') || get('wl_club_slug') || null;
        } catch(e) {
            var m = window.location.search.match(/[?&]club=([^&]+)/);
            return m ? decodeURIComponent(m[1]) : (get('wl_club_slug') || null);
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

    function normalizarClub(club) {
        if (!club) return null;
        var logo = club.logo_url || club.logoUrl || '';
        var nombre = club.nombre || get('wl_club_nombre') || '';
        if (!nombre) return null;
        return {
            id: club.id || null,
            nombre: nombre,
            codigo: club.codigo || club.slug || get('wl_club_slug') || null,
            slug: club.slug || club.codigo || get('wl_club_slug') || null,
            logo_url: logo,
            color_primario: club.color_primario || club.color || get('wl_club_color') || '#d4af37',
            deporte: (club.deporte || get('wl_club_deporte') || 'billar').toLowerCase()
        };
    }

    function inyectarEnElemento(el, club, size) {
        if (!el || !club || !club.logo_url) return;
        var px = parseInt(size, 10);
        if (isNaN(px) || px <= 0) px = 56;
        if (el.tagName === 'IMG') {
            el.src = club.logo_url;
            el.alt = club.nombre || 'Club';
            el.style.objectFit = 'contain';
            el.style.background = '#111';
            return;
        }
        el.innerHTML = '<img src="' + club.logo_url + '" alt="' + (club.nombre || 'Club') +
            '" style="width:' + px + 'px;height:' + px + 'px;border-radius:50%;object-fit:contain;background:#111;padding:2px;">';
    }

    function aplicarLogosGlobales(club) {
        if (!club || !club.logo_url) return;
        var ids = ['badge-club-logo', 'club-logo-mini', 'hdr-logo', 'hdr-logo-ranking', 'header-logo-club'];
        for (var i = 0; i < ids.length; i++) {
            var el = document.getElementById(ids[i]);
            if (!el) continue;
            var size = ids[i] === 'header-logo-club' ? 180 : (el.getAttribute('data-club-logo') || 32);
            inyectarEnElemento(el, club, size);
            if (ids[i] === 'header-logo-club') el.style.display = '';
        }
        var custom = document.querySelectorAll('[data-club-logo]');
        for (var j = 0; j < custom.length; j++) {
            var n = custom[j].getAttribute('data-club-logo') || 32;
            inyectarEnElemento(custom[j], club, n);
        }
        var deca = document.getElementById('logo-decarambola');
        var clubWrap = document.getElementById('header-logo-club');
        if (deca && clubWrap) {
            if (!window.__DECA_LOGO_SRC) window.__DECA_LOGO_SRC = deca.src;
            deca.style.display = 'none';
            clubWrap.style.display = '';
        }
    }

    function aplicarMarcaPrincipal(club) {
        if (!club || !club.nombre) return;
        var targets = ['#header-titulo', '.header-marca span', '.header-titulo', '.c-marca', '.footer-txt'];
        for (var i = 0; i < targets.length; i++) {
            var els = document.querySelectorAll(targets[i]);
            for (var j = 0; j < els.length; j++) {
                var txt = (els[j].textContent || '').trim();
                if (!txt || /DE\s*CARAMBOLA|DECARAMBOLA/i.test(txt)) {
                    els[j].textContent = club.nombre;
                }
            }
        }
        var titleEl = document.title || '';
        if (/DE\s*CARAMBOLA|DECARAMBOLA/i.test(titleEl)) {
            document.title = titleEl.replace(/DE\s*CARAMBOLA|DECARAMBOLA/ig, club.nombre);
        }
    }

    function sincronizarClubConfig(club) {
        if (!club) return;
        var cfg = getObj('CLUB_CONFIG') || {};
        cfg.nombre = club.nombre || cfg.nombre || '';
        cfg.logoUrl = club.logo_url || cfg.logoUrl || '';
        cfg.logo = cfg.logoUrl;
        cfg.color = club.color_primario || cfg.color || '#d4af37';
        cfg.lema = cfg.lema || 'BILLAR TRES BANDAS';
        set('CLUB_CONFIG', JSON.stringify(cfg));
    }

    function clubDesdeStorage() {
        var raw = getObj('club_activo');
        if (!raw || typeof raw !== 'object') return null;
        return normalizarClub({
            id: raw.id || null,
            nombre: raw.nombre || raw.name || null,
            codigo: raw.codigo || raw.slug || null,
            slug: raw.slug || raw.codigo || null,
            logo_url: raw.logo_url || raw.logoUrl || null,
            color_primario: raw.color_primario || raw.color || null,
            deporte: raw.deporte || null
        });
    }

    /* ── Inyectar header completo ── */
    function inyectarHeader(inputClub) {
        var club = normalizarClub(inputClub);
        if (!club) return;
        log('inyectarHeader() →', club.nombre);

        set('wl_club_nombre', club.nombre);
        set('wl_club_logo_url', club.logo_url || '');
        set('wl_club_color', club.color_primario || '#d4af37');
        if (club.slug) set('wl_club_slug', club.slug);
        set('wl_club_deporte', club.deporte || 'billar');
        set('wl_club_cache', JSON.stringify(club));
        sincronizarClubConfig(club);

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
        aplicarLogosGlobales(club);
        aplicarMarcaPrincipal(club);

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
        if (cache && (cache.codigo === slug || cache.slug === slug)) {
            log('Usando caché para:', slug);
            inyectarHeader(cache);
            return;
        }

        // Fetch a Supabase
        try {
            var url = SUPABASE_URL + '/rest/v1/clubs?codigo=eq.' +
                encodeURIComponent(slug) + '&select=id,nombre,codigo,logo_url,color_primario,deporte';
            log('Fetch:', url);
            var ctrl = new AbortController();
            var timer = setTimeout(function() { ctrl.abort(); }, 6000);
            var res;
            try {
                res = await fetch(url, {
                    signal: ctrl.signal,
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    }
                });
            } finally {
                clearTimeout(timer);
            }
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

    async function cargarClubPorId(clubId) {
        if (!clubId) return false;
        try {
            var url = SUPABASE_URL + '/rest/v1/clubs?id=eq.' +
                encodeURIComponent(clubId) + '&select=id,nombre,codigo,logo_url,color_primario,deporte&limit=1';
            var ctrl = new AbortController();
            var timer = setTimeout(function() { ctrl.abort(); }, 6000);
            var res;
            try {
                res = await fetch(url, {
                    signal: ctrl.signal,
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    }
                });
            } finally {
                clearTimeout(timer);
            }
            var rows = await res.json();
            if (rows && rows.length > 0) {
                inyectarHeader(normalizarClub(rows[0]));
                return true;
            }
        } catch(e) {
            log('No se pudo hidratar club por id:', e.message);
        }
        return false;
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
            return;
        }
        var cache = getObj('wl_club_cache');
        if (cache && cache.nombre) {
            log('Sin slug en URL, aplicando cache local');
            inyectarHeader(cache);
            return;
        }
        var localClub = clubDesdeStorage();
        if (localClub && localClub.nombre) {
            log('Sin slug, usando club_activo local');
            inyectarHeader(localClub);
            return;
        }
        var perfil = getObj('mi_perfil');
        if (perfil && perfil.club_id) {
            log('Sin slug, intentando club por mi_perfil.club_id');
            cargarClubPorId(perfil.club_id).then(function(ok){
                if (!ok) inyectarBadge();
            });
            return;
        }
        log('Sin ?club= en URL ni cache → solo badge');
        if (document.body) {
            inyectarBadge();
        } else {
            document.addEventListener('DOMContentLoaded', inyectarBadge);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }

})();