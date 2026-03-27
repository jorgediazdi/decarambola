/**
 * Duelo TV: al cambiar la mesa en Supabase (operario abre/cierra), refresca URL de stream si viene de MasterVIP.
 */
import { supabase } from "./supabase-client.js";

function getClubIdRaw() {
    try {
        var p = JSON.parse(localStorage.getItem("mi_perfil") || "{}");
        return String(p.club_id || "").trim();
    } catch (e) {
        return "";
    }
}

window.DC_startDueloTvMesaRealtime = function (opts) {
    var mesa = opts && opts.mesa;
    var clubId = getClubIdRaw();
    if (!clubId || !mesa || mesa === "-") return;
    var num = parseInt(String(mesa).replace(/\D/g, ""), 10);
    if (isNaN(num)) return;
    if (window._dcDueloTvCh) {
        try {
            supabase.removeChannel(window._dcDueloTvCh);
        } catch (e) {}
        window._dcDueloTvCh = null;
    }
    var ch = supabase.channel("duelo-tv-mesa-" + clubId + "-" + num);
    ch.on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "mesas",
            filter: "club_id=eq." + clubId,
        },
        function (payload) {
            var row = payload.new || payload.old || {};
            if (String(row.numero) !== String(num) && row.numero !== num) return;
            if (typeof window.MasterVIP === "undefined" || !window.MasterVIP.getStreamUrlMesa) return;
            window.MasterVIP.getStreamUrlMesa(clubId, num).then(function (url) {
                if (url && typeof window.__dueloSetStreamUrl === "function") {
                    window.__dueloSetStreamUrl(url);
                }
            });
        }
    );
    ch.subscribe();
    window._dcDueloTvCh = ch;
};
