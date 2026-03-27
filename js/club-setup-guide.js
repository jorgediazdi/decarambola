/**
 * Guía “Puesta en marcha” (.dc-setup-guide) — Portal club + MI CLUB.
 *
 * Rol: ORQUESTADOR (no crea filas en `mesas`). Paso 3 → enlace a mesas_config.html;
 * creación de mesas solo vía “Configurar instalaciones” + Supabase.
 *
 * Pasos 1–2: localStorage / perfil en dispositivo.
 * Pasos 3–4: Supabase (clubs + mesas_config + mesas; flags 011).
 * Pasos 5–6: lectura/escritura en Supabase (clubs.setup_cameras_ok, setup_tv_ok).
 * Seguridad: el cliente solo usa la anon key; RLS y permisos UPDATE/SELECT en `clubs` mandan en producción.
 * Eficiencia: un fetch a la vez (fetchInFlight), sin spam de updates (markMutationInFlight).
 *
 * Producción — 4 reglas:
 * (1) Solo clubsFilter() para .eq en SELECT y UPDATE sobre clubs.
 * (2) fetchInFlight + markMutationInFlight: sin peticiones solapadas; botones alineados.
 * (3) Pasos 5–6: estado solo en setupFromDb (Supabase). localStorage solo removeItem legacy.
 * (4) Tras UPDATE OK: setupFromDb actualizado + paint() inmediato.
 *
 * Celebración (canvas-confetti): una vez por dispositivo — localStorage `dc_onboarding_celebrated`
 * (solo UX; no es estado de pasos 5–6).
 *
 * Ver docs/AUDITORIA_TECNICA.md
 */
(function () {
    var LS_CELEBRATED = "dc_onboarding_celebrated";
    var SUCCESS_TITLE = "¡Increíble! Tu club está 100% configurado. 🚀";
    /** @type {{ s3Club: boolean, s4Club: boolean, s5: boolean, s6: boolean, loaded: boolean }} */
    var setupFromDb = { s3Club: false, s4Club: false, s5: false, s6: false, loaded: false };
    /** Misma cadena que el SELECT; UPDATE usa clubsFilter(resolvedClubKey) idéntico. */
    var resolvedClubKey = null;
    /** Promesa de fetch en curso: bloquea otro refresh y markStepInSupabase (salvo reentrada controlada). */
    var fetchInFlight = null;
    /** true mientras markStepInSupabase ejecuta (evita doble envío aunque fetchInFlight sea null). */
    var markMutationInFlight = false;

    function isUuid(key) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            String(key || "").trim()
        );
    }

    function getClubKeyFromPerfilSync() {
        try {
            var p = JSON.parse(localStorage.getItem("mi_perfil") || "{}");
            return String((p && p.club_id) || "").trim();
        } catch (e) {
            return "";
        }
    }

    async function getClubKeyForSetup() {
        var key = getClubKeyFromPerfilSync();
        if (key) return key;
        try {
            var mod = await import("./supabase-client.js");
            var supabase = mod.supabase;
            var sess = await supabase.auth.getSession();
            var user = sess && sess.data && sess.data.session && sess.data.session.user;
            if (!user) return "";
            var q = await supabase.from("profiles").select("club_id").eq("id", user.id).maybeSingle();
            if (q.data && q.data.club_id != null) return String(q.data.club_id).trim();
        } catch (e) {
            if (typeof console !== "undefined" && console.warn) console.warn("[club-setup-guide]", e);
        }
        return "";
    }

    async function getSupabase() {
        var mod = await import("./supabase-client.js");
        return mod.supabase;
    }

    /**
     * SELECT y UPDATE deben usar el mismo filtro: UUID → .eq('id'), si no → .eq('codigo').
     * Clave vacía → null (no llamar a Supabase con .eq vacío).
     */
    function clubsFilter(key) {
        var k = String(key == null ? "" : key).trim();
        if (!k) return null;
        return isUuid(k) ? { column: "id", value: k } : { column: "codigo", value: k };
    }

    /**
     * Migración: borra claves viejas dc_onboarding_* (no son fuente de verdad).
     * No lee ni escribe el estado de los pasos 5–6; eso es solo setupFromDb.
     */
    function removeLegacyOnboardingKeys() {
        try {
            localStorage.removeItem("dc_onboarding_step5_ok");
            localStorage.removeItem("dc_onboarding_step6_ok");
        } catch (e) {}
    }

    function tarifasTienenValor(t) {
        if (!t || typeof t !== "object") return false;
        var nums = ["hora", "media", "manana", "tarde", "noche", "finde"];
        for (var i = 0; i < nums.length; i++) {
            if ((parseFloat(t[nums[i]]) || 0) > 0) return true;
        }
        return false;
    }

    async function fetchSetupFlagsFromSupabase() {
        var key = await getClubKeyForSetup();
        resolvedClubKey = key || null;
        setupFromDb.loaded = false;
        setupFromDb.s3Club = false;
        setupFromDb.s4Club = false;
        updateMarkButtonsState();

        if (!key) {
            setupFromDb.s5 = false;
            setupFromDb.s6 = false;
            setupFromDb.loaded = true;
            updateMarkButtonsState();
            return;
        }

        var f = clubsFilter(key);
        if (!f) {
            setupFromDb.s5 = false;
            setupFromDb.s6 = false;
            setupFromDb.loaded = true;
            resolvedClubKey = null;
            updateMarkButtonsState();
            return;
        }

        try {
            var supabase = await getSupabase();
            var q = await supabase
                .from("clubs")
                .select("setup_cameras_ok, setup_tv_ok, setup_salon_ok, setup_tarifas_ok")
                .eq(f.column, f.value)
                .maybeSingle();
            if (q.error) {
                if (typeof console !== "undefined" && console.warn) console.warn("[club-setup-guide] clubs:", q.error.message);
                setupFromDb.s5 = false;
                setupFromDb.s6 = false;
                setupFromDb.s3Club = false;
                setupFromDb.s4Club = false;
            } else if (q.data) {
                setupFromDb.s5 = q.data.setup_cameras_ok === true;
                setupFromDb.s6 = q.data.setup_tv_ok === true;
                setupFromDb.s3Club = q.data.setup_salon_ok === true;
                setupFromDb.s4Club = q.data.setup_tarifas_ok === true;
            } else {
                setupFromDb.s5 = false;
                setupFromDb.s6 = false;
                setupFromDb.s3Club = false;
                setupFromDb.s4Club = false;
            }

            var mq = await supabase
                .from("mesas_config")
                .select("id, tarifas")
                .eq("club_id", key)
                .order("updated_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            var hasConfig = !mq.error && !!mq.data;
            var tjson = hasConfig && mq.data.tarifas ? mq.data.tarifas : {};
            var derivedTarifas = tarifasTienenValor(tjson);
            var countQ = await supabase.from("mesas").select("*", { count: "exact", head: true }).eq("club_id", key);
            var nMesas = typeof countQ.count === "number" ? countQ.count : 0;
            var derivedSalon = hasConfig && nMesas > 0;

            setupFromDb.s3Club = !!(setupFromDb.s3Club || derivedSalon);
            setupFromDb.s4Club = !!(setupFromDb.s4Club || derivedTarifas);
        } catch (e) {
            if (typeof console !== "undefined" && console.warn) console.warn("[club-setup-guide]", e);
            setupFromDb.s5 = false;
            setupFromDb.s6 = false;
            setupFromDb.s3Club = false;
            setupFromDb.s4Club = false;
        }
        setupFromDb.loaded = true;
        removeLegacyOnboardingKeys();
        updateMarkButtonsState();
    }

    function status() {
        var s1 = false,
            s2 = false,
            s3 = false,
            s4 = false,
            s5 = false,
            s6 = false;
        try {
            var p = JSON.parse(localStorage.getItem("mi_perfil") || "{}");
            s1 = !!(p && String(p.club_id || "").trim());
        } catch (e) {}
        var wn = (localStorage.getItem("wl_club_nombre") || "").trim();
        s2 = wn.length > 0 && wn.toUpperCase() !== "GLOBAL";
        s3 = setupFromDb.loaded && setupFromDb.s3Club;
        s4 = setupFromDb.loaded && setupFromDb.s4Club;
        s5 = setupFromDb.s5;
        s6 = setupFromDb.s6;
        return { s1: s1, s2: s2, s3: s3, s4: s4, s5: s5, s6: s6 };
    }

    /** true si los 6 pasos están listos (1–4 vía status(), 5–6 vía setupFromDb). */
    function checkAllStepsCompleted() {
        var u = status();
        return !!(u.s1 && u.s2 && u.s3 && u.s4 && u.s5 && u.s6);
    }

    /** Cañones desde ambos lados (canvas-confetti global). */
    function fireConfettiCannons() {
        if (typeof confetti !== "function") return;
        var colors = ["#d4af37", "#2eff70", "#ffffff", "#7fdfff"];
        var end = Date.now() + 2800;
        var burst = function () {
            confetti({
                particleCount: 4,
                angle: 62,
                spread: 58,
                origin: { x: 0, y: 0.62 },
                colors: colors,
                startVelocity: 48,
                gravity: 1.05,
                ticks: 280,
                scalar: 1.05,
            });
            confetti({
                particleCount: 4,
                angle: 118,
                spread: 58,
                origin: { x: 1, y: 0.62 },
                colors: colors,
                startVelocity: 48,
                gravity: 1.05,
                ticks: 280,
                scalar: 1.05,
            });
        };
        confetti({
            particleCount: 95,
            spread: 70,
            origin: { x: 0.08, y: 0.68 },
            colors: colors,
            startVelocity: 42,
        });
        confetti({
            particleCount: 95,
            spread: 70,
            origin: { x: 0.92, y: 0.68 },
            colors: colors,
            startVelocity: 42,
        });
        (function loop() {
            burst();
            if (Date.now() < end) requestAnimationFrame(loop);
        })();
    }

    /**
     * Confeti solo la primera vez que se completan los 6 pasos (con datos Supabase cargados).
     */
    function maybeCelebrateOnboardingComplete() {
        if (!setupFromDb.loaded) return;
        if (!checkAllStepsCompleted()) return;
        try {
            if (localStorage.getItem(LS_CELEBRATED) === "1") return;
        } catch (e) {
            return;
        }
        if (typeof confetti !== "function") return;
        fireConfettiCannons();
        try {
            localStorage.setItem(LS_CELEBRATED, "1");
        } catch (e2) {}
    }

    /** Título motivador + clase de éxito cuando todo está completo. */
    function applySuccessBanner(allDone) {
        document.querySelectorAll(".dc-setup-guide").forEach(function (box) {
            var title = box.querySelector(".dc-setup-guide__title");
            if (title) {
                if (!title.dataset.dcDefaultTitle) {
                    title.dataset.dcDefaultTitle = (title.textContent || "").trim() || "Puesta en marcha";
                }
                title.textContent = allDone ? SUCCESS_TITLE : title.dataset.dcDefaultTitle;
            }
            box.classList.toggle("dc-setup-guide--all-done", !!allDone);
        });
    }

    function setButtonsBusy(busy) {
        document.querySelectorAll(".dc-setup-guide__mark").forEach(function (btn) {
            btn.disabled = !!busy;
            btn.setAttribute("aria-busy", busy ? "true" : "false");
        });
    }

    function updateMarkButtonsState() {
        var loading =
            !setupFromDb.loaded || !!fetchInFlight || markMutationInFlight;
        var noClub = setupFromDb.loaded && !resolvedClubKey && !markMutationInFlight;
        document.querySelectorAll(".dc-setup-guide__mark").forEach(function (btn) {
            btn.dataset.dcSetupLoading = loading ? "1" : "0";
            if (loading) {
                btn.disabled = true;
                btn.setAttribute("aria-disabled", "true");
                btn.title = "Cargando estado del club…";
                return;
            }
            if (noClub) {
                btn.disabled = true;
                btn.setAttribute("aria-disabled", "true");
                btn.title = "Sin club en el perfil; elegí club o iniciá sesión.";
                return;
            }
            btn.disabled = false;
            btn.removeAttribute("aria-disabled");
            btn.removeAttribute("title");
        });
    }

    function paint() {
        var u = status();
        var done = [u.s1, u.s2, u.s3, u.s4, u.s5, u.s6].filter(Boolean).length;
        document.querySelectorAll(".dc-setup-guide").forEach(function (box) {
            var bar = box.querySelector(".dc-setup-guide__bar");
            if (bar) bar.setAttribute("aria-valuenow", String(done));
            var fill = box.querySelector(".dc-setup-guide__fill");
            if (fill) fill.style.width = (100 * done) / 6 + "%";
            var pct = box.querySelector(".dc-setup-guide__pct");
            if (pct) {
                pct.textContent =
                    done +
                    " de 6 pasos listos · 1–2 en este dispositivo; 3–6 según Supabase" +
                    (setupFromDb.loaded ? " (club)" : "");
            }
            for (var i = 1; i <= 6; i++) {
                var li = box.querySelector("li[data-step='" + i + "']");
                if (li) li.classList.toggle("dc-setup-guide--done", u["s" + i]);
            }
        });
        var allDone = setupFromDb.loaded && checkAllStepsCompleted();
        applySuccessBanner(allDone);
        if (setupFromDb.loaded) maybeCelebrateOnboardingComplete();
    }

    /**
     * Un solo camino para leer flags: siempre pasa por fetchInFlight para no solapar con mark ni otro refresh.
     */
    async function refreshFromSupabase() {
        if (fetchInFlight) return fetchInFlight;
        fetchInFlight = fetchSetupFlagsFromSupabase()
            .then(function () {
                paint();
            })
            .finally(function () {
                fetchInFlight = null;
                updateMarkButtonsState();
            });
        updateMarkButtonsState();
        return fetchInFlight;
    }

    async function updateClubSetupFlag(step, key) {
        var f = clubsFilter(key);
        if (!f) {
            return { data: null, error: { message: "clave de club vacía o inválida" } };
        }
        var supabase = await getSupabase();
        var patch =
            step === "5" ? { setup_cameras_ok: true } : step === "6" ? { setup_tv_ok: true } : null;
        if (!patch) return { data: null, error: { message: "paso inválido" } };
        return supabase
            .from("clubs")
            .update(patch)
            .eq(f.column, f.value)
            .select("setup_cameras_ok, setup_tv_ok")
            .maybeSingle();
    }

    async function markStepInSupabase(step) {
        if (step !== "5" && step !== "6") return;
        if (!setupFromDb.loaded) return;
        if (fetchInFlight) return;
        if (markMutationInFlight) return;

        var key = resolvedClubKey;
        if (!key) {
            try {
                key = await getClubKeyForSetup();
            } catch (e) {
                key = "";
            }
        }
        if (!key || !clubsFilter(key)) {
            resolvedClubKey = null;
            updateMarkButtonsState();
            try {
                alert("No hay club activo en el perfil. Elegí un club en el inicio o iniciá sesión.");
            } catch (e2) {}
            return;
        }
        resolvedClubKey = key;

        markMutationInFlight = true;
        setButtonsBusy(true);
        try {
            var q = await updateClubSetupFlag(step, key);
            if (q.error) {
                if (typeof console !== "undefined" && console.warn) console.warn("[club-setup-guide] update:", q.error.message);
                try {
                    alert(
                        "No se pudo guardar en el servidor. Revisá permisos (RLS) para UPDATE en clubs o que exista la fila del club."
                    );
                } catch (e3) {}
                return;
            }
            if (q.data) {
                setupFromDb.s5 = q.data.setup_cameras_ok === true;
                setupFromDb.s6 = q.data.setup_tv_ok === true;
                setupFromDb.loaded = true;
                paint();
            } else {
                await refreshFromSupabase();
            }
        } finally {
            markMutationInFlight = false;
            setButtonsBusy(false);
            updateMarkButtonsState();
        }
    }

    function bindMarks() {
        document.querySelectorAll(".dc-setup-guide__mark").forEach(function (btn) {
            if (btn.dataset.dcSetupBound) return;
            btn.dataset.dcSetupBound = "1";
            btn.addEventListener("click", function () {
                var st = btn.getAttribute("data-mark-step");
                if (!st) return;
                markStepInSupabase(st);
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        removeLegacyOnboardingKeys();
        updateMarkButtonsState();
        paint();
        bindMarks();
        refreshFromSupabase();
    });

    window.addEventListener("pageshow", function () {
        paint();
        bindMarks();
        refreshFromSupabase();
    });
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") refreshFromSupabase();
    });

    window.addEventListener("storage", function (e) {
        var k = e.key;
        if (!k || k === "mi_perfil" || k === "wl_club_nombre") {
            paint();
            refreshFromSupabase();
        }
    });
})();
