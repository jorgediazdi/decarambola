# Puntos que faltan (de todo lo que se dijo)

Resumen de lo **hecho** y lo que **sigue pendiente** según la conversación y la documentación del proyecto.

---

## ✅ Hecho

| Tema | Estado |
|------|--------|
| Joe (contacto/PQRS) como agente distinto al Sensei | ✅ Menú y flujo Joe, identidad separada |
| Insert de PQRS en Supabase desde Sensei (paso 3 Joe) | ✅ Tabla `pqrs`, anon key de core.js, inferirTipoPQRS, respaldo en localStorage |
| Superadmin ≠ admin del club | ✅ pqrs_admin solo con clave superadmin; enlace en footer; quitado de MI CLUB |
| Pantalla para ver y autorizar PQRS | ✅ pqrs_admin.html: listar, filtrar, Autorizar/Rechazar, respuesta_texto |
| Cargar torneos desde Supabase al abrir Control torneo | ✅ `cargarTorneosNube()` en onload de control_torneo.html |
| Documentación contexto + PQRS + Gemini | ✅ CONTEXTO_PROYECTO_Y_PQRS.md, GEMINI_USO_Y_PQRS.md, AGENTS.md, regla Cursor |
| Recomendaciones Supabase | ✅ SUPABASE_RECOMENDACIONES_EXPERTO.md, supabase_pqrs_contactos.sql |
| Paso 1 verificación PQRS | ✅ docs/PASO_1_VERIFICAR_PQRS_SUPABASE.md (checklist para ti) |
| SESSION en varias pantallas | ✅ Inscripciones, torneo_crear, reto_crear, Configurador formato añadidos; resto ya tenía verificarAlCargar/iniciar |
| Cámara por mesa y parametrización dispositivos | ✅ Cada mesa amarrada a su cámara: `mesas.url_camara`; UI en instalacion_ficha.html (sección “Cámara y dispositivos”); `MasterVIP.getStreamUrlMesa(clubId, numeroMesa)` en core.js; doc `docs/MESAS_CAMARA_DISPOSITIVOS.md`. |

---

## ❌ Pendiente (lo que falta)

### Corto plazo (mencionado como siguiente)

1. ~~**Documentar tablas Supabase en un solo sitio**~~  
   ✅ **Hecho:** `docs/SUPABASE_TABLAS.md` creado con lista de tablas (clubs, jugadores, torneos, inscripciones, partidas, ranking_historico, mesas_*, pqrs) y columnas clave.

2. ~~**Sincronizar club en Supabase desde admin_sede**~~  
   ✅ **Hecho:** Se creó `admin_sede.html` (la página estaba referenciada en index pero no existía). Al guardar se actualiza localStorage (wl_club_*, club_activo, CLUB_CONFIG) y se hace **PATCH** a `clubs` si el club ya tiene `id`, o **INSERT** si fue creado solo en local (para que “unirse por código” y whitelabel vean los mismos datos). Logo: imagen local o URL; opcional subir a Supabase Storage más adelante.

3. ~~**PWA mínima**~~  
   ✅ **Hecho:** `manifest.json` (nombre, short_name, theme_color, background_color, icon.svg), `icon.svg` (logo tipo tres bandas), `sw.js` (install/activate mínimos para que sea instalable). En index.html: enlace al manifest, theme-color, favicon icon.svg y registro del service worker.

4. ~~**Completar QA de sesión**~~  
   ✅ **Hecho:** Se añadió `SESSION.verificarAlCargar` / `SESSION.iniciar` en: **inscripciones.html** (jugador), **torneo_crear.html** (organizador), **reto_crear.html** (jugador), **Configurador formato.html** (organizador, más core.js). Ya tenían sesión: control_torneo, mesas, reservas, organizador, perfil, ranking, torneos, historial, posiciones, torneo_amigos, reportes, socios, mesas_config, instalacion_ficha, historial_mesas; duelo (partida para árbitro). No aplica: certificado_ver (vista pública sin core.js), index (portal de entrada). Brackets.html no está en el repo.

### Medio plazo (recomendaciones / doc)

5. ~~**RLS en producción (Supabase)**~~  
   ✅ **Hecho:** `docs/RLS_PRODUCCION.md` (estrategia en dos fases: sin Auth seguir filtrando por club_id en la app; con Auth, ejecutar script) y `supabase_rls_produccion.sql` (políticas por `app_metadata.club_id`, funciones `public.current_club_id_text/uuid`, tablas clubs, jugadores, torneos, inscripciones, partidas, ranking_historico, mesas_*, pqrs). Ejecutar el script **solo** cuando tengas Supabase Auth y guardes `club_id` en el JWT.

6. ~~**Enviar la respuesta al usuario cuando el superadmin autoriza**~~  
   ✅ **Hecho:** En `pqrs_admin.html`, cuando una PQRS queda en estado **autorizado** y tiene `respuesta_texto`, se muestra un bloque **“NOTIFICAR AL USUARIO”** con: (1) texto sugerido de respuesta (saludo + tipo + cuerpo + agradecimiento), (2) botón **COPIAR TEXTO** (usa `navigator.clipboard` o prompt) y (3) botón **ABRIR WHATSAPP/CORREO** que detecta si el contacto es email (`mailto:`) o teléfono (link `wa.me`). La tabla `pqrs` sigue siendo la fuente de verdad; el envío real (mail/WhatsApp) lo hace el superadmin usando ese texto.

7. ~~**MEJORAS_SUGERIDAS.md**~~  
   ✅ **Hecho:** Creado `docs/MEJORAS_SUGERIDAS.md` con secciones: desde uso del Sensei, desde PQRS, otras mejoras, hecho/cerrado. Tablas con columnas Mejora sugerida, Origen, Prioridad, Notas. Referencia a GEMINI_USO_Y_PQRS.

8. ~~**Aprendizaje con la utilización (Sensei/Gemini)**~~  
   Registrar uso (consultas, temas, “¿te sirvió?”) en el backend de la API Gemini y generar informe periódico para el admin. Hecho: sensei-backend/ en repo (POST /uso, GET /informe); Sensei.html con SENSEI_USO_API y "¿Te sirvió?". Ver sensei-backend/README.md.

### Largo plazo / opcional

9. **Migraciones SQL ordenadas**  
   Un único `schema.sql` o scripts numerados (01_clubs.sql, 02_jugadores.sql, …) para recrear el esquema en cualquier entorno.

10. **Login opcional (Supabase Auth)**  
    Mantener cédula y añadir email/contraseña para cuenta recuperable.

11. **Notificaciones push**  
    Avisos de partida/torneo (Web Push + Supabase o similar).

12. **Pagos**  
    Integrar pasarela (Stripe, Mercado Pago, etc.) para inscripciones o reservas.

13. **Docker para la API**  
    Contenerizar el backend del Sensei (Gemini) para despliegue reproducible; el front puede seguir en Netlify sin Docker.

---

## Resumen rápido

- **Hecho:** Joe, PQRS en Supabase, superadmin, pantalla PQRS, cargar torneos en control_torneo, documentación contexto/PQRS/Gemini/Supabase, verificación paso 1, SUPABASE_TABLAS.md, admin_sede.html con PATCH/INSERT a clubs, PWA mínima (manifest, icon.svg, sw.js), QA de sesión (SESSION), RLS producción (doc + script), notificar PQRS al usuario (pqrs_admin), MEJORAS_SUGERIDAS.md, backend de uso del Sensei (sensei-backend) y "¿Te sirvió?" en Sensei; **cámara por mesa** (url_camara en mesas, instalacion_ficha.html, getStreamUrlMesa en core.js, docs/MESAS_CAMARA_DISPOSITIVOS.md).
- **Falta (prioritario):** Nada pendiente en corto plazo.
- **Falta (siguiente):** Nada pendiente en medio plazo; opcional: desplegar sensei-backend y asignar SENSEI_USO_API en Sensei.html.

Si quieres, el siguiente paso concreto puede ser uno de los de “Falta (prioritario)” (por ejemplo completar QA de sesión o RLS).
