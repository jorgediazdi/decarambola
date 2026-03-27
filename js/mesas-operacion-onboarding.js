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

    /**
     * @returns {Promise<{ ok: boolean, faltan: string[], mensaje: string }>}
     */
    window.DC_mesasOperacionCheckOnboarding = async function () {
        var faltan = [];
        var perfil = {};
        try {
            perfil = JSON.parse(localStorage.getItem("mi_perfil") || "{}");
        } catch (e) {}
        var cid = perfil.club_id ? String(perfil.club_id).trim() : "";
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

            var candidates = buildClubIdCandidates(cid, cq);
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
                faltan.push("Paso 4: al menos una tarifa > 0 (hora, media, mañana, noche o fin de semana)");
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

    window.DC_mesasOperacionMostrarGate = function (opts) {
        opts = opts || {};
        var texto = opts.mensaje || "Completa la configuración del salón.";
        var id = "dc-mesas-onboarding-gate";
        var prev = document.getElementById(id);
        if (prev) prev.remove();
        var el = document.createElement("div");
        el.id = id;
        el.setAttribute("role", "alertdialog");
        el.setAttribute("aria-modal", "true");
        el.style.cssText =
            "position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;";
        el.innerHTML =
            '<div style="max-width:420px;background:linear-gradient(165deg,#1a1200,#0c0a06);border:1px solid rgba(212,175,55,0.45);border-radius:18px;padding:22px 22px 18px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">' +
            '<p style="color:#d4af37;font-size:0.72rem;letter-spacing:0.12em;margin:0 0 12px;">CONFIGURACIÓN INCOMPLETA</p>' +
            '<p style="color:#bbb;font-size:0.82rem;line-height:1.55;margin:0 0 18px;white-space:pre-wrap;text-align:left;">' +
            texto.replace(/</g, "&lt;") +
            "</p>" +
            '<a href="' +
            (opts.hrefConfig || "mesas_config.html") +
            '" style="display:inline-block;padding:12px 20px;background:linear-gradient(135deg,#d4af37,#a07800);color:#000;text-decoration:none;border-radius:12px;font-size:0.78rem;font-weight:700;letter-spacing:0.06em;">Ir a configurar instalaciones</a>' +
            '<a href="' +
            (opts.hrefTarifas || "tarifas_salon.html") +
            '" style="display:inline-block;margin-top:10px;padding:10px 18px;border:1px solid rgba(212,175,55,0.45);color:#d4af37;text-decoration:none;border-radius:12px;font-size:0.72rem;font-weight:600;letter-spacing:0.04em;">Paso 4: tarifas del salón</a>' +
            '<p style="margin-top:12px;font-size:0.68rem;color:#888;line-height:1.45;">Podés ver el <strong style="color:#d4af37">preview del plano</strong> en <strong style="color:#aaa">Configurar instalaciones</strong> aunque el salón siga bloqueado. En <strong style="color:#d4af37">Salón en vivo</strong> el mapa completo abre cuando paso 3 y 4 estén OK (mesas en Supabase + al menos una tarifa base &gt; 0).</p>' +
            '<p style="margin-top:10px;font-size:0.68rem;color:#666;">Si ya guardaste tarifas y sigue este aviso: revisá que haya <strong style="color:#aaa">al menos un valor &gt; 0</strong> en hora/media/mañana/noche/finde, y que en Supabase existan filas en <code style="color:#888;">mesas</code> para tu club.</p>' +
            '<p style="margin-top:14px;font-size:0.68rem;color:#666;">Validación en Supabase (clubs, mesas_config, mesas). Migración 011: flags en <code style="color:#888;">clubs</code>.</p>' +
            "</div>";
        document.body.appendChild(el);
    };
})();
