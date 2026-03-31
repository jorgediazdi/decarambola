/**
 * Home raíz: solo redirige si getUser() válido y profiles.role está en HOME_ROLE_PATH.
 * Sin sesión real o sin rol en BD → queda en home con dc-home-guest (sin redirect).
 */
import { supabase } from '/js/supabase-client.js';
import { HOME_ROLE_PATH, redirectHomeByProfileRole } from '/js/home-role-redirect.js';

(async function () {
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData && userData.user ? userData.user : null;
    if (userErr || !user) {
      document.body.classList.add('dc-home-guest');
      window.__dcHomeIsGuest = true;
      window.__dcHomeAuthPending = false;
      return;
    }

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (pErr || !profile || profile.role == null || String(profile.role).trim() === '') {
      document.body.classList.add('dc-home-guest');
      window.__dcHomeIsGuest = true;
      window.__dcHomeAuthPending = false;
      return;
    }

    const roleStr = String(profile.role);
    if (!HOME_ROLE_PATH[roleStr]) {
      document.body.classList.add('dc-home-guest');
      window.__dcHomeIsGuest = true;
      window.__dcHomeAuthPending = false;
      return;
    }

    redirectHomeByProfileRole(roleStr);
    return;
  } catch (e) {
    console.warn('[home-auth-gate]', e);
  }
  document.body.classList.add('dc-home-guest');
  window.__dcHomeIsGuest = true;
  window.__dcHomeAuthPending = false;
})();
