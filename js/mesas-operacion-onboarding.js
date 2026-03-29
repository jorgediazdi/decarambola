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
            "position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.92);" +
            "display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;" +
            "font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;" +
            "}" +
            ".dc-mesas-gate-board{width:100%;max-width:min(560px,100%);border:4px solid #0a0a0a;" +
            "border-radius:2px;overflow:hidden;box-shadow:0 0 0 2px #2a2a2a,0 22px 56px rgba(0,0,0,0.85);" +
            "}" +
            ".dc-mesas-gate-stripes{" +
            "background:repeating-linear-gradient(180deg,#0c0c0c 0,#0c0c0c 7px,#141414 7px,#141414 14px);" +
            "}" +
            ".dc-mesas-gate-title{margin:0;padding:20px 18px 18px;font-weight:800;" +
            "font-size:clamp(0.62rem,3.2vw,0.88rem);letter-spacing:0.32em;text-transform:uppercase;" +
            "text-align:center;line-height:1.4;border-bottom:4px solid #000;" +
            "}" +
            ".dc-mesas-gate-title--error{color:#e74c3c;text-shadow:0 0 24px rgba(231,76,60,0.45);" +
            "background:linear-gradient(180deg,rgba(231,76,60,0.2) 0%,rgba(0,0,0,0.4) 100%);" +
            "}" +
            ".dc-mesas-gate-title--warn{color:#e67e22;text-shadow:0 0 24px rgba(230,126,34,0.4);" +
            "background:linear-gradient(180deg,rgba(230,126,34,0.18) 0%,rgba(0,0,0,0.4) 100%);" +
            "}" +
            ".dc-mesas-gate-body{margin:0;padding:20px 22px;background:#050505;color:#fff;" +
            "font-size:0.84rem;line-height:1.58;white-space:pre-wrap;text-align:left;border-bottom:3px solid #1f1f1f;" +
            "}" +
            ".dc-mesas-gate-foot{margin:0;padding:12px 18px;background:#080808;color:#7f8c8d;" +
            "font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;text-align:center;line-height:1.45;" +
            "border-bottom:3px solid #1a1a1a;" +
            "}" +
            ".dc-mesas-gate-badges{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;" +
            "padding:18px 14px;" +
            "background:repeating-linear-gradient(180deg,#101010 0,#101010 5px,#0a0a0a 5px,#0a0a0a 10px);" +
            "}" +
            ".dc-mesas-gate-badge{display:inline-flex;align-items:center;justify-content:center;" +
            "padding:12px 18px;min-height:44px;font-size:0.58rem;font-weight:800;letter-spacing:0.2em;" +
            "text-transform:uppercase;text-decoration:none;border-radius:2px;border:2px solid;cursor:pointer;" +
            "font-family:inherit;box-sizing:border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,0.07);" +
            "transition:border-color 0.15s,color 0.15s,background 0.15s;" +
            "}" +
            ".dc-mesas-gate-badge:focus-visible{outline:2px solid #fff;outline-offset:2px;}" +
            ".dc-mesas-gate-badge--primary{background:linear-gradient(180deg,#252525 0%,#121212 100%);" +
            "color:#e67e22;border-color:#e67e22;}" +
            ".dc-mesas-gate-badge--primary:hover,.dc-mesas-gate-badge--primary:focus-visible{" +
            "background:linear-gradient(180deg,#2f2f2f 0%,#1a1a1a 100%);color:#f39c12;border-color:#f39c12;" +
            "}" +
            ".dc-mesas-gate-badge--secondary{background:linear-gradient(180deg,#1c1c1c 0%,#0e0e0e 100%);" +
            "color:#ecf0f1;border-color:#4a4a4a;}" +
            ".dc-mesas-gate-badge--secondary:hover,.dc-mesas-gate-badge--secondary:focus-visible{" +
            "border-color:#95a5a6;color:#fff;" +
            "}" +
            ".dc-mesas-gate-badge--retry{background:linear-gradient(180deg,#1a2e22 0%,#0d1810 100%);" +
            "color:#2ecc71;border-color:#27ae60;}" +
            ".dc-mesas-gate-badge--retry:hover,.dc-mesas-gate-badge--retry:focus-visible{" +
            "border-color:#2ecc71;color:#58d68d;" +
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
            '<div class="dc-mesas-gate-board dc-mesas-gate-stripes">' +
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
