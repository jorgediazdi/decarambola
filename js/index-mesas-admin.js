/**
 * Panel "Administración de Mesas" en index.html
 * Paso 1: requiere sesión Supabase + rol club_admin/superadmin + club_id (excepto superadmin)
 * Migraciones: 002 luz, 003 hora_apertura, 004 RLS mesas
 */
import { supabase } from './supabase-client.js';

const TARIFA_HORA_COP = 15000;

const root = document.getElementById('mesas-admin-root');
const grid = document.getElementById('mesas-admin-grid');
const statusEl = document.getElementById('mesas-admin-status');
const btnRefresh = document.getElementById('mesas-admin-refresh');

/** Perfil en memoria tras gate */
let perfilActual = null;

function setStatus(msg, isErr) {
  if (!statusEl) return;
  statusEl.textContent = msg || '';
  statusEl.style.color = isErr ? '#e88' : '#666';
}

function formatCOP(valor) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(valor);
  } catch (e) {
    return '$' + Math.round(valor).toLocaleString('es-CO') + ' COP';
  }
}

function duracionDesde(fechaInicioIso) {
  if (!fechaInicioIso) return { texto: 'Sin apertura registrada', horas: 0 };
  const inicio = new Date(fechaInicioIso).getTime();
  const fin = Date.now();
  const ms = Math.max(0, fin - inicio);
  const horas = ms / 3600000;
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  let texto = '';
  if (h > 0) texto += h + ' h ';
  texto += m + ' min';
  if (totalMin === 0 && ms > 0) texto = 'Menos de 1 min';
  return { texto: texto.trim(), horas };
}

function estadoLabel(estado) {
  if (estado === 'libre') return 'Disponible';
  if (estado === 'ocupada') return 'Ocupada';
  return estado || '—';
}

function isOcupada(row) {
  return row.estado === 'ocupada';
}

function cardClass(row) {
  let c = 'mesa-card';
  if (isOcupada(row)) c += ' mesa-card--ocupada';
  else if (row.estado === 'libre') c += ' mesa-card--libre';
  else c += ' mesa-card--otro';
  return c;
}

function formatHoraCorta(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return String(iso);
  }
}

function renderLoginRequired() {
  if (!grid) return;
  perfilActual = null;
  grid.innerHTML =
    '<div class="mesas-login-gate">' +
    '<h3>ACCESO RESTRINGIDO</h3>' +
    '<p>Inicia sesión con una cuenta de <strong>administrador del club</strong> para ver y operar las mesas.</p>' +
    '<a href="auth.html">Ir a iniciar sesión</a>' +
    '<p style="margin-top:14px;">Después vuelve a esta página.</p>' +
    '</div>';
  setStatus('Sin sesión · Paso 1 RLS activo', true);
  if (btnRefresh) btnRefresh.style.display = 'none';
}

function renderSinPermiso(mensaje) {
  if (!grid) return;
  perfilActual = null;
  grid.innerHTML =
    '<div class="mesas-login-gate">' +
    '<h3>SIN PERMISO</h3>' +
    '<p>' + mensaje + '</p>' +
    '<a href="auth.html">Cambiar de cuenta</a>' +
    '</div>';
  setStatus('Permiso denegado', true);
  if (btnRefresh) btnRefresh.style.display = '';
}

function renderUserBar() {
  if (!statusEl || !perfilActual) return;
  var prev = document.getElementById('mesas-user-bar-el');
  if (prev) prev.remove();
  var bar = document.createElement('div');
  bar.id = 'mesas-user-bar-el';
  bar.className = 'mesas-user-bar';
  bar.innerHTML =
    'Sesión: <strong>' +
    (perfilActual.email || '—') +
    '</strong> · Rol: <strong>' +
    (perfilActual.role || '—') +
    '</strong>' +
    (perfilActual.role === 'superadmin'
      ? ''
      : ' · Club: <strong>' + (perfilActual.club_id || '—') + '</strong>');
  statusEl.parentNode.insertBefore(bar, statusEl);
}

async function ensureAccess() {
  if (!grid) return false;

  if (btnRefresh) btnRefresh.style.display = '';

  const { data: sessWrap } = await supabase.auth.getSession();
  const session = sessWrap && sessWrap.session;
  if (!session) {
    renderLoginRequired();
    return false;
  }

  /* Solo columnas que existen en public.profiles (el email vive en auth.users, no duplicar en SELECT). */
  const { data: prof, error: eProf } = await supabase
    .from('profiles')
    .select('id, role, club_id')
    .eq('id', session.user.id)
    .maybeSingle();

  if (eProf) {
    renderSinPermiso('No se pudo leer tu perfil: ' + eProf.message);
    return false;
  }
  if (!prof) {
    renderSinPermiso('No existe fila en <code>profiles</code> para tu usuario. Revisa el trigger de registro.');
    return false;
  }

  const role = (prof.role || '').trim();
  if (role !== 'club_admin' && role !== 'superadmin') {
    renderSinPermiso(
      'Tu rol es <strong>' +
        role +
        '</strong>. Solo <strong>club_admin</strong> o <strong>superadmin</strong> pueden administrar mesas.'
    );
    return false;
  }

  if (role === 'club_admin' && (!prof.club_id || !String(prof.club_id).trim())) {
    renderSinPermiso(
      'Tu cuenta no tiene <strong>club_id</strong> en <code>profiles</code>. ' +
        'Pídele a quien gestione Supabase que lo asigne (mismo texto que en <code>mesas.club_id</code>). ' +
        'Ver <strong>docs/PASO1_RLS_MESAS.md</strong>.'
    );
    return false;
  }

  perfilActual = {
    id: prof.id,
    email: session.user.email || null,
    role: role,
    club_id: prof.club_id ? String(prof.club_id).trim() : null
  };

  var prevBar = document.getElementById('mesas-user-bar-el');
  if (prevBar) prevBar.remove();
  renderUserBar();
  return true;
}

function renderMesas(rows) {
  if (!grid) return;
  grid.innerHTML = '';
  if (!rows || !rows.length) {
    grid.innerHTML =
      '<p class="mesa-empty">No hay mesas visibles para tu club. Revisa que <code>mesas.club_id</code> coincida con tu perfil o que existan filas.</p>';
    return;
  }

  rows.forEach((row) => {
    const numeroMesa = row.numero;
    const luz = !!row.luz_encendida;
    const ocupada = isOcupada(row);
    const aperturaHtml =
      ocupada && row.hora_apertura
        ? '<div class="mesa-apertura">Apertura: <strong>' + formatHoraCorta(row.hora_apertura) + '</strong></div>'
        : '';

    const card = document.createElement('article');
    card.className = cardClass(row);
    card.innerHTML =
      '<div class="mesa-card-head">' +
      '<span class="mesa-num">Mesa ' +
      String(numeroMesa != null ? numeroMesa : '?') +
      '</span>' +
      '<span class="mesa-luz ' +
      (luz ? 'on' : 'off') +
      '" title="Luz">' +
      (luz ? '● ON' : '○ OFF') +
      '</span>' +
      '</div>' +
      '<div class="mesa-estado"><span class="mesa-estado-lbl">Estado</span> ' +
      '<strong class="mesa-estado-val">' +
      estadoLabel(row.estado) +
      '</strong></div>' +
      aperturaHtml +
      '<div class="mesa-actions">' +
      '<button type="button" class="mesa-btn mesa-btn-open" data-id="' +
      row.id +
      '">Abrir mesa</button>' +
      '<button type="button" class="mesa-btn mesa-btn-close" data-id="' +
      row.id +
      '">Cerrar mesa</button>' +
      '</div>';

    grid.appendChild(card);
  });

  grid.querySelectorAll('.mesa-btn-open').forEach((btn) => {
    btn.addEventListener('click', () => abrirMesa(btn.getAttribute('data-id')));
  });
  grid.querySelectorAll('.mesa-btn-close').forEach((btn) => {
    btn.addEventListener('click', () => cerrarMesa(btn.getAttribute('data-id')));
  });
}

async function cargarMesas() {
  if (!grid) return;
  const ok = await ensureAccess();
  if (!ok) return;

  setStatus('Cargando mesas…');
  grid.innerHTML = '<p class="mesa-empty">Cargando…</p>';

  const { data, error } = await supabase
    .from('mesas')
    .select('id, numero, club_id, estado, luz_encendida, hora_apertura')
    .order('numero', { ascending: true, nullsFirst: false });

  if (error) {
    var hint = '';
    if (error.code === 'PGRST301' || (error.message && error.message.indexOf('JWT') !== -1)) {
      hint = ' Sesión caducada: vuelve a entrar en auth.html';
    }
    if (error.message && error.message.indexOf('permission') !== -1) {
      hint = ' ¿Ejecutaste 004_mesas_rls_paso1.sql y tu club_id coincide con mesas?';
    }
    if (error.message && error.message.indexOf('luz_encendida') !== -1) {
      hint = ' Ejecuta 002_mesas_luz_encendida.sql';
    }
    if (error.message && error.message.indexOf('hora_apertura') !== -1) {
      hint = ' Ejecuta 003_mesas_hora_apertura.sql';
    }
    setStatus('Error: ' + error.message + hint, true);
    grid.innerHTML = '<p class="mesa-empty mesa-err">No se pudieron cargar las mesas.</p>';
    return;
  }

  setStatus(
    (data && data.length ? data.length + ' mesa(s)' : 'Sin mesas') +
      ' · tarifa ' +
      formatCOP(TARIFA_HORA_COP) +
      '/h'
  );
  renderMesas(data || []);
}

async function abrirMesa(id) {
  if (!id) return;
  if (!(await ensureAccess())) return;
  setStatus('Abriendo mesa…');
  const ahora = new Date().toISOString();
  const { error } = await supabase
    .from('mesas')
    .update({
      estado: 'ocupada',
      luz_encendida: true,
      hora_apertura: ahora,
      updated_at: ahora
    })
    .eq('id', id);

  if (error) {
    setStatus('Error al abrir: ' + error.message, true);
    return;
  }
  setStatus('Mesa abierta · reloj de cobro iniciado');
  await cargarMesas();
}

function mostrarModalCobro(opts) {
  return new Promise(function (resolve) {
    var overlay = document.createElement('div');
    overlay.className = 'mesa-cobro-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="mesa-cobro-box">' +
      '<div class="mesa-cobro-icon">💰</div>' +
      '<div class="mesa-cobro-tit">LIQUIDACIÓN DE MESA</div>' +
      '<div class="mesa-cobro-mesa">Mesa ' +
      opts.numeroMesa +
      '</div>' +
      '<div class="mesa-cobro-tiempo">' +
      opts.lineaTiempo +
      '</div>' +
      '<div class="mesa-cobro-total">' +
      opts.totalFormateado +
      '</div>' +
      '<div class="mesa-cobro-tarifa">Tarifa ' +
      formatCOP(TARIFA_HORA_COP) +
      ' / hora · tiempo proporcional</div>' +
      '<div class="mesa-cobro-actions">' +
      '<button type="button" class="mesa-cobro-btn mesa-cobro-btn-ok" id="mesa-cobro-ok">COBRAR Y LIBERAR MESA</button>' +
      '<button type="button" class="mesa-cobro-btn mesa-cobro-btn-cancel" id="mesa-cobro-cancel">Cancelar</button>' +
      '</div>' +
      '</div>';

    function cerrar(confirma) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(!!confirma);
    }

    overlay.querySelector('#mesa-cobro-ok').onclick = function () {
      cerrar(true);
    };
    overlay.querySelector('#mesa-cobro-cancel').onclick = function () {
      cerrar(false);
    };
    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) cerrar(false);
    });

    document.body.appendChild(overlay);
  });
}

async function cerrarMesa(id) {
  if (!id) return;
  if (!(await ensureAccess())) return;

  setStatus('Calculando cobro…');

  const { data: row, error: errRead } = await supabase
    .from('mesas')
    .select('id, numero, estado, hora_apertura')
    .eq('id', id)
    .single();

  if (errRead || !row) {
    setStatus('Error al leer mesa: ' + (errRead && errRead.message ? errRead.message : 'sin datos'), true);
    return;
  }

  var d = duracionDesde(row.hora_apertura);
  var totalCOP = Math.round(d.horas * TARIFA_HORA_COP);
  if (!row.hora_apertura) totalCOP = 0;

  var lineaTiempo =
    'Tiempo: <strong style="color:#aaa;">' +
    d.texto +
    '</strong>' +
    (row.hora_apertura
      ? '<br><span style="color:#444;font-size:0.9em;">Desde ' + formatHoraCorta(row.hora_apertura) + '</span>'
      : '');

  var confirmar = await mostrarModalCobro({
    numeroMesa: row.numero != null ? row.numero : '?',
    lineaTiempo: lineaTiempo,
    totalFormateado: formatCOP(totalCOP)
  });

  if (!confirmar) {
    setStatus('Cierre cancelado');
    return;
  }

  setStatus('Liberando mesa…');
  var ahora = new Date().toISOString();
  const { error } = await supabase
    .from('mesas')
    .update({
      estado: 'libre',
      luz_encendida: false,
      hora_apertura: null,
      updated_at: ahora
    })
    .eq('id', id);

  if (error) {
    setStatus('Error al cerrar: ' + error.message, true);
    return;
  }

  setStatus('Cobro registrado en pantalla: ' + formatCOP(totalCOP) + ' · mesa libre');
  await cargarMesas();
}

async function init() {
  if (!root || !grid) return;
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => cargarMesas());
  }

  supabase.auth.onAuthStateChange(function () {
    cargarMesas();
  });

  await cargarMesas();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
