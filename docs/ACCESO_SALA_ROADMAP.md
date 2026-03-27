# Acceso a sala / club — estado y roadmap

## Ahora (acceso libre)

- **`js/sala-supabase-gate.js`** → `OPEN_ACCESS_PUBLIC = true`  
  Las pantallas que usan `guardSalaPage()` no exigen login ni email.
- **`mesas_config.html`** (apps y raíz) → `DC_SALA_OPEN_ACCESS = true`  
  El asistente “Configurar instalaciones” no depende solo de `club_admin` / PIN en `localStorage`.
- **`js/club-portal-gate.js`** → `OPEN_ACCESS_PUBLIC = true`  
  Portal `/club/` sin login (ajustar cuando cierres acceso).

## Después (restricción + email)

Objetivo: solo personal identificado (Supabase Auth + email verificado) y rol en `profiles` (`club_admin` / `superadmin` con `club_id`).

1. Poner **`OPEN_ACCESS_PUBLIC = false`** en `sala-supabase-gate.js` y revisar `checkStaffAccess()` (ya contempla sesión + `profiles`).
2. Alinear **`DC_SALA_OPEN_ACCESS = false`** en `mesas_config` y decidir si el gate local (admin/PIN) se mantiene como complemento o solo Supabase.
3. En **Supabase**: políticas RLS para `mesas_config`, `mesas`, `clubs` según `auth.uid()` y `profiles`.
4. Probar flujo: **auth.html** → email → pantallas de sala.

## Checklist rápido al cerrar acceso

- [ ] `OPEN_ACCESS_PUBLIC` + `DC_SALA_OPEN_ACCESS` documentados y en `false` donde corresponda.
- [ ] Portal club (`club-portal-gate`) coherente con el mismo criterio.
- [ ] Prueba en móvil: sin sesión → no entra o mensaje claro; con sesión staff → entra.
