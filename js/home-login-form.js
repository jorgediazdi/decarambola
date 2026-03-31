/**
 * Formulario de login en index.html (solo UI de invitados).
 */
import { supabase } from '/js/supabase-client.js';
import { getRole } from '/js/auth-manager.js';
import { redirectHomeByProfileRole } from '/js/home-role-redirect.js';

function setBusy(form, busy) {
  const btn = form.querySelector('[type="submit"]');
  if (btn) {
    btn.disabled = busy;
    btn.setAttribute('aria-busy', busy ? 'true' : 'false');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('home-login-form');
  const errEl = document.getElementById('home-login-error');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (errEl) {
      errEl.textContent = '';
      errEl.hidden = true;
    }

    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');

    if (!email || !password) {
      if (errEl) {
        errEl.textContent = 'Ingresá email y contraseña.';
        errEl.hidden = false;
      }
      return;
    }

    setBusy(form, true);
    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        if (errEl) {
          errEl.textContent = signErr.message || 'No se pudo iniciar sesión.';
          errEl.hidden = false;
        }
        return;
      }
      const { data: rol, error: roleErr } = await getRole();
      if (roleErr) {
        console.warn('[home-login-form] getRole:', roleErr);
      }
      redirectHomeByProfileRole(rol || 'jugador');
    } catch (err) {
      if (errEl) {
        errEl.textContent = err.message || 'Error de conexión.';
        errEl.hidden = false;
      }
    } finally {
      setBusy(form, false);
    }
  });
});
