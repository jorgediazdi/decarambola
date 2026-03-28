/**
 * Gate de sala según política del club: vista anon v_clubs_salon_publico (id, salon_acceso_publico).
 * Si salon_acceso_publico es true → acceso abierto al salón (sync club_id, __salaBoot, sin overlay).
 * Si false o error de red → delega en guardSalaPage (staff).
 *
 * profiles.club_id debe coincidir con v_clubs_salon_publico.codigo (canon: clubs.codigo).
 */
import { supabase } from '/js/supabase-client.js';
import { getSession, getClubId } from '/js/auth-manager.js';
import { guardSalaPage } from '/js/sala-supabase-gate.js';

function removeOverlay() {
    var el = document.getElementById('dc-sala-gate-overlay');
    if (el) el.remove();
}

function syncClubIdToLocalStorage(clubId) {
    if (!clubId || !String(clubId).trim()) return;
    try {
        var perfil = JSON.parse(localStorage.getItem('mi_perfil') || '{}');
        if (perfil.club_id === clubId) return;
        perfil.club_id = clubId;
        localStorage.setItem('mi_perfil', JSON.stringify(perfil));
    } catch (e) {}
}

/**
 * @param {{ pageTitle?: string }} opts
 * @returns {Promise<boolean>}
 */
export async function guardSalaPageConPolitica(opts) {
    var sessR = await getSession();
    if (sessR.error || !sessR.data) {
        return guardSalaPage(opts);
    }

    var clubR = await getClubId();
    var clubId = clubR.data != null ? String(clubR.data).trim() : '';
    if (!clubId) {
        return guardSalaPage(opts);
    }

    var publico = false;
    try {
        var q = await supabase
            .from('v_clubs_salon_publico')
            .select('salon_acceso_publico')
            .eq('codigo', clubId)
            .maybeSingle();
        if (q.error) publico = false;
        else publico = !!(q.data && q.data.salon_acceso_publico === true);
    } catch (_e) {
        publico = false;
    }

    if (!publico) {
        return guardSalaPage(opts);
    }

    removeOverlay();
    syncClubIdToLocalStorage(clubId);
    if (typeof window.__salaBoot === 'function') {
        try {
            window.__salaBoot();
        } catch (e) {
            console.error(e);
        }
    }
    return true;
}
