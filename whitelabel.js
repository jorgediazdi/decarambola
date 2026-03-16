/**
 * ══════════════════════════════════════════════════════
 *  DECARAMBOLA — WHITE LABEL ENGINE  v1.0
 *  Archivo: whitelabel.js
 *  Incluir en cualquier página: <script src="whitelabel.js"></script>
 *
 *  Qué hace:
 *  1. Lee localStorage para saber el club del jugador activo
 *  2. Si hay logo de club → lo muestra en el header reemplazando al logo base
 *  3. Muestra el nombre del club debajo del logo
 *  4. Agrega "Powered by DeCarambola" discretamente
 *  5. Si no hay club → mantiene todo igual (marca DeCarambola)
 *
 *  localStorage utilizado:
 *  - mi_perfil          → objeto del jugador (incluye .club y .club_logo_url)
 *  - wl_club_nombre     → nombre del club (cache)
 *  - wl_club_logo_url   → URL del logo del club (cache, puede ser URL o base64)
 *  - wl_club_color      → color primario del club (opcional, ej: "#e74c3c")
 * ══════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    /* ── Configuración ── */
    var SUPABASE_URL = 'https://iwvogyloebvieloequzr.supabase.co';
    var SUPABASE_KEY = 'sb_publishable_wD_gKc2Doa_LXu8YLoZOcw_RczMuK-J';

    /* ── Helpers ── */
    function get(key) {
        try { return localStorage.getItem(key); } catch(e) { return null; }
    }
    function set(key, val) {
        try { localStorage.setItem(key, val); } catch(e) {}
    }
    function getObj(key) {
        try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
    }

    /* ── Leer datos del jugador activo ── */
    function getDatosClub() {
        var perfil = getObj('mi_perfil');
        return {
            club_nombre  : get('wl_club_nombre') || (perfil && perfil.club) || null,
            club_logo_url: get('wl_club_logo_url') || (perfil && perfil.club_logo_url) || null,
            club_color   : get('wl_club_color')   || null
        };
    }

    /* ── Crear estilos dinámicos para el club ── */
    function aplicarColorClub(color) {
        if (!color) return;
        var s = document.createElement('style');
        s.id = 'wl-color-override';
        // Reemplaza el color ORO con el color del club en los elementos clave
        s.textContent =
            '.titulo, .portal-jug .p-titulo { color: ' + color + ' !important; }' +
            '.logo-img { filter: drop-shadow(0 0 25px ' + color + '88) !important; }' +
            '.badge-nivel { background: linear-gradient(135deg, ' + color + ', ' + color + 'aa) !important; }';
        document.head.appendChild(s);
    }

    /* ── Inyectar logo y nombre del club en el header ── */
    function inyectarHeader(datos) {
        if (!datos.club_nombre && !datos.club_logo_url) return; // Sin club → nada que hacer

        /* 1. Reemplazar logo — buscar múltiples selectores posibles */
        var logoImg = document.querySelector('.logo-img');
        if (logoImg && datos.club_logo_url) {
            logoImg.src = datos.club_logo_url;
            logoImg.alt = datos.club_nombre || 'Club';
            logoImg.style.objectFit = 'contain';
            logoImg.style.background = '#111';
            logoImg.style.padding = '4px';
            logoImg.style.borderRadius = '50%';
        }

        /* 2. Cambiar título principal — buscar múltiples selectores */
        var TITULO_SELECTORS = ['.titulo', '.header h1', '.header-titulo', '.portal-titulo', 'h1'];
        var tituloEl = null;
        for (var ts = 0; ts < TITULO_SELECTORS.length; ts++) {
            tituloEl = document.querySelector(TITULO_SELECTORS[ts]);
            if (tituloEl) break;
        }
        // No sobreescribir si ya tiene nombre de página específico (ej: "CATEGORÍAS", "RANKING")
        var PAGINAS_NO_REEMPLAZAR = ['CATEGORÍAS','RANKING','INSCRIPCIONES','TORNEOS','BRACKETS','PERFIL','DUELO','RETO','SENSEI','CERTIFICADOS','POSICIONES','ENTRENAMIENTO'];
        if (tituloEl && datos.club_nombre) {
            var textoActual = (tituloEl.textContent || '').trim().toUpperCase();
            var esNombreDePagina = PAGINAS_NO_REEMPLAZAR.some(function(p) { return textoActual.indexOf(p) >= 0; });
            if (!esNombreDePagina) {
                tituloEl.textContent = datos.club_nombre;
            }
        }

        /* 3. Cambiar subtítulo a "Powered by DeCarambola" */
        var SUB_SELECTORS = ['.subtitulo', '.header small', '.header-sub', '.portal-sub'];
        var subEl = null;
        for (var ss = 0; ss < SUB_SELECTORS.length; ss++) {
            subEl = document.querySelector(SUB_SELECTORS[ss]);
            if (subEl) break;
        }
        if (subEl) {
            // Solo agregar "powered by" si no lo tiene ya
            if (subEl.textContent.indexOf('POWERED') < 0 && subEl.textContent.indexOf('DeCarambola') < 0) {
                subEl.textContent = 'POWERED BY DECARAMBOLA';
                subEl.style.opacity = '0.55';
            }
        }

        /* 4. Color del club */
        if (datos.club_color) {
            aplicarColorClub(datos.club_color);
        }

        /* 5. Actualizar badge en el slider del index si existe */
        var badgeLogo = document.getElementById('badge-club-logo');
        if (badgeLogo && datos.club_logo_url) {
            badgeLogo.innerHTML =
                '<img src="' + datos.club_logo_url + '" ' +
                'style="width:18px;height:18px;border-radius:50%;object-fit:contain;background:#111;padding:1px;" ' +
                'alt="' + (datos.club_nombre||'Club') + '">';
        }

        /* 6. Actualizar mini-logo del portal de club si existe */
        var clubLogoMini = document.getElementById('club-logo-mini');
        if (clubLogoMini && datos.club_logo_url) {
            clubLogoMini.innerHTML =
                '<img src="' + datos.club_logo_url + '" ' +
                'style="width:100%;height:100%;object-fit:contain;border-radius:50%;background:#111;" ' +
                'alt="' + (datos.club_nombre||'Club') + '">';
        }

        /* 7. Actualizar title de la pestaña del navegador */
        if (datos.club_nombre && document.title.indexOf('DeCarambola') >= 0) {
            document.title = document.title.replace('DeCarambola', datos.club_nombre + ' · DeCarambola');
        }
    }

    /* ── Sincronizar logo desde Supabase si tenemos club_id pero no logo ── */
    function sincronizarLogoDesdeSupabase(club_id) {
        if (!club_id || get('wl_club_logo_url')) return; // ya tenemos logo
        fetch(SUPABASE_URL + '/rest/v1/clubs?select=id,nombre,logo_url,color_primario&id=eq.' + club_id, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY
            }
        })
        .then(function(r) { return r.json(); })
        .then(function(rows) {
            if (rows && rows.length > 0) {
                var club = rows[0];
                if (club.nombre)        set('wl_club_nombre',  club.nombre);
                if (club.logo_url)      set('wl_club_logo_url', club.logo_url);
                if (club.color_primario) set('wl_club_color',  club.color_primario);
                // Relanzar inyección con datos frescos
                inyectarHeader(getDatosClub());
            }
        })
        .catch(function() {}); // Silencioso — no bloquea
    }

    /* ── Función pública para guardar club al afiliarse ── */
    window.WL = window.WL || {};

    /**
     * Llamar cuando el jugador se registra o hace login con un club
     * @param {object} clubData - { id, nombre, logo_url, color_primario }
     */
    window.WL.setClub = function(clubData) {
        if (!clubData) return;
        if (clubData.nombre)        set('wl_club_nombre',  clubData.nombre);
        if (clubData.logo_url)      set('wl_club_logo_url', clubData.logo_url);
        if (clubData.color_primario) set('wl_club_color',  clubData.color_primario);
        // Actualizar perfil guardado
        var perfil = getObj('mi_perfil');
        if (perfil) {
            perfil.club = clubData.nombre;
            perfil.club_id = clubData.id;
            perfil.club_logo_url = clubData.logo_url || '';
            set('mi_perfil', JSON.stringify(perfil));
        }
        inyectarHeader(getDatosClub());
    };

    /**
     * Limpiar datos del club (al cerrar sesión)
     */
    window.WL.clearClub = function() {
        localStorage.removeItem('wl_club_nombre');
        localStorage.removeItem('wl_club_logo_url');
        localStorage.removeItem('wl_club_color');
    };

    /**
     * Obtener logo actual del club (para usar en carnet, perfil, etc.)
     */
    window.WL.getLogoUrl = function() {
        return get('wl_club_logo_url') || null;
    };

    window.WL.getNombreClub = function() {
        return get('wl_club_nombre') || null;
    };

    /* ── MAIN: ejecutar cuando el DOM esté listo ── */
    function init() {
        var datos = getDatosClub();

        // Si hay datos en localStorage → inyectar inmediatamente
        if (datos.club_nombre || datos.club_logo_url) {
            inyectarHeader(datos);
        }

        // Si el jugador tiene club_id pero no logo → buscar en Supabase
        var perfil = getObj('mi_perfil');
        if (perfil && perfil.club_id && !datos.club_logo_url) {
            sincronizarLogoDesdeSupabase(perfil.club_id);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init(); // DOM ya listo
    }

})();