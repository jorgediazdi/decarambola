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

    /* ── Helpers ── */
    function get(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
    function set(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }
    function getObj(key) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e) { return null; } }

    /* ── Leer ?club= de la URL ── */
    function getClubSlug() {
        var params = new URLSearchParams(window.location.search);
        return params.get('club') || get('wl_club_slug') || null;
    }

    /* ── Inyectar header con logo del club + powered by ── */
    function inyectarHeader(club) {
        /* 1. Logo del club */
        var logoImg = document.querySelector('.logo-img');
        if (logoImg && club.logo_url) {
            logoImg.src = club.logo_url;
            logoImg.alt = club.nombre;
            logoImg.style.cssText += ';object-fit:contain;background:#111;padding:4px;border-radius:50%;';
        }

        /* 2. Nombre del club en el título — no sobreescribir páginas internas */
        var PAGINAS_NO_REEMPLAZAR = ['CATEGORÍAS','RANKING','INSCRIPCIONES','TORNEOS',
            'BRACKETS','PERFIL','DUELO','RETO','SENSEI','CERTIFICADOS','POSICIONES','ENTRENAMIENTO'];
        var tituloEl = document.querySelector('.titulo, .header h1, h1');
        if (tituloEl && club.nombre) {
            var texto = (tituloEl.textContent || '').trim().toUpperCase();
            var esPagina = PAGINAS_NO_REEMPLAZAR.some(function(p) { return texto.indexOf(p) >= 0; });
            if (!esPagina) tituloEl.textContent = club.nombre;
        }

        /* 3. Subtítulo → "POWERED BY DECARAMBOLA" */
        var subEl = document.querySelector('.subtitulo, .header small, .header-sub');
        if (subEl) {
            subEl.innerHTML = 'POWERED BY <span style="color:#d4af37;opacity:1;">decarambol.com</span>';
            subEl.style.opacity = '0.7';
        } else {
            /* Si no existe subtítulo, inyectar badge flotante */
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

        /* 4. Color del club */
        if (club.color_primario) {
            var s = document.createElement('style');
            s.textContent =
                '.titulo, .header h1 { color: ' + club.color_primario + ' !important; }' +
                '.logo-img { filter: drop-shadow(0 0 20px ' + club.color_primario + '88) !important; }';
            document.head.appendChild(s);
        }

        /* 5. Title del navegador */
        if (club.nombre && document.title.indexOf('DeCarambola') >= 0) {
            document.title = document.title.replace('DeCarambola', club.nombre + ' · DeCarambola');
        }

        /* 6. Otros elementos opcionales */
        var badgeLogo = document.getElementById('badge-club-logo');
        if (badgeLogo && club.logo_url) {
            badgeLogo.innerHTML = '<img src="' + club.logo_url + '" style="width:18px;height:18px;border-radius:50%;object-fit:contain;" alt="">';
        }
        var clubLogoMini = document.getElementById('club-logo-mini');
        if (clubLogoMini && club.logo_url) {
            clubLogoMini.innerHTML = '<img src="' + club.logo_url + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%;" alt="">';
        }
    }

    /* ── Buscar club en Supabase por slug ── */
    async function cargarClubDesdeSupabase(slug) {
        // Primero revisar caché local (evita llamada si ya lo tenemos)
        var cache = getObj('wl_club_cache');
        if (cache && cache.slug === slug) {
            inyectarHeader(cache);
            return;
        }

        try {
            var res = await fetch(
                SUPABASE_URL + '/rest/v1/clubs?codigo=eq.' + slug + '&select=id,nombre,codigo,logo_url,color_primario',
                {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    }
                }
            );
            var rows = await res.json();
            if (rows && rows.length > 0) {
                var club = rows[0];
                // Guardar en caché local
                set('wl_club_slug', slug);
                set('wl_club_nombre', club.nombre);
                set('wl_club_logo_url', club.logo_url || '');
                set('wl_club_color', club.color_primario || '');
                set('wl_club_cache', JSON.stringify(club));
                inyectarHeader(club);
            }
        } catch(e) {
            console.warn('[WL] Sin conexión a Supabase:', e.message);
            // Fallback: usar caché si existe
            var fallback = getObj('wl_club_cache');
            if (fallback) inyectarHeader(fallback);
        }
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
        ['wl_club_nombre','wl_club_logo_url','wl_club_color','wl_club_slug','wl_club_cache'].forEach(function(k) {
            localStorage.removeItem(k);
        });
    };

    window.WL.getLogoUrl    = function() { return get('wl_club_logo_url') || null; };
    window.WL.getNombreClub = function() { return get('wl_club_nombre')   || null; };

    /* ── MAIN ── */
    function init() {
        var slug = getClubSlug();

        if (slug) {
            // Hay club en la URL → cargar desde Supabase
            cargarClubDesdeSupabase(slug);
        } else {
            // Sin club → solo agregar "powered by" discreto
            var existing = document.getElementById('wl-powered-badge');
            if (!existing) {
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
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();