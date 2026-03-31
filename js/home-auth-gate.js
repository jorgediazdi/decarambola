/**
 * Home raíz: si hay sesión, redirige según profiles.role; si no, marca invitado y deja el formulario.
 */
import { supabase } from '/js/supabase-client.js';
import { getRole } from '/js/auth-manager.js';
import { redirectHomeByProfileRole } from '/js/home-role-redirect.js';

(async function () {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: rol, error } = await getRole();
      if (error) {
        console.warn('[home-auth-gate] getRole:', error);
      }
      redirectHomeByProfileRole(rol || 'jugador');
      return;
    }
  } catch (e) {
    console.warn('[home-auth-gate]', e);
  }
  document.body.classList.add('dc-home-guest');
  window.__dcHomeIsGuest = true;
  window.__dcHomeAuthPending = false;
})();
