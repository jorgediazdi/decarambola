/**
 * Suscripción Realtime para salón (mesas + historial). Habilitar replicación en Supabase Dashboard.
 */
import { supabase } from "./supabase-client.js";

/**
 * @param {string} clubId
 * @param {() => void} onChange
 * @returns {() => void} unsubscribe
 */
export function subscribeClubSalonRealtime(clubId, onChange) {
    if (!clubId || typeof onChange !== "function") return function () {};
    var cid = encodeURIComponent(String(clubId).trim());
    var name = "sala-club-" + cid.replace(/[^a-zA-Z0-9_-]/g, "_");
    var ch = supabase.channel(name);
    ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mesas", filter: "club_id=eq." + String(clubId).trim() },
        function () {
            onChange();
        }
    );
    ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mesas_historial", filter: "club_id=eq." + String(clubId).trim() },
        function () {
            onChange();
        }
    );
    ch.subscribe(function (status) {
        if (status === "CHANNEL_ERROR" && typeof console !== "undefined" && console.warn) {
            console.warn("[sala-realtime] Canal con error; comprobar Realtime en Supabase para mesas/mesas_historial");
        }
    });
    return function () {
        try {
            supabase.removeChannel(ch);
        } catch (e) {}
    };
}
