/**
 * Perfiles (staff/jugador) — Supabase.
 */
import { supabase } from '/js/supabase-client.js';

function wrap(data, error) {
  if (error) return { data: null, error };
  return { data, error: null };
}

/** role + club_id para el usuario autenticado (JWT / sesión del cliente). */
export async function getProfileRoleClubByUserId(userId) {
  try {
    if (!userId) return { data: null, error: null };
    const { data, error } = await supabase
      .from('profiles')
      .select('role,club_id')
      .eq('id', userId)
      .maybeSingle();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}
