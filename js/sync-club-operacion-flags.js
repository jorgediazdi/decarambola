/**
 * Sincroniza flags de operación en public.clubs tras guardar salón/tarifas.
 * Requiere migración 011_clubs_operacion_flags.sql y políticas RLS adecuadas.
 *
 * @param {string} clubId — id UUID o clubs.codigo
 * @param {object} tarifasObj — objeto tarifas (hora, media, …)
 * @param {{ onlyTarifas?: boolean }} [opts] — si onlyTarifas: solo actualiza setup_tarifas_ok (pantalla tarifas_salon)
 */
export async function syncClubOperacionFlags(clubId, tarifasObj, opts) {
    opts = opts || {};
    if (!clubId) return { ok: false, error: "sin club_id" };
    var t = tarifasObj && typeof tarifasObj === "object" ? tarifasObj : {};
    var hasTarifa = false;
    ["hora", "media", "manana", "tarde", "noche", "finde"].forEach(function (k) {
        if ((parseFloat(t[k]) || 0) > 0) hasTarifa = true;
    });
    try {
        var mod = await import("./supabase-client.js");
        var supabase = mod.supabase;
        var cid = String(clubId).trim();
        var isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cid);
        var patch = opts.onlyTarifas
            ? { setup_tarifas_ok: hasTarifa }
            : { setup_salon_ok: true, setup_tarifas_ok: hasTarifa };
        var q = supabase.from("clubs").update(patch).eq(isUuid ? "id" : "codigo", cid);
        var res = await q;
        if (res.error) {
            if (typeof console !== "undefined" && console.warn)
                console.warn("[sync-club-operacion-flags]", res.error.message);
            return { ok: false, error: res.error.message };
        }
        return { ok: true };
    } catch (e) {
        if (typeof console !== "undefined" && console.warn) console.warn("[sync-club-operacion-flags]", e);
        return { ok: false, error: String(e) };
    }
}
