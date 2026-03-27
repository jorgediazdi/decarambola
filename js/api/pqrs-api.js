/**
 * PQRS — Supabase (misma instancia que js/supabase-client.js).
 */
import { supabase } from '/js/supabase-client.js';

function wrap(data, error) {
  if (error) return { data: null, error };
  return { data, error: null };
}

/** @param {{ estado?: string | null }} [opts] */
export async function listPqrs(opts) {
  try {
    var estado = opts && opts.estado;
    var q = supabase.from('pqrs').select('*').order('created_at', { ascending: false });
    if (estado) q = q.eq('estado', estado);
    const { data, error } = await q;
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function insertPqrs(row) {
  try {
    const { data, error } = await supabase.from('pqrs').insert(row).select();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function updatePqrsById(id, patch) {
  try {
    const { data, error } = await supabase.from('pqrs').update(patch).eq('id', id).select();
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}
