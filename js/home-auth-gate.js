/**
 * Home raíz: si hay sesión, redirige según profiles.role; si no, marca invitado y deja el formulario.
 */
import { supabase } from '/js/supabase-client.js';
import { getRole } from '/js/auth-manager.js';
import { HOME_ROLE_PATH, redirectHomeByProfileRole } from '/js/home-role-redirect.js';

(async function () {
  try {
    console.log('[AuthGate] checking session...');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('[AuthGate] session:', session);
    console.log('[AuthGate] isGuest flag:', window.__dcHomeIsGuest);
    if (session?.user) {
      const { data: rol, error } = await getRole();
      if (error) {
        console.warn('[home-auth-gate] getRole:', error);
      }
      const roleArg = rol || 'jugador';
      const r = roleArg && HOME_ROLE_PATH[roleArg] ? String(roleArg) : 'jugador';
      const destino = HOME_ROLE_PATH[r];
      console.log('[AuthGate] redirecting to:', destino);
      redirectHomeByProfileRole(roleArg);
      return;
    }
  } catch (e) {
    console.warn('[home-auth-gate]', e);
  }
  document.body.classList.add('dc-home-guest');
  window.__dcHomeIsGuest = true;
  window.__dcHomeAuthPending = false;
})();
