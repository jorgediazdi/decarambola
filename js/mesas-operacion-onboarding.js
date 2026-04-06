/**
 * Gate de operación Salón en vivo — fuente de verdad: Supabase (clubs + mesas_config + mesas).
 * Pasos 3–4 ya no dependen de localStorage.
 */
(function () {
    function isUuid(s) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || "").trim());
    }

    function tarifasTienenValor(t) {
        if (!t || typeof t !== "object") return false;
        if ((parseFloat(t.tarifa_base) || 0) > 0) return true;
        var nums = ["hora", "media", "manana", "tarde", "noche", "finde"];
        for (var i = 0; i < nums.length; i++) {
            if ((parseFloat(t[nums[i]]) || 0) > 0) return true;
        }
        return false;
    }

    /** UUID o codigo del perfil pueden no coincidir con mesas_config.club_id / mesas.club_id (migración 005). */
    function buildClubIdCandidates(cid, cq) {
        var out = [];
        if (cid) out.push(String(cid).trim());
        if (cq && !cq.error && cq.data) {
            if (cq.data.codigo) out.push(String(cq.data.codigo).trim());
            if (cq.data.id) out.push(String(cq.data.id).trim());
        }
        var seen = {};
        var res = [];
        for (var i = 0; i < out.length; i++) {
            var k = out[i];
            if (k && !seen[k]) {
                seen[k] = true;
                res.push(k);
            }
        }
        return res;
    }

    /** Misma lógica que getClubId() en apps/club/sala/mesas.html (mi_perfil → club_activo.id). */
    function getClubIdFromLocalStorage() {
        try {
            var perfil = JSON.parse(localStorage.getItem("mi_perfil") || "{}");
            if (perfil.club_id) return String(perfil.club_id).trim();
            var clubActivo = JSON.parse(localStorage.getItem("club_activo") || "null");
            return clubActivo && clubActivo.id ? String(clubActivo.id).trim() : "";
        } catch (e) {
            return "";
        }
    }

    /**
     * @returns {Promise<{ ok: boolean, faltan: string[], mensaje: string }>}
     */
    window.DC_mesasOperacionCheckOnboarding = async function () {
        try {
            var authMod = await import("./auth-manager.js");
            var roleR = await authMod.getRole();
            if (!roleR.error && roleR.data === "superadmin") {
                return { ok: true, faltan: [], mensaje: "" };
            }
        } catch (_eRole) {}

        var faltan = [];
        var cid = getClubIdFromLocalStorage();
        if (!cid) {
            try {
                var modFb = await import("./supabase-client.js");
                var sessWrap = await modFb.supabase.auth.getSession();
                var session = sessWrap && sessWrap.data && sessWrap.data.session;
                if (session && session.user) {
                    var pr = await modFb.supabase
                        .from("profiles")
                        .select("club_id")
                        .eq("id", session.user.id)
                        .maybeSingle();
                    if (pr.data && pr.data.club_id != null && String(pr.data.club_id).trim()) {
                        cid = String(pr.data.club_id).trim();
                        localStorage.setItem('club_activo', JSON.stringify({ id: cid }));
                    }
                }
            } catch (eFb) {
                if (typeof console !== "undefined" && console.warn) console.warn("[mesas-operacion-onboarding] club_id profiles:", eFb);
            }
        }
        if (!cid) {
            faltan.push("Club en el perfil (elegí tu club en la app o iniciá sesión)");
            return {
                ok: false,
                faltan: faltan,
                mensaje: "Completá el onboarding antes de operar el salón:\n\n• " + faltan.join("\n• "),
            };
        }

        try {
            var mod = await import("./supabase-client.js");
            var supabase = mod.supabase;

            var preCand = [];
            try {
                var Rm = await import("./resolve-club-id.js");
                var ru = await Rm.resolveClubId(cid);
                if (ru && !ru.error) {
                    if (ru.uuid) preCand.push(ru.uuid);
                    if (ru.codigo) preCand.push(ru.codigo);
                }
            } catch (_res) {}

            function mergeClubCandidates(pre, base) {
                var seen = {};
                var out = [];
                function add(k) {
                    var x = k != null ? String(k).trim() : "";
                    if (!x || seen[x]) return;
                    seen[x] = true;
                    out.push(x);
                }
                var i;
                for (i = 0; i < pre.length; i++) add(pre[i]);
                for (i = 0; i < base.length; i++) add(base[i]);
                return out;
            }

            var col = isUuid(cid) ? "id" : "codigo";
            var cq = await supabase
                .from("clubs")
                .select("id, codigo, setup_salon_ok, setup_tarifas_ok")
                .eq(col, cid)
                .maybeSingle();

            var salonOk = false;
            var tarifasOk = false;

            if (!cq.error && cq.data) {
                salonOk = cq.data.setup_salon_ok === true;
                tarifasOk = cq.data.setup_tarifas_ok === true;
            }

            var candidates = mergeClubCandidates(preCand, buildClubIdCandidates(cid, cq));
            if (candidates.length === 0) candidates = [cid];

            /* Fallback si los flags aún no existen en BD o están en false: derivar de mesas_config + mesas */
            var mq = { data: null, error: null };
            var ci;
            for (ci = 0; ci < candidates.length; ci++) {
                mq = await supabase
                    .from("mesas_config")
                    .select("id, tarifas")
                    .eq("club_id", candidates[ci])
                    .order("updated_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (!mq.error && mq.data) break;
            }

            var hasConfig = !mq.error && !!mq.data;
            var tjson = hasConfig && mq.data.tarifas ? mq.data.tarifas : {};
            var derivedTarifas = tarifasTienenValor(tjson);

            var countQ = await supabase
                .from("mesas")
                .select("*", { count: "exact", head: true })
                .in("club_id", candidates);
            var nMesas = typeof countQ.count === "number" ? countQ.count : 0;
            var derivedSalon = hasConfig && nMesas > 0;

            if (!salonOk && !derivedSalon) {
                faltan.push(
                    "Paso 3: configuración de salón y mesas en Supabase (guardá en Configurar instalaciones hasta el final)"
                );
            }
            if (!tarifasOk && !derivedTarifas) {
                faltan.push("Paso 4: tarifa por hora > 0 (o tarifa legada en mesas_config.tarifas)");
            }

            /* Coherencia extra: si hay config local pero 0 mesas visibles */
            if ((salonOk || derivedSalon) && nMesas === 0) {
                faltan.push("No hay mesas en Supabase para este club (revisá club_id o RLS en tabla mesas)");
            }
        } catch (e) {
            if (typeof console !== "undefined" && console.warn) console.warn("[mesas-operacion-onboarding]", e);
            faltan.push("No se pudo validar con Supabase (red o claves). Reintentá o revisá consola.");
        }

        var ok = faltan.length === 0;
        var mensaje = ok ? "" : "Completá el onboarding antes de operar el salón:\n\n• " + faltan.join("\n• ");
        return { ok: ok, faltan: faltan, mensaje: mensaje };
    };

    function escapeMesasGateHtml(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function ensureMesasGateStyles() {
        if (document.getElementById("dc-mesas-gate-ui-css")) return;
        var st = document.createElement("style");
        st.id = "dc-mesas-gate-ui-css";
        st.textContent =
            "#dc-mesas-onboarding-gate.dc-mesas-gate-root{" +
            "position:fixed;inset:0;z-index:200;" +
            "background:rgba(10,10,10,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
            "display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;" +
            "font-family:var(--dc-font-body,'DM Sans',system-ui,sans-serif);" +
            "}" +
            ".dc-mesas-gate-board{" +
            "width:100%;max-width:min(520px,100%);" +
            "background:var(--dc-surface,#111111);" +
            "border:1px solid var(--dc-border,rgba(201,168,76,0.12));" +
            "border-radius:14px;overflow:hidden;" +
            "box-shadow:0 24px 64px rgba(0,0,0,0.5),inset 0 0 0 1px var(--dc-gold-glow2,rgba(201,168,76,0.06));" +
            "}" +
            ".dc-mesas-gate-title{margin:0;padding:18px 20px 16px;font-weight:700;" +
            "font-family:var(--dc-font-display,'Playfair Display',Georgia,serif);" +
            "font-size:clamp(0.85rem,3.5vw,1.05rem);letter-spacing:0.1em;text-transform:uppercase;" +
            "text-align:center;line-height:1.35;border-bottom:1px solid var(--dc-border,rgba(201,168,76,0.12));" +
            "}" +
            ".dc-mesas-gate-title--warn{" +
            "color:var(--dc-gold-light,#e8c97a);background:var(--dc-gold-glow,rgba(201,168,76,0.12));" +
            "}" +
            ".dc-mesas-gate-title--error{" +
            "color:#e8a0a0;background:rgba(231,76,60,0.08);border-bottom-color:rgba(231,76,60,0.2);" +
            "}" +
            ".dc-mesas-gate-body{margin:0;padding:20px 22px;background:var(--dc-surface,#111111);" +
            "color:var(--dc-text,#f0f0f0);font-size:0.84rem;line-height:1.58;white-space:pre-wrap;text-align:left;" +
            "border-bottom:1px solid var(--dc-border,rgba(201,168,76,0.12));" +
            "}" +
            ".dc-mesas-gate-foot{margin:0;padding:12px 18px;background:var(--dc-surface2,#1a1a1a);" +
            "color:var(--dc-text-muted,#888);font-size:0.55rem;letter-spacing:0.1em;text-transform:uppercase;" +
            "text-align:center;line-height:1.45;border-bottom:1px solid var(--dc-border,rgba(201,168,76,0.1));" +
            "}" +
            ".dc-mesas-gate-badges{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;" +
            "padding:16px 18px;background:var(--dc-bg,#0a0a0a);" +
            "}" +
            ".dc-mesas-gate-badge{display:inline-flex;align-items:center;justify-content:center;" +
            "padding:12px 16px;min-height:44px;font-size:0.55rem;font-weight:600;letter-spacing:0.12em;" +
            "text-transform:uppercase;text-decoration:none;border-radius:14px;border:1px solid;cursor:pointer;" +
            "font-family:var(--dc-font-body,'DM Sans',system-ui,sans-serif);box-sizing:border-box;" +
            "transition:border-color 0.2s,color 0.2s,background 0.2s;" +
            "}" +
            ".dc-mesas-gate-badge:focus-visible{outline:2px solid var(--dc-gold,#c9a84c);outline-offset:2px;}" +
            ".dc-mesas-gate-badge--primary{" +
            "background:rgba(201,168,76,0.12);color:var(--dc-gold-light,#e8c97a);" +
            "border-color:rgba(201,168,76,0.35);" +
            "}" +
            ".dc-mesas-gate-badge--primary:hover,.dc-mesas-gate-badge--primary:focus-visible{" +
            "background:rgba(201,168,76,0.18);border-color:var(--dc-gold,#c9a84c);color:var(--dc-gold,#c9a84c);" +
            "}" +
            ".dc-mesas-gate-badge--secondary{" +
            "background:var(--dc-surface2,#1a1a1a);color:var(--dc-text-muted,#888);" +
            "border-color:var(--dc-border,rgba(201,168,76,0.12));" +
            "}" +
            ".dc-mesas-gate-badge--secondary:hover,.dc-mesas-gate-badge--secondary:focus-visible{" +
            "border-color:var(--dc-border-hover,rgba(201,168,76,0.3));color:var(--dc-text,#f0f0f0);" +
            "}" +
            ".dc-mesas-gate-badge--retry{" +
            "background:rgba(46,204,113,0.1);color:#4caf7d;border-color:rgba(46,204,113,0.35);" +
            "}" +
            ".dc-mesas-gate-badge--retry:hover,.dc-mesas-gate-badge--retry:focus-visible{" +
            "border-color:#4caf7d;color:#6fcf97;" +
            "}";
        document.head.appendChild(st);
    }

    window.DC_mesasOperacionMostrarGate = function (opts) {
        opts = opts || {};
        var texto = opts.mensaje || "Completa la configuración del salón.";
        var tituloBanner = opts.tituloBanner || "CONFIGURACIÓN INCOMPLETA";
        var id = "dc-mesas-onboarding-gate";
        var prev = document.getElementById(id);
        if (prev) prev.remove();

        ensureMesasGateStyles();

        var esValidacionFallida = /NO SE PUDO VALIDAR/i.test(String(tituloBanner));
        var titleMod = esValidacionFallida ? "dc-mesas-gate-title--error" : "dc-mesas-gate-title--warn";

        var hrefCfg = escapeMesasGateHtml(opts.hrefConfig || "mesas_config.html");
        var hrefTar = escapeMesasGateHtml(opts.hrefTarifas || "tarifas_salon.html");

        var el = document.createElement("div");
        el.id = id;
        el.className = "dc-mesas-gate-root";
        el.setAttribute("role", "alertdialog");
        el.setAttribute("aria-modal", "true");
        el.setAttribute("aria-labelledby", "dc-mesas-gate-title-txt");

        el.innerHTML =
            '<div class="dc-mesas-gate-board">' +
            '<p id="dc-mesas-gate-title-txt" class="dc-mesas-gate-title ' +
            titleMod +
            '">' +
            escapeMesasGateHtml(tituloBanner) +
            "</p>" +
            '<p class="dc-mesas-gate-body">' +
            escapeMesasGateHtml(texto) +
            "</p>" +
            '<p class="dc-mesas-gate-foot">Validación Supabase · clubs / mesas_config / mesas · RLS aplica en servidor</p>' +
            '<div class="dc-mesas-gate-badges">' +
            '<button type="button" class="dc-mesas-gate-badge dc-mesas-gate-badge--retry" id="dc-mesas-gate-btn-retry">REINTENTAR</button>' +
            '<a class="dc-mesas-gate-badge dc-mesas-gate-badge--primary" href="' +
            hrefCfg +
            '">CONFIGURAR SALÓN</a>' +
            '<a class="dc-mesas-gate-badge dc-mesas-gate-badge--secondary" href="' +
            hrefTar +
            '">TARIFAS</a>' +
            "</div>" +
            "</div>";

        var btnRetry = el.querySelector("#dc-mesas-gate-btn-retry");
        if (btnRetry) {
            btnRetry.addEventListener("click", function () {
                try {
                    window.location.reload();
                } catch (e) {
                    window.location.href = window.location.pathname + window.location.search;
                }
            });
        }

        document.body.appendChild(el);
    };
})();
