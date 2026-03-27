-- Post-ejecución: pegar en Supabase SQL Editor y revisar resultados

-- Tablas con RLS activo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Todas las políticas activas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Verificar funciones public.current_club_id_*
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%club_id%';
