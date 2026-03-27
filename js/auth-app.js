/**
 * Cableado de auth.html — importa cliente y auth-manager (sin createClient duplicado).
 */
import {
  supabase,
  signIn,
  signOut,
  signUp,
  requestPasswordReset,
  getSession,
  getRole
} from '/js/auth-manager.js';

function humanAuthError(err) {
  if (!err) return 'Error al iniciar sesión.';
  const msg = String(err.message || err || '');
  if (/invalid login credentials/i.test(msg)) {
    return 'Correo o contraseña incorrectos. Si es tu primera vez, usá «Crear cuenta».';
  }
  if (/email not confirmed/i.test(msg)) {
    return 'Revisá tu correo para confirmar la cuenta (o desactivá «Confirm email» en Supabase en desarrollo).';
  }
  return msg || 'Error al iniciar sesión.';
}

async function redirectAfterLogin() {
  const { data: role, error } = await getRole();
  console.log('DEBUG role:', role);
  console.log('DEBUG error:', error);
  if (error) {
    console.log('DEBUG: hay error, va a jugador');
    window.location.href = '/jugador/';
    return;
  }
  var r = role || 'jugador';
  console.log('DEBUG r final:', r);
  if (r === 'superadmin') {
    window.location.href = '/admin/';
  } else if (r === 'club_admin') {
    window.location.href = '/apps/club/sala/';
  } else if (r === 'operador') {
    window.location.href = '/apps/club/sala/operacion.html';
  } else {
    window.location.href = '/jugador/';
  }
}

var elMsg = document.getElementById('msg');
var elSesion = document.getElementById('sesion');
var elForm = document.getElementById('formulario');
var elEmail = document.getElementById('email');
var elPass = document.getElementById('pass');

function showMsg(text, ok) {
  elMsg.className = 'msg ' + (ok ? 'ok' : 'err');
  elMsg.textContent = text;
}
function clearMsg() {
  elMsg.className = 'msg';
  elMsg.textContent = '';
}

function uiSesion(user) {
  if (user && user.email) {
    elSesion.classList.add('on');
    document.getElementById('sesion-email').textContent = user.email;
    elForm.style.display = 'none';
  } else {
    elSesion.classList.remove('on');
    elForm.style.display = 'block';
  }
}

(async function initAuth() {
  try {
    const r = await getSession();
    if (r.error) { uiSesion(null); return; }
    const s = r.data;
    if (s && s.user) {
      await redirectAfterLogin();
    } else {
      uiSesion(null);
    }
  } catch(e) {
    uiSesion(null);
  }
})();

supabase.auth.onAuthStateChange(function (_event, session) {
  uiSesion(session && session.user ? session.user : null);
  clearMsg();
});

var elAuthForm = document.getElementById('auth-form');
var elBtnIn = document.getElementById('btn-in');

async function doSignIn() {
  clearMsg();
  var email = (elEmail.value || '').trim();
  var password = elPass.value || '';
  if (!email || !password) {
    showMsg('Escribí correo y contraseña.', false);
    return;
  }
  elBtnIn.disabled = true;
  var r = await signIn(email, password);
  elBtnIn.disabled = false;
  if (r.error) {
    showMsg(humanAuthError(r.error), false);
    return;
  }
  showMsg('Entrando…', true);
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', r.data.user.id)
    .single();

  if (profile) {
    localStorage.setItem('mi_perfil', JSON.stringify({
      club_id: profile.club_id,
      nombre: profile.nombre_completo,
      role: profile.role,
      email: r.data.user.email
    }));
  }
  await redirectAfterLogin();
}

if (elAuthForm) {
  elAuthForm.addEventListener('submit', function (e) {
    e.preventDefault();
    doSignIn();
  });
}

document.getElementById('btn-up').onclick = async function () {
  clearMsg();
  var email = (elEmail.value || '').trim();
  var password = elPass.value || '';
  if (!email || !password) {
    showMsg('Escribí correo y contraseña para crear la cuenta.', false);
    return;
  }
  if (password.length < 6) {
    showMsg('La contraseña debe tener al menos 6 caracteres.', false);
    return;
  }
  this.disabled = true;
  var r = await signUp(email, password);
  this.disabled = false;
  if (r.error) {
    showMsg(r.error.message || 'Error al registrarse', false);
    return;
  }
  if (r.data && r.data.user && !r.data.session) {
    showMsg('Revisá tu correo para confirmar la cuenta (o desactivá confirmación en Supabase en desarrollo).', true);
  } else {
    showMsg('Cuenta creada. Entrando…', true);
    await redirectAfterLogin();
  }
};

document.getElementById('btn-logout').onclick = async function () {
  await signOut();
  clearMsg();
};

document.getElementById('btn-reset').onclick = async function () {
  clearMsg();
  var email = (elEmail.value || '').trim();
  if (!email) {
    showMsg('Escribí tu correo arriba y volvé a tocar «¿Olvidaste la contraseña?».', false);
    return;
  }
  this.disabled = true;
  var r = await requestPasswordReset(email);
  this.disabled = false;
  if (r.error) {
    showMsg(r.error.message || 'No se pudo enviar el correo.', false);
    return;
  }
  showMsg('Si ese correo está registrado, te enviamos un enlace. Revisá spam.', true);
};

(function () {
  var bg = document.getElementById('stars-bg');
  if (!bg) return;
  for (var i = 0; i < 50; i++) {
    var s = document.createElement('div');
    s.className = 'star';
    var sz = Math.random() * 2 + 0.5;
    s.style.cssText =
      'width:' +
      sz +
      'px;height:' +
      sz +
      'px;top:' +
      Math.random() * 100 +
      '%;left:' +
      Math.random() * 100 +
      '%;animation-delay:' +
      Math.random() * 3 +
      's;animation-duration:' +
      (2 + Math.random() * 3) +
      's;';
    bg.appendChild(s);
  }
})();
