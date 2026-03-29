/**
 * Unifica club_id que puede venir como UUID (clubs.id) o como código (clubs.codigo).
 * Las queries a mesas_config / mesas deben usar la clave que esté en BD; este módulo
 * devuelve el UUID canónico y el código cuando existan, para probar ambas.
 */
import { getClubByIdOrCodigo } from '/js/api/club-api.js';

export function isClubKeyLikelyUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || '').trim()
  );
}

/**
 * @param {string|null|undefined} clubKey — id UUID o codigo texto
 * @returns {Promise<{ uuid: string|null, codigo: string|null, error: Error|null }>}
 */
export async function resolveClubId(clubKey) {
  var key = String(clubKey || '').trim();
  if (!key) return { uuid: null, codigo: null, error: new Error('club_id vacío') };
  var r = await getClubByIdOrCodigo(key);
  if (r.error) return { uuid: null, codigo: null, error: r.error };
  if (!r.data || !r.data.id) return { uuid: null, codigo: null, error: new Error('Club no encontrado') };
  return {
    uuid: String(r.data.id),
    codigo: r.data.codigo != null && String(r.data.codigo).trim() ? String(r.data.codigo).trim() : null,
    error: null,
  };
}

/** Solo el UUID; null si no se resuelve (útil para políticas que esperan clubs.id). */
export async function resolveClubIdToUuid(clubKey) {
  var out = await resolveClubId(clubKey);
  return out.uuid;
}
