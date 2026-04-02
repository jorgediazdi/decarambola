/**
 * DeCarambola — Home v2
 * Datos reales desde Supabase — sin mocks.
 */
(function () {
    "use strict";

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

    function esc(s) {
        var d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
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

    function renderStats(container, user) {
        if (!container) return;
        var stats = [
            { icon: "◎", value: user.promedio.toFixed(2), label: "Promedio", href: "ranking.html", seed: 0 },
            { icon: "◇", value: "#" + user.ranking, label: "Ranking", href: "ranking.html", seed: 1 },
            { icon: "⚡", value: String(user.duelos_semana), label: "Duelos esta semana", href: "apps/club/sala/mesas.html", seed: 2 },
            { icon: "✦", value: String(user.torneos_activos), label: "Torneos activos", href: "apps/organizador/organizador.html", seed: 3 }
        ];
        var html = "";
        stats.forEach(function (s) {
            html += '<a class="stat-card" href="' + s.href + '">' +
                '<span class="stat-card__chevron" aria-hidden="true">›</span>' +
                '<div class="stat-card__icon" aria-hidden="true">' + s.icon + "</div>" +
                '<div class="stat-card__value">' + s.value + "</div>" +
                '<div class="stat-card__label">' + s.label + "</div>" +
                '<div class="stat-card__spark">' + sparkBars(s.seed) + "</div>" +
                "</a>";
        });
        container.innerHTML = html;
    }

    function cuposBarClass(disponibles, total) {
        if (!total) return "event-card__progress-bar--gold";
        var ratio = disponibles / total;
        return ratio < 0.2 ? "event-card__progress-bar--urgent" : "event-card__progress-bar--gold";
    }

    function renderTorneos(container, torneos, inscritosIds) {
        if (!container) return;
        if (!torneos || !torneos.length) {
            container.innerHTML = '<p style="color:#666;font-size:0.8rem;padding:12px 0;">No hay torneos próximos.</p>';
            return;
        }
        var html = "";
        torneos.forEach(function (t) {
            var d = daysUntil(t.fecha_limite || t.fecha_inicio);
            var cerrado = t.estado === "CERRADO" || t.estado === "cerrado" || t.cupos_disponibles <= 0;
            var inscrito = inscritosIds && inscritosIds.indexOf(t.id) !== -1;
            var urgency = d != null && d >= 0
                ? "Cierra en <strong>" + d + "</strong> días · <strong>" + (t.cupos_disponibles || 0) + "</strong> cupos"
                : "Inscripciones · <strong>" + (t.cupos_disponibles || 0) + "</strong> cupos";
            var cuposTotal = t.cupo_maximo || 0;
            var cuposDisp = t.cupos_disponibles || 0;
            var pct = cuposTotal ? Math.round((cuposDisp / cuposTotal) * 100) : 0;
            var barCls = cuposBarClass(cuposDisp, cuposTotal);
            var btnPrimary = "";
            if (cerrado) {
                btnPrimary = '<span class="btn-event btn-event--muted" role="status">Cerrado</span>';
            } else if (inscrito) {
                btnPrimary = '<span class="btn-event btn-event--success" role="status">Ya inscrito ✓</span>';
            } else {
                btnPrimary = '<a class="btn-event btn-event--primary" href="apps/organizador/organizador.html">Inscribirme</a>';
            }
            html += '<article class="event-card" data-torneo-id="' + esc(t.id) + '">' +
                '<h3 class="event-card__name">' + esc(t.nombre || 'Sin nombre') + "</h3>" +
                '<div class="event-card__stage">' + esc(t.estado || '') + "</div>" +
                '<p class="event-card__urgency">' + urgency + "</p>" +
                '<div class="event-card__row">Límite: ' + esc(formatDateEs(t.fecha_inicio)) + "</div>" +
                '<div class="event-card__progress"><div class="event-card__progress-bar ' +
                barCls + '" style="width:' + pct + '%"></div></div>' +
                '<div class="event-card__actions">' + btnPrimary +
                '<a class="btn-event btn-event--ghost" href="apps/organizador/organizador.html">Ver torneo</a>' +
                "</div></article>";
        });
        container.innerHTML = html;
    }

    function renderSocial(data) {
        var rankEl = document.getElementById("social-ranking");
        if (rankEl) {
            if (data.ranking && data.ranking.length) {
                var h = "";
                data.ranking.forEach(function (r) {
                    h += '<div class="social-block__row">' +
                        '<span class="social-block__name">' + esc(r.nombre) + '</span>' +
                        '<span class="social-block__val">' + (r.promedio || 0).toFixed(2) + "</span></div>";
                });
                rankEl.innerHTML = h;
            } else {
                rankEl.innerHTML = '<p style="color:#666;font-size:0.8rem;">Sin datos de ranking.</p>';
            }
        }
        var clubsEl = document.getElementById("social-clubes");
        if (clubsEl) {
            if (data.clubes && data.clubes.length) {
                clubsEl.innerHTML =
                    '<p style="margin:0 0 8px;font-size:0.9rem;color:var(--color-text);">' +
                    data.clubes.length + " clubes activos</p>" +
                    '<p style="margin:0;font-size:0.82rem;color:var(--color-text-muted);">' +
                    esc(data.clubes.map(function(c){ return c.nombre; }).join(" · ")) + "</p>";
            } else {
                clubsEl.innerHTML = '<p style="color:#666;font-size:0.8rem;">Sin clubes activos.</p>';
            }
        }
        var featEl = document.getElementById("social-featured");
        if (featEl) {
            if (data.jugador_semana) {
                featEl.innerHTML =
                    '<p style="margin:0 0 6px;font-size:0.9rem;color:var(--color-text);font-weight:600;">' +
                    esc(data.jugador_semana.nombre) + "</p>" +
                    '<p style="margin:0;font-size:0.82rem;color:var(--color-text-muted);">Mejor promedio esta semana</p>';
            } else {
                featEl.innerHTML = '<p style="color:#666;font-size:0.8rem;">Sin destacados.</p>';
            }
        }
        var tvEl = document.getElementById("social-duelo-tv");
        if (tvEl) {
            tvEl.innerHTML = '<p style="color:#666;font-size:0.8rem;">Próximamente.</p>';
        }
    }

    function applyHeader(hasSession, user) {
        var header = document.getElementById("home-header");
        if (!header) return;
        header.classList.toggle("home-header--user", hasSession);
        header.classList.toggle("home-header--guest", !hasSession);
        // Corregir enlace Ingresar → /login.html
        var btnIngresar = header.querySelector('.btn-ingresar-header');
        if (btnIngresar) btnIngresar.href = '/login.html';
        if (hasSession && user) {
            var av = document.getElementById("user-avatar-initials");
            var nm = document.getElementById("user-name");
            var bd = document.getElementById("user-badge");
            if (av) av.textContent = initials(user.nombre);
            if (nm) nm.textContent = user.nombre || 'Usuario';
            if (bd) bd.textContent = user.promedio > 0
                ? "Promedio " + user.promedio.toFixed(2)
                : "DeCarambola";
        }
    }

    function applyHero(hasSession, user, ultimaPartida) {
        var greet = document.getElementById("hero-greeting");
        var mot = document.getElementById("hero-motivation");
        var cap = document.getElementById("hero-ring-caption");
        var recent = document.getElementById("hero-recent-session");
        var pctEl = document.getElementById("hero-ring-pct");
        var heroDash = document.getElementById("hero-dashboard");

        var displayName = hasSession && user ? (user.nombre || 'Usuario') : 'invitado';
        if (greet) greet.textContent = "Bienvenido, " + displayName;
        if (mot) mot.textContent = user && user.promedio > 0
            ? "Promedio en estas partidas: " + user.promedio.toFixed(2)
            : "Bienvenido a DeCarambola";

        var jugadas = user ? user.partidas_semana : 0;
        var meta = 5;
        if (cap) cap.textContent = "Jugaste " + jugadas + " partidas esta semana";
        if (heroDash && meta) {
            var p = Math.min(1, jugadas / meta);
            heroDash.style.setProperty("--ring-pct", String(p));
        }
        if (pctEl) {
            pctEl.textContent = Math.round((jugadas / meta) * 100) + "%";
        }
        if (recent && ultimaPartida) {
            recent.innerHTML = "Última partida: <strong>" +
                esc(ultimaPartida.rival || '—') + "</strong> · " +
                esc(formatDateEs(ultimaPartida.fecha));
        } else if (recent) {
            recent.textContent = '';
        }
    }

    function initReveal() {
        document.querySelectorAll(".dc-section").forEach(function (n) {
            if (!n.classList.contains("hero-dashboard")) {
                n.setAttribute("data-dc-reveal", "");
            }
        });
        var nodes = document.querySelectorAll("[data-dc-reveal]");
        if (!("IntersectionObserver" in window)) {
            nodes.forEach(function (n) { n.classList.add("is-revealed"); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add("is-revealed");
                    io.unobserve(e.target);
                }
            });
        }, { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
        nodes.forEach(function (n) { io.observe(n); });
    }

    async function loadRealData() {
        var supabaseMod = await import('/js/supabase-client.js');
        var supabase = supabaseMod.supabase;

        // Sesión
        var sessR = await supabase.auth.getSession();
        var session = sessR.data && sessR.data.session ? sessR.data.session : null;
        var uid = session && session.user ? session.user.id : null;

        // Defaults
        var user = { nombre: '', promedio: 0, ranking: '—', duelos_semana: 0, torneos_activos: 0, partidas_semana: 0 };
        var ultimaPartida = null;
        var inscritosIds = [];

        if (uid) {
            // Perfil
            var prR = await supabase.from('profiles').select('nombre_completo').eq('id', uid).maybeSingle();
            if (prR.data && prR.data.nombre_completo) user.nombre = prR.data.nombre_completo;
            else if (session.user.email) user.nombre = session.user.email.split('@')[0];

            // Partidas de la semana
            var hace7 = new Date();
            hace7.setDate(hace7.getDate() - 7);
            var partR = await supabase.from('partidas')
                .select('id, jugador1_id, jugador2_id, promedio_j1, promedio_j2, ganador_id, created_at')
                .or('jugador1_id.eq.' + uid + ',jugador2_id.eq.' + uid)
                .gte('created_at', hace7.toISOString())
                .order('created_at', { ascending: false });

            if (partR.data && !partR.error) {
                user.partidas_semana = partR.data.length;
                // Promedio propio
                var sumProm = 0; var cntProm = 0;
                partR.data.forEach(function(p) {
                    var esJ1 = p.jugador1_id === uid;
                    var prom = esJ1 ? p.promedio_j1 : p.promedio_j2;
                    if (prom != null && parseFloat(prom) > 0) {
                        sumProm += parseFloat(prom);
                        cntProm++;
                    }
                });
                if (cntProm > 0) user.promedio = sumProm / cntProm;
                user.duelos_semana = partR.data.length;
                // Última partida
                if (partR.data[0]) {
                    var ult = partR.data[0];
                    ultimaPartida = {
                        rival: ult.jugador1_id === uid ? ult.jugador2_id : ult.jugador1_id,
                        fecha: ult.created_at
                    };
                    // Buscar nombre del rival
                    var rivalId = ultimaPartida.rival;
                    if (rivalId) {
                        var rivalR = await supabase.from('profiles')
                            .select('nombre_completo')
                            .eq('id', rivalId)
                            .maybeSingle();
                        if (rivalR.data && rivalR.data.nombre_completo) {
                            ultimaPartida.rival = rivalR.data.nombre_completo;
                        }
                    }
                }
            }

            // Torneos activos del jugador
            var insR = await supabase.from('inscripciones')
                .select('torneo_id')
                .eq('jugador_id', uid)
                .eq('estado', 'ACTIVO');
            if (insR.data && !insR.error) {
                inscritosIds = insR.data.map(function(i){ return i.torneo_id; });
                user.torneos_activos = inscritosIds.length;
            }

            // Ranking aproximado — jugadores con promedio mayor
            var rankR = await supabase.from('partidas')
                .select('jugador1_id, jugador2_id, promedio_j1, promedio_j2')
                .gte('created_at', hace7.toISOString());
            if (rankR.data && !rankR.error && user.promedio > 0) {
                var promediosPorJugador = {};
                rankR.data.forEach(function(p) {
                    if (p.jugador1_id && p.promedio_j1 > 0) {
                        if (!promediosPorJugador[p.jugador1_id]) promediosPorJugador[p.jugador1_id] = [];
                        promediosPorJugador[p.jugador1_id].push(parseFloat(p.promedio_j1));
                    }
                    if (p.jugador2_id && p.promedio_j2 > 0) {
                        if (!promediosPorJugador[p.jugador2_id]) promediosPorJugador[p.jugador2_id] = [];
                        promediosPorJugador[p.jugador2_id].push(parseFloat(p.promedio_j2));
                    }
                });
                var mejores = Object.keys(promediosPorJugador).map(function(id) {
                    var arr = promediosPorJugador[id];
                    return { id: id, avg: arr.reduce(function(a,b){return a+b;},0) / arr.length };
                }).sort(function(a,b){ return b.avg - a.avg; });
                var pos = mejores.findIndex(function(x){ return x.id === uid; });
                user.ranking = pos >= 0 ? pos + 1 : '—';
            }
        }

        // Torneos públicos
        var torR = await supabase.from('torneos')
            .select('id, nombre, estado, fecha_inicio, fecha_limite, cupo_maximo, cupos_disponibles')
            .in('estado', ['ABIERTO', 'EN_CURSO'])
            .order('fecha_inicio', { ascending: true })
            .limit(5);
        var torneos = torR.data && !torR.error ? torR.data : [];

        // Top ranking social
        var topR = await supabase.from('partidas')
            .select('jugador1_id, jugador2_id, promedio_j1, promedio_j2')
            .order('created_at', { ascending: false })
            .limit(100);
        var socialRanking = [];
        if (topR.data && !topR.error) {
            var pm = {};
            topR.data.forEach(function(p) {
                if (p.jugador1_id && p.promedio_j1 > 0) {
                    if (!pm[p.jugador1_id]) pm[p.jugador1_id] = [];
                    pm[p.jugador1_id].push(parseFloat(p.promedio_j1));
                }
                if (p.jugador2_id && p.promedio_j2 > 0) {
                    if (!pm[p.jugador2_id]) pm[p.jugador2_id] = [];
                    pm[p.jugador2_id].push(parseFloat(p.promedio_j2));
                }
            });
            var sorted = Object.keys(pm).map(function(id) {
                var arr = pm[id];
                return { id: id, avg: arr.reduce(function(a,b){return a+b;},0)/arr.length };
            }).sort(function(a,b){ return b.avg - a.avg; }).slice(0, 3);

            if (sorted.length) {
                var ids3 = sorted.map(function(x){ return x.id; });
                var nom3R = await supabase.from('profiles')
                    .select('id, nombre_completo')
                    .in('id', ids3);
                var nomMap = {};
                if (nom3R.data) nom3R.data.forEach(function(p){ nomMap[p.id] = p.nombre_completo || '—'; });
                socialRanking = sorted.map(function(x){
                    return { nombre: nomMap[x.id] || '—', promedio: x.avg };
                });
            }
        }

        // Clubes activos
        var clubR = await supabase.from('clubs')
            .select('nombre')
            .eq('activo', true)
            .limit(6);
        var clubes = clubR.data && !clubR.error ? clubR.data : [];

        // Jugador de la semana
        var jugadorSemana = socialRanking.length ? { nombre: socialRanking[0].nombre } : null;

        return {
            hasSession: !!uid,
            user: user,
            torneos: torneos,
            inscritosIds: inscritosIds,
            ultimaPartida: ultimaPartida,
            social: {
                ranking: socialRanking,
                clubes: clubes,
                jugador_semana: jugadorSemana
            }
        };
    }

    async function onReady() {
        initReveal();
        try {
            var data = await loadRealData();
            applyHeader(data.hasSession, data.user);
            applyHero(data.hasSession, data.user, data.ultimaPartida);
            renderStats(document.getElementById("quick-stats-grid"), data.user);
            renderTorneos(document.getElementById("events-strip"), data.torneos, data.inscritosIds);
            renderSocial(data.social);
        } catch(err) {
            console.warn('[index-v2] error cargando datos:', err);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }
})();
