/**
 * Script Node: lista clubes desde Supabase.
 *
 * Requisitos:
 *   npm install
 *
 * Creá un archivo .env en la raíz (ver .env.example) y ejecutá:
 *   node check_club.js
 *
 * Nota: usa ANON para lectura pública; SERVICE_ROLE solo en tu máquina (.env en .gitignore).
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        'Falta SUPABASE_URL y una key en .env (ANON o SERVICE_ROLE para script local).'
    );
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getClubData() {
    // Columnas alineadas a docs/SCHEMA_CLUBS.sql (no pedimos `pin` por consola)
    const { data, error } = await supabase
        .from('clubs')
        .select(
            [
                'id',
                'nombre',
                'codigo',
                'ciudad',
                'departamento',
                'pais',
                'activo',
                'logo_url',
                'color_primario',
                'deporte',
                'dominio',
                'subdominio',
                'admin_email',
                'whatsapp',
                'created_at'
            ].join(', ')
        )
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al consultar:', error.message);
        process.exit(1);
    }

    console.table(data || []);
}

getClubData();
