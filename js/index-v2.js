/**
 * DeCarambola — Home v2
 * MOCK - conectar a Supabase: reemplazar mocks por consultas reales.
 * Compat: dejar window.supabase si ya se inicializa en otro script (no incluido en index por defecto).
 */
(function () {
    "use strict";

    // MOCK - conectar a Supabase
    var mockUser = {
        nombre: "Maestro JH",
        nivel: "Pro",
        nivel_num: 3,
        promedio: 1.12,
        ranking: 47,
        duelos_semana: 3,
        torneos_activos: 1,
        premium: true,
        partidas_meta_semana: 5,
        partidas_jugadas_semana: 3
    };

    // MOCK - conectar a Supabase: tabla torneos
    var mockTorneos = [
        {
            id: "t001",
            nombre: "Copa Élite Carambola",
            etapa: "Clasificatoria",
            fecha_limite: "2026-04-02",
            fecha_sorteo: "2026-04-05",
            cupos_total: 32,
            cupos_disponibles: 8,
            estado_usuario: "pendiente"
        },
        {
            id: "t002",
            nombre: "Torneo Maestros",
            etapa: "Inscripciones abiertas",
            fecha_limite: "2026-04-10",
            fecha_sorteo: "2026-04-12",
            cupos_total: 16,
            cupos_disponibles: 12,
            estado_usuario: "inscrito"
        },
        {
            id: "t003",
            nombre: "Copa Regional Cierre",
            etapa: "Cerrado",
            fecha_limite: "2026-03-01",
            fecha_sorteo: "2026-03-03",
            cupos_total: 24,
            cupos_disponibles: 0,
            estado_usuario: "cerrado"
        }
    ];

    // MOCK - conectar a Supabase: ranking
    var mockRanking = [
        { pos: 1, nombre: "El Tigre", promedio: 2.34 },
        { pos: 2, nombre: "Maestro JH", promedio: 1.89 },
        { pos: 3, nombre: "La Sombra", promedio: 1.76 }
    ];

    // MOCK - conectar a Supabase: clubes, duelos TV
    var mockSocial = {
        clubes_activos: 4,
        clubes_nombres: ["Club Central", "Mesa VIP", "Salón Oro", "Carambola Norte"],
        jugador_semana: { nombre: "El Tigre", nota: "Subió 12 puestos en ranking semanal" },
        duelo_tv: { titulo: "Noche Tres Bandas", fecha: "06 ABR · 20:00", mesa: "Mesa 1 · TV" },
        duelo_reciente: { rival: "La Sombra", delta: "+0.08 avg", cuando: "hace 2 días" }
    };

    /** MOCK - true hasta conectar sesión real (p. ej. supabase.auth.getSession) */
    var hasSession = true;

    function initials(name) {
        if (!name) return "DC";
        var p = String(name).trim().split(/\s+/);
        if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
        return (p[0][0] + p[p.length - 1][0]).toUpperCase();
    }

    function parseISODate(s) {
        var d = new Date(s + "T12:00:00");
        return isNaN(d.getTime()) ? null : d;
    }

    function daysUntil(iso) {
        var t = parseISODate(iso);
        if (!t) return null;
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        t.setHours(0, 0, 0, 0);
        return Math.ceil((t - now) / 86400000);
    }

    function formatDateEs(iso) {
        var t = parseISODate(iso);
        if (!t) return iso;
        return t.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
    }

    function firstOpenTorneoLimite() {
        for (var i = 0; i < mockTorneos.length; i++) {
            var d = daysUntil(mockTorneos[i].fecha_limite);
            if (d != null && d >= 0 && mockTorneos[i].estado_usuario !== "cerrado") {
                return mockTorneos[i].fecha_limite;
            }
        }
        return mockTorneos[0] ? mockTorneos[0].fecha_limite : null;
    }

    function pickMotivation() {
        var lim = firstOpenTorneoLimite();
        var dias = lim != null ? daysUntil(lim) : null;
        var torneoLine =
            dias != null && dias >= 0
                ? "Tu próximo torneo cierra en " + dias + " días"
                : "Hay torneos en agenda — revisá inscripciones";
        var lines = [
            "Tu promedio actual: " + mockUser.promedio.toFixed(2),
            "Has jugado " + mockUser.duelos_semana + " duelos esta semana",
            torneoLine
        ];
        var i = new Date().getDate() % lines.length;
        return lines[i];
    }

    function sparkBars(seed) {
        var h = [40, 65, 45, 80, 55, 90, 70, 50];
        var out = "";
        for (var i = 0; i < h.length; i++) {
            var pct = h[(i + seed) % h.length];
            out += '<span style="height:' + pct + '%"></span>';
        }
        return out;
    }

    function renderStats(container) {
        if (!container) return;
        var stats = [
            { icon: "◎", value: mockUser.promedio.toFixed(2), label: "Promedio", href: "ranking.html", seed: 0 },
            { icon: "◇", value: "#" + mockUser.ranking, label: "Ranking", href: "ranking.html", seed: 1 },
            { icon: "⚡", value: String(mockUser.duelos_semana), label: "Duelos esta semana", href: "apps/club/sala/mesas.html", seed: 2 },
            { icon: "✦", value: String(mockUser.torneos_activos), label: "Torneos activos", href: "apps/organizador/organizador.html", seed: 3 }
        ];
        var html = "";
        stats.forEach(function (s) {
            html +=
                '<a class="stat-card" href="' +
                s.href +
                '">' +
                '<span class="stat-card__chevron" aria-hidden="true">›</span>' +
                '<div class="stat-card__icon" aria-hidden="true">' +
                s.icon +
                "</div>" +
                '<div class="stat-card__value">' +
                s.value +
                "</div>" +
                '<div class="stat-card__label">' +
                s.label +
                "</div>" +
                '<div class="stat-card__spark">' +
                sparkBars(s.seed) +
                "</div>" +
                "</a>";
        });
        container.innerHTML = html;
    }

    function cuposBarClass(disponibles, total) {
        if (!total) return "event-card__progress-bar--gold";
        var ratio = disponibles / total;
        return ratio < 0.2 ? "event-card__progress-bar--urgent" : "event-card__progress-bar--gold";
    }

    function renderTorneos(container) {
        if (!container) return;
        var html = "";
        mockTorneos.forEach(function (t) {
            var d = daysUntil(t.fecha_limite);
            var cerrado = t.estado_usuario === "cerrado" || t.cupos_disponibles <= 0;
            var urgency =
                d != null && d >= 0
                    ? "Cierra en <strong>" + d + "</strong> días · <strong>" + t.cupos_disponibles + "</strong> cupos"
                    : "Inscripciones · <strong>" + t.cupos_disponibles + "</strong> cupos";

            var pct = t.cupos_total ? Math.round((t.cupos_disponibles / t.cupos_total) * 100) : 0;
            var barCls = cuposBarClass(t.cupos_disponibles, t.cupos_total);

            var btnPrimary = "";
            if (cerrado) {
                btnPrimary =
                    '<span class="btn-event btn-event--muted" role="status">Cerrado</span>';
            } else if (t.estado_usuario === "inscrito") {
                btnPrimary =
                    '<span class="btn-event btn-event--success" role="status">Ya inscrito ✓</span>';
            } else {
                btnPrimary =
                    '<a class="btn-event btn-event--primary" href="apps/organizador/organizador.html">Inscribirme</a>';
            }

            html +=
                '<article class="event-card" data-torneo-id="' +
                t.id +
                '">' +
                '<h3 class="event-card__name">' +
                esc(t.nombre) +
                "</h3>" +
                '<div class="event-card__stage">' +
                esc(t.etapa) +
                "</div>" +
                '<p class="event-card__urgency">' +
                urgency +
                "</p>" +
                '<div class="event-card__row">Límite inscripción: ' +
                esc(formatDateEs(t.fecha_limite)) +
                "</div>" +
                '<div class="event-card__row">Sorteo: ' +
                esc(formatDateEs(t.fecha_sorteo)) +
                "</div>" +
                '<div class="event-card__progress">' +
                '<div class="event-card__progress-bar ' +
                barCls +
                '" style="width:' +
                pct +
                '%"></div></div>' +
                '<div class="event-card__actions">' +
                btnPrimary +
                '<a class="btn-event btn-event--ghost" href="apps/organizador/organizador.html">Ver torneo</a>' +
                "</div></article>";
        });
        container.innerHTML = html;
    }

    function esc(s) {
        var d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
    }

    function applyHeaderSession() {
        var header = document.getElementById("home-header");
        if (!header) return;
        header.classList.toggle("home-header--user", hasSession);
        header.classList.toggle("home-header--guest", !hasSession);
        var av = document.getElementById("user-avatar-initials");
        var nm = document.getElementById("user-name");
        var bd = document.getElementById("user-badge");
        if (hasSession && av && nm && bd) {
            av.textContent = initials(mockUser.nombre);
            nm.textContent = mockUser.nombre;
            bd.textContent = "Nivel " + mockUser.nivel_num + " · " + mockUser.nivel;
        }
    }

    function applyHero() {
        var greet = document.getElementById("hero-greeting");
        var mot = document.getElementById("hero-motivation");
        var ringPct = document.getElementById("hero-dashboard");
        var cap = document.getElementById("hero-ring-caption");
        var recent = document.getElementById("hero-recent-session");
        var displayName = hasSession ? mockUser.nombre : "invitado";
        if (greet) greet.textContent = "Bienvenido, " + displayName;
        if (mot) mot.textContent = pickMotivation();
        if (ringPct && mockUser.partidas_meta_semana) {
            var p = Math.min(1, mockUser.partidas_jugadas_semana / mockUser.partidas_meta_semana);
            ringPct.style.setProperty("--ring-pct", String(p));
        }
        if (cap)
            cap.textContent =
                mockUser.partidas_jugadas_semana +
                " de " +
                mockUser.partidas_meta_semana +
                " partidas esta semana";
        var pctEl = document.getElementById("hero-ring-pct");
        if (pctEl && mockUser.partidas_meta_semana) {
            var pct = Math.round(
                (mockUser.partidas_jugadas_semana / mockUser.partidas_meta_semana) * 100
            );
            pctEl.textContent = pct + "%";
        }
        if (recent) {
            var dr = mockSocial.duelo_reciente;
            recent.innerHTML =
                "Último duelo vs <strong>" +
                esc(dr.rival) +
                "</strong> · " +
                esc(dr.delta) +
                " · " +
                esc(dr.cuando);
        }
    }

    function renderSocial() {
        var rankEl = document.getElementById("social-ranking");
        if (rankEl) {
            var h = "";
            mockRanking.forEach(function (r) {
                h +=
                    '<div class="social-block__row"><span class="social-block__name">' +
                    esc(r.nombre) +
                    '</span><span class="social-block__val">' +
                    r.promedio.toFixed(2) +
                    "</span></div>";
            });
            rankEl.innerHTML = h;
        }
        var clubsEl = document.getElementById("social-clubes");
        if (clubsEl) {
            clubsEl.innerHTML =
                '<p style="margin:0 0 8px;font-size:0.9rem;color:var(--color-text);">' +
                mockSocial.clubes_activos +
                " clubes activos</p>" +
                "<p style=\"margin:0;font-size:0.82rem;color:var(--color-text-muted);\">" +
                esc(mockSocial.clubes_nombres.join(" · ")) +
                "</p>";
        }
        var featEl = document.getElementById("social-featured");
        if (featEl) {
            featEl.innerHTML =
                '<p style="margin:0 0 6px;font-size:0.9rem;color:var(--color-text);font-weight:600;">' +
                esc(mockSocial.jugador_semana.nombre) +
                "</p>" +
                "<p style=\"margin:0;font-size:0.82rem;color:var(--color-text-muted);\">" +
                esc(mockSocial.jugador_semana.nota) +
                "</p>";
        }
        var tvEl = document.getElementById("social-duelo-tv");
        if (tvEl) {
            var d = mockSocial.duelo_tv;
            tvEl.innerHTML =
                "<p style=\"margin:0 0 4px;font-size:0.9rem;color:var(--color-text);font-weight:600;\">" +
                esc(d.titulo) +
                "</p>" +
                "<p style=\"margin:0;font-size:0.82rem;color:var(--color-text-muted);\">" +
                esc(d.fecha) +
                " · " +
                esc(d.mesa) +
                "</p>";
        }
    }

    /**
     * NOTA: conectar visibilidad con getRole() de auth-manager.js cuando se cargue en esta página.
     * Ejemplo: if (typeof getRole === 'function') { ... document.body.classList.add('dc-hide-role-club'); }
     */
    function applyRoleVisibility() {
        /* MOCK: mostrar las tres cards; producción puede ocultar según rol */
    }

    function initReveal() {
        document.querySelectorAll(".dc-section").forEach(function (n) {
            if (!n.classList.contains("hero-dashboard")) {
                n.setAttribute("data-dc-reveal", "");
            }
        });
        var nodes = document.querySelectorAll("[data-dc-reveal]");
        if (!("IntersectionObserver" in window)) {
            nodes.forEach(function (n) {
                n.classList.add("is-revealed");
            });
            return;
        }
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add("is-revealed");
                        io.unobserve(e.target);
                    }
                });
            },
            { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
        );
        nodes.forEach(function (n) {
            io.observe(n);
        });
    }

    function onReady() {
        applyHeaderSession();
        applyHero();
        renderStats(document.getElementById("quick-stats-grid"));
        renderTorneos(document.getElementById("events-strip"));
        renderSocial();
        applyRoleVisibility();
        initReveal();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }
})();
