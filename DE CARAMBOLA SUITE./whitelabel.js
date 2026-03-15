/**
 * ══════════════════════════════════════════════════════
 *  DECARAMBOLA — WHITE LABEL ENGINE  v2.0
 *  Archivo: whitelabel.js
 *
 *  Lógica:
 *  - Lee ?club=slug en la URL
 *  - Busca el club en Supabase por slug
 *  - Muestra logo del club + "powered by decarambol.com"
 *  - Sin ?club= → solo marca DeCarambola normal
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
        args.unshift('[WL]');
        console.log.apply(console, args);
    }

    /* ── Helpers ── */
    function get(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
    function set(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }
    function getObj(key) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e) { return null; } }
    function del(key) { try { localStorage.removeItem(key); } catch(e) {} }

    /* ── Leer ?club= de la URL ── */
    function getClubSlug() {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get('club') || get('wl_club_slug') || null;
        } catch(e) {
            var m = window.location.search.match(/[?&]club=([^&]+)/);
            return m ? decodeURIComponent(m[1]) : (get('wl_club_slug') || null);
        }
    }

    function inyectarBadge() {
        if (document.getElementById('wl-powered-badge')) return;
        var badge = document.createElement('div');
        badge.id = 'wl-powered-badge';
        badge.style.cssText = [
            'position:fixed;bottom:70px;right:12px;z-index:999;',
            'background:rgba(0,0,0,0.75);border:1px solid rgba(212,175,55,0.3);',
            'border-radius:20px;padding:4px 10px;',
            'font-family:Arial,sans-serif;font-size:9px;',
            'color:rgba(255,255,255,0.5);letter-spacing:1px;',
            'pointer-events:none;'
        ].join('');
        badge.innerHTML = 'powered by <strong style="color:#d4af37;">decarambol.com</strong>';
        document.body.appendChild(badge);
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

        var logoImg = document.querySelector('.logo-img');
        if (logoImg) {
            logoImg.src = club.logo_url;
            logoImg.alt = club.nombre || 'Club';
            logoImg.style.cssText += ';mix-blend-mode:normal;object-fit:contain;background:rgba(0,0,0,0.5);padding:6px;border-radius:50%;';
        }

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

    /* ── Inyectar header con logo del club + powered by ── */
    function inyectarHeader(inputClub) {
        var club = normalizarClub(inputClub);
        if (!club) return;
        log('inyectarHeader →', club.nombre);

        set('wl_club_nombre', club.nombre);
        set('wl_club_logo_url', club.logo_url || '');
        set('wl_club_color', club.color_primario || '#d4af37');
        if (club.slug) set('wl_club_slug', club.slug);
        set('wl_club_deporte', club.deporte || 'billar');
        set('wl_club_cache', JSON.stringify(club));

        sincronizarClubConfig(club);
        aplicarLogosGlobales(club);
        aplicarMarcaPrincipal(club);

        var subEl = document.querySelector('.subtitulo, .header small, .header-sub');
        if (subEl) {
            subEl.innerHTML = 'POWERED BY <span style="color:#d4af37;opacity:1;">decarambol.com</span>';
            subEl.style.opacity = '0.7';
        } else {
            inyectarBadge();
        }

        if (club.color_primario) {
            var prev = document.getElementById('wl-color-style');
            if (prev) prev.remove();
            var s = document.createElement('style');
            s.id = 'wl-color-style';
            s.textContent =
                '.titulo, .header h1, #header-titulo, .header-marca span { color: ' + club.color_primario + ' !important; }' +
                '.logo-img { filter: drop-shadow(0 0 20px ' + club.color_primario + '88) !important; }';
            document.head.appendChild(s);
        }
    }

    /* ── Buscar club en Supabase por slug ── */
    async function cargarClubDesdeSupabase(slug) {
        // Primero revisar caché local (evita llamada si ya lo tenemos)
        var cache = getObj('wl_club_cache');
        if (cache && (cache.codigo === slug || cache.slug === slug)) {
            inyectarHeader(cache);
            return;
        }

        try {
            var ctrl = new AbortController();
            var timer = setTimeout(function() { ctrl.abort(); }, 6000);
            var res;
            try {
                res = await fetch(
                    SUPABASE_URL + '/rest/v1/clubs?codigo=eq.' + encodeURIComponent(slug) + '&select=id,nombre,codigo,logo_url,color_primario,deporte',
                    {
                        signal: ctrl.signal,
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': 'Bearer ' + SUPABASE_KEY
                        }
                    }
                );
            } finally {
                clearTimeout(timer);
            }
            var rows = await res.json();
            if (rows && rows.length > 0) {
                var club = normalizarClub(rows[0]);
                // Guardar en caché local
                if (club && !club.slug) club.slug = slug;
                inyectarHeader(club);
            } else {
                var fallbackRows = getObj('wl_club_cache');
                if (fallbackRows) inyectarHeader(fallbackRows);
            }
        } catch(e) {
            console.warn('[WL] Sin conexión a Supabase:', e.message);
            // Fallback: usar caché si existe
            var fallback = getObj('wl_club_cache');
            if (fallback) inyectarHeader(fallback);
        }
    }

    async function cargarClubPorId(clubId) {
        if (!clubId) return false;
        try {
            var ctrl = new AbortController();
            var timer = setTimeout(function() { ctrl.abort(); }, 6000);
            var res;
            try {
                res = await fetch(
                    SUPABASE_URL + '/rest/v1/clubs?id=eq.' + encodeURIComponent(clubId) + '&select=id,nombre,codigo,logo_url,color_primario,deporte&limit=1',
                    {
                        signal: ctrl.signal,
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': 'Bearer ' + SUPABASE_KEY
                        }
                    }
                );
            } finally {
                clearTimeout(timer);
            }
            var rows = await res.json();
            if (rows && rows.length > 0) {
                inyectarHeader(normalizarClub(rows[0]));
                return true;
            }
        } catch(e) {
            console.warn('[WL] No se pudo hidratar club por id:', e.message);
        }
        return false;
    }

    /* ── API pública ── */
    window.WL = window.WL || {};

    window.WL.setClub = function(clubData) {
        if (!clubData) return;
        if (clubData.nombre)        set('wl_club_nombre',  clubData.nombre);
        if (clubData.logo_url)      set('wl_club_logo_url', clubData.logo_url);
        if (clubData.color_primario) set('wl_club_color', clubData.color_primario);
        if (clubData.slug)          set('wl_club_slug', clubData.slug);
        set('wl_club_cache', JSON.stringify(clubData));
        inyectarHeader(clubData);
    };

    window.WL.clearClub = function() {
        ['wl_club_nombre','wl_club_logo_url','wl_club_color','wl_club_slug','wl_club_cache','wl_club_deporte']
            .forEach(del);
    };

    window.WL.getLogoUrl    = function() { return get('wl_club_logo_url') || null; };
    window.WL.getNombre     = function() { return get('wl_club_nombre') || null; };
    window.WL.getNombreClub = function() { return get('wl_club_nombre')   || null; };
    window.WL.getDeporte    = function() { return get('wl_club_deporte') || 'billar'; };

    /* ── MAIN ── */
    function init() {
        var slug = getClubSlug();

        if (slug) {
            cargarClubDesdeSupabase(slug);
            return;
        }
        var cache = getObj('wl_club_cache');
        if (cache && cache.nombre) {
            inyectarHeader(cache);
            return;
        }
        var localClub = clubDesdeStorage();
        if (localClub && localClub.nombre) {
            inyectarHeader(localClub);
            return;
        }
        var perfil = getObj('mi_perfil');
        if (perfil && perfil.club_id) {
            cargarClubPorId(perfil.club_id).then(function(ok){
                if (!ok) inyectarBadge();
            });
            return;
        }
        inyectarBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();