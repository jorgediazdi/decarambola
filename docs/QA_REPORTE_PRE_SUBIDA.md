# Reporte QA pre-subida a Netlify

**Objetivo:** Comprobar que la carpeta local está al día y listar qué probar **parte a parte** (por proceso, por organización, por club, por jugador) antes de seguir. Dar este reporte antes de continuar.

---

## 0. QA ejecutada (revisión de código) — Hecha por el asistente

Se revisó el código (enlaces, scripts, SESSION, lógica clave) y se rellenaron las casillas que se pueden verificar sin abrir el navegador.

| Comprobación | Resultado |
|--------------|-----------|
| **Enlaces desde index.html** | admin_sede, mesas, mesas_config, reservas_admin, historial_mesas, Configurador formato, torneo_crear, inscripciones, control_torneo, posiciones, Sensei, Joe, pqrs_admin, perfil, ranking, reto_crear, duelo, posiciones, Certificados, Brackets → enlaces presentes. |
| **Archivos que no existen (404 al clicar)** | Ninguno. **Brackets.html** (redirige a control_torneo con vista cuadro/llaves), **Certificados.html** (página certificados + enlace a certificado_ver), **categorias.html** (categorías del deporte y tu categoría), **entrenamiento.html** (Duelo, Sensei, Retos) ya creados. |
| **core.js** | Incluido en: index, inscripciones, duelo, mesas, perfil, Configurador formato, posiciones, reportes, historial_mesas, torneos, organizador, reservas_admin, historial, control_torneo, torneo_crear, ranking, mesas_config, duelo-tv, socios, instalacion_ficha, reto_crear, Sensei, pqrs_admin, duelo-tv-preview. ✅ |
| **session.js** | Incluido donde aplica sesión: mesas, reportes, reservas_admin, historial, mesas_config, socios, instalacion_ficha. Otras páginas usan SESSION pero cargan desde index (organizador) o solo core. |
| **SESSION (verificarAlCargar / iniciar)** | Presente en: perfil, ranking, historial, posiciones, inscripciones, reto_crear, torneos, torneo_amigos, organizador, control_torneo, torneo_crear, Configurador formato, mesas, mesas_config, reservas_admin, reportes, socios, historial_mesas, instalacion_ficha; duelo (iniciar partida para árbitro). ✅ |
| **Cámaras por mesa** | core.js: getStreamUrlMesa y getStreamUrlsMesa; instalacion_ficha: lista_camaras, guardarCamaras, DB.update mesas con urls_camaras y url_camara. ✅ |
| **Duelo TV → stream desde Supabase** | duelo-tv.html (Fase 1) usa MasterVIP.getStreamUrlMesa(clubId, cfg.mesa) cuando no hay URL manual. ✅ |
| **Admin sede → Supabase** | admin_sede.html: PATCH a clubs si hay id, POST (INSERT) si no hay id; actualiza localStorage y WL. ✅ |
| **PQRS superadmin** | pqrs_admin.html: buildMensajeNotificacion, bloque NOTIFICAR AL USUARIO para autorizados con respuesta_texto, COPIAR / ABRIR WHATSAPP/CORREO. ✅ |

**Resumen:** Lógica de cámaras, admin sede, PQRS, sesiones y Duelo está en código. Falta en repo: Brackets.html, Certificados.html, entrenamiento.html, categorias.html (enlaces del index los llevarán a 404).

---

## 1. Estado del repo local (¿listo para subir?)

| Comprobación | Estado | Notas |
|--------------|--------|--------|
| Último commit | `b232a00` — actualizacion carambola suite | |
| Archivos **modificados** (M) sin commit | Varios | Sensei, Version, control_torneo, core, duelo*, historial, index, inscripciones, instalacion_ficha, mesas_config, organizador, overlay_marcador, posiciones, ranking, reto_crear, supabase_mesas_url_camara.sql, torneo_crear |
| Archivos **nuevos** (??) sin commit | Muchos | admin_sede, 404, AGENTS.md, docs/, manifest, sw, icon.svg, pqrs_admin, sensei-backend/, _headers, _redirects, certificado_ver, duelo-tv-preview, Configurador formato, etc. |

**Recomendación:** Hacer **commit** de todo lo que quieras que vaya a Netlify (incl. cámaras por mesa, PWA, admin_sede, pqrs_admin, docs, etc.) y luego subir. Si subes por **arrastre de carpeta** en Netlify, lo que esté en disco es lo que se despliega (no hace falta commit para Netlify drag-and-drop, pero sí para tener historial y rollback).

---

## 2. QA por proceso (uno por uno)

Verificación en código = ✅. Prueba en navegador = pendiente que tú hagas donde ponga "—".

| # | Proceso | Páginas / pasos | Estado |
|---|---------|-----------------|--------|
| 1 | **Inscripciones** | inscripciones.html; core.js; SESSION jugador | ✅ Código OK — Probar en navegador |
| 2 | **Torneo (crear)** | torneo_crear.html; SESSION organizador | ✅ Código OK — Probar en navegador |
| 3 | **Configurador formato** | Configurador formato.html; SESSION organizador | ✅ Código OK — Probar en navegador |
| 4 | **Control torneo** | control_torneo.html; core.js; SESSION organizador | ✅ Código OK — Probar en navegador |
| 5 | **Duelo TV (partida)** | duelo-tv.html; Fase 1 registro + Fase 2 marcador; getStreamUrlMesa en core; stream opcional | ✅ Código OK — Probar en navegador |
| 6 | **Duelo TV / overlay** | duelo-tv.html, overlay_marcador.html existen | ✅ Código OK — Probar en navegador |
| 7 | **Mesas (salón)** | mesas.html; session.js; SESSION organizador | ✅ Código OK — Probar en navegador |
| 8 | **Mesas config** | mesas_config.html; layout filas, metraje | ✅ Código OK — Probar en navegador |
| 9 | **Ficha instalación / cámaras** | instalacion_ficha.html; lista_camaras, guardarCamaras, urls_camaras | ✅ Código OK — Probar en navegador |
| 10 | **Reservas** | reservas_admin.html; core + session | ✅ Código OK — Probar en navegador |
| 11 | **Historial mesas** | historial_mesas.html | ✅ Código OK — Probar en navegador |
| 12 | **PQRS (Joe)** | Sensei.html?contacto=1; core.js; Supabase pqrs | ✅ Código OK — Probar en navegador |
| 13 | **PQRS (superadmin)** | pqrs_admin.html; NOTIFICAR AL USUARIO, buildMensajeNotificacion | ✅ Código OK — Probar en navegador |
| 14 | **Ranking** | ranking.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 15 | **Posiciones** | posiciones.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 16 | **Historial jugador** | historial.html; core + session; SESSION jugador | ✅ Código OK — Probar en navegador |
| 17 | **Retos** | reto_crear.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 18 | **Perfil** | perfil.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 19 | **Certificados** | Certificados.html (enlace a certificado_ver); certificado_ver con QR legible en móvil | ✅ Código OK — Probar en navegador |
| 20 | **Sensei (IA)** | Sensei.html; core.js | ✅ Código OK — Probar en navegador |
| 21 | **Admin sede** | admin_sede.html; PATCH/POST clubs, localStorage, WL | ✅ Código OK — Probar en navegador |

---

## 3. QA por organización (por rol)

Comprobar en navegador que cada rol ve solo lo que debe. En código: index separa portales Jugador / Organizador / MI CLUB; pqrs_admin enlazado solo en footer.

| Rol | Qué debe ver / no ver | Estado |
|-----|------------------------|--------|
| **Jugador** | Duelo, Inscripciones, Retos, Perfil, Ranking, Historial, Posiciones, Sensei. No ve MI CLUB ni Organizador ni pqrs_admin | ✅ Código OK — Probar en navegador |
| **Organizador** | Torneos, Inscripciones, Control torneo, Brackets, Posiciones, Certificados. No ve MI CLUB ni pqrs_admin | ⚠️ Brackets.html y Certificados.html no existen — 404 |
| **Admin del club** | MI CLUB: Admin sede, Mesas, Config salón, Reservas, Historial mesas. No ve pqrs_admin como “admin plataforma” | ✅ Código OK — Probar en navegador |
| **Superadmin** | Solo por enlace/footer a pqrs_admin.html con clave | ✅ Código OK — Probar en navegador |

---

## 4. QA por club (sede y operación del club)

| # | Elemento | Dónde | Estado |
|---|----------|--------|--------|
| 1 | **Admin sede** | admin_sede.html — PATCH/INSERT clubs, localStorage, WL | ✅ Código OK — Probar en navegador |
| 2 | **Config salón** | mesas_config.html — filas, columnas, layout filas, metraje | ✅ Código OK — Probar en navegador |
| 3 | **Mesas en vivo** | mesas.html | ✅ Código OK — Probar en navegador |
| 4 | **Cámaras por mesa** | instalacion_ficha.html — urls_camaras, guardarCamaras | ✅ Código OK — Probar en navegador |
| 5 | **Reservas** | reservas_admin.html | ✅ Código OK — Probar en navegador |
| 6 | **Historial mesas** | historial_mesas.html | ✅ Código OK — Probar en navegador |
| 7 | **Código invitación** | Donde se muestre en MI CLUB (si aplica) | — Probar en navegador |

---

## 5. QA por jugador (uno por uno)

| # | Pantalla / flujo | Archivo | Estado |
|---|-------------------|---------|--------|
| 1 | **Perfil** | perfil.html; core.js; SESSION jugador | ✅ Código OK — Probar en navegador |
| 2 | **Ranking** | ranking.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 3 | **Historial** | historial.html; core+session; SESSION jugador | ✅ Código OK — Probar en navegador |
| 4 | **Inscripciones** | inscripciones.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 5 | **Crear reto / Ver retos** | reto_crear.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 6 | **Torneos (listado)** | torneos.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 7 | **Posiciones** | posiciones.html; SESSION jugador | ✅ Código OK — Probar en navegador |
| 8 | **Sensei** | Sensei.html | ✅ Código OK — Probar en navegador |
| 9 | **Joe / PQRS** | Sensei.html?contacto=1 | ✅ Código OK — Probar en navegador |
| 10 | **Duelo TV (como partida)** | duelo-tv.html (link árbitro o control torneo) | ✅ Código OK — Probar en navegador |

---

## 6. Resumen antes de seguir

- [x] **QA de código hecha:** enlaces, core/session, SESSION, cámaras, admin sede, PQRS, Duelo stream.
- [x] **Brackets, Certificados, categorias, entrenamiento** ya creados. QR en certificado_ver ampliado para lectura con teléfono.
- [ ] Repo local: decidir si haces commit o subes la carpeta tal cual.
- [ ] Probar en navegador (parte a parte) lo que vayas a usar en esta subida.

Con este reporte puedes subir a Netlify. Brackets, Certificados, categorías y entrenamiento ya están en el repo; el QR del certificado está en 220px para leerlo bien con el teléfono.
