# Paso 1 — Verificar que PQRS se guarda en Supabase

Checklist para comprobar que el flujo de Joe (Contacto / PQRS) escribe correctamente en la tabla `pqrs` de Supabase.

---

## Antes de probar

1. **Tabla creada:** En Supabase → SQL Editor, ejecutaste `supabase_pqrs_contactos.sql` (tabla `pqrs` existe).
2. **core.js:** En el proyecto, `SUPABASE_URL` y `SUPABASE_KEY` en core.js son los de tu proyecto (Settings → API en Supabase).

---

## Pasos de verificación

1. Abre **Sensei** (o index → Joe — Contacto / PQRS, o `Sensei.html?contacto=1`).
2. Entra en **Joe — Contacto y PQRS** (menú o enlace).
3. Completa el flujo:
   - Nombre: p. ej. *Prueba*
   - Contacto: tu correo o teléfono
   - Mensaje: p. ej. *Es una sugerencia para mejorar la plataforma*
4. Envía el último mensaje.
5. Debe aparecer el mensaje de Joe: *"Tu mensaje ha quedado registrado en la plataforma..."* (si hay error de red, verás el mensaje de respaldo local).
6. En **Supabase** → **Table Editor** → tabla **pqrs**:
   - Debe existir una fila nueva.
   - Columnas: `nombre`, `contacto`, `mensaje`, `tipo` (peticion|queja|reclamo|sugerencia), `estado` = `pendiente_revision`, `created_at`.

---

## Si no aparece la fila

- Revisa la **consola del navegador** (F12 → Console): si hay `[Joe] Supabase pqrs insert failed`, mira el error.
- Comprueba **RLS** en la tabla `pqrs`: debe haber una política que permita INSERT con la anon key (p. ej. "allow all" en desarrollo).
- Comprueba que la **anon key** en core.js es la correcta (no la service_role).

---

## Siguiente paso

Cuando la verificación sea correcta, sigue con **Paso 2: Pantalla admin para ver y autorizar PQRS** (ya implementado: `pqrs_admin.html`, enlace en MI CLUB → Gestionar PQRS).
