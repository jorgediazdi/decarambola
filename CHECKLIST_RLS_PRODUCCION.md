# Checklist RLS Producción

## Antes de ejecutar el SQL
- [ ] Hacer backup del proyecto en Supabase Dashboard → Settings → Backups
- [ ] Confirmar que hay al menos 1 usuario con role = 'superadmin' en tabla profiles
- [ ] Tener abierta una sesión de Supabase Dashboard durante la ejecución

## Ejecutar en Supabase SQL Editor (en este orden)
- [ ] Correr supabase_rls_produccion.sql completo
- [ ] Si hay error: leer el mensaje, NO volver a correr todo — corregir solo la línea
- [ ] Correr supabase/verificar_rls.sql y confirmar que todas las tablas
      tienen rowsecurity = true

## Verificar después de ejecutar
- [ ] Login en auth.html funciona con usuario real
- [ ] Club admin solo ve sus propias mesas
- [ ] Jugador solo ve su propio historial
- [ ] PQRS admin requiere login, no acepta PIN
- [ ] Sensei puede insertar en pqrs sin estar logueado

## Si algo se rompe
- Supabase Dashboard → SQL Editor → correr:
  `ALTER TABLE [tabla_problema] DISABLE ROW LEVEL SECURITY;`
- Eso desactiva RLS solo en esa tabla mientras se corrige la política
