/**
 * Cliente Supabase para usar con <script type="module"> en HTML estático.
 * Sin npm: import desde CDN (+esm). Si más adelante usas Vite/Webpack,
 * cambia la primera línea a: import { createClient } from '@supabase/supabase-js'
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm';

const supabaseUrl = 'https://iwvogyloebvieloequzr.supabase.co';
const supabaseAnonKey = 'sb_publishable_wD_gKc2Doa_LXu8YLoZOcw_RczMuK-J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export { supabaseUrl, supabaseAnonKey };
