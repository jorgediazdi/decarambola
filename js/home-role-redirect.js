/**
 * Rutas post-login / sesión activa en la home raíz (index.html).
 */
export const HOME_ROLE_PATH = {
  jugador: '/jugador/index.html',
  organizador: '/apps/organizador/organizador.html',
  superadmin: '/admin/index.html',
  club_admin: '/apps/club/sala/mesas.html',
};

export function redirectHomeByProfileRole(role) {
  const r = role && HOME_ROLE_PATH[role] ? String(role) : 'jugador';
  window.location.replace(HOME_ROLE_PATH[r]);
}
