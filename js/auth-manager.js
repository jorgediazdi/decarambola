/**
 * Auth centralizado — Supabase session + profiles (role, club_id).
 * Usa el único cliente en js/supabase-client.js
 */
import { supabase } from '/js/supabase-client.js';

function wrap(data, error) {
  if (error) return { data: null, error: error };
  return { data: data, error: null };
}

/** Misma instancia que exporta js/supabase-client.js (un solo createClient). */
export { supabase };

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || '').trim(),
      password: String(password || '')
    });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return wrap(null, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { data: null, error };
    return { data: data.session || null, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function getRole() {
  try {
    const { data: sess, error: e1 } = await supabase.auth.getSession();
    if (e1 || !sess.session?.user) return { data: null, error: e1 || new Error('Sin sesión') };
    const uid = sess.session.user.id;
    const { data, error } = await supabase.from('profiles').select('role').eq('id', uid).maybeSingle();
    if (error) return { data: null, error };
    return { data: data && data.role ? String(data.role) : 'jugador', error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function getClubId() {
  try {
    const { data: sess, error: e1 } = await supabase.auth.getSession();
    if (e1 || !sess.session?.user) return { data: null, error: e1 || new Error('Sin sesión') };
    const uid = sess.session.user.id;
    const { data, error } = await supabase.from('profiles').select('club_id').eq('id', uid).maybeSingle();
    if (error) return { data: null, error };
    return { data: data && data.club_id != null ? String(data.club_id) : null, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function requireAuth() {
  try {
    const { data, error } = await getSession();
    if (error || !data) {
      window.location.href = '/auth.html';
    }
  } catch (e) {
    window.location.href = '/auth.html';
  }
}

export async function requireRole(role) {
  try {
    const r = await getRole();
    if (r.error || !r.data || r.data !== role) {
      window.location.href = '/auth.html';
    }
  } catch (e) {
    window.location.href = '/auth.html';
  }
}

export async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: String(email || '').trim(),
      password: String(password || '')
    });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function requestPasswordReset(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(String(email || '').trim(), {
      redirectTo: window.location.origin + '/auth.html'
    });
    return wrap(data, error);
  } catch (e) {
    return { data: null, error: e };
  }
}
