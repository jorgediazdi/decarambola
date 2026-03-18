# Contexto del proyecto DeCarambola y PQRS — Base para el agente

Este documento es la **fuente de verdad** para que una IA (Cursor, Sensei con **API Gemini**, o bot) pueda actuar como **agente de administración** del proyecto: conocer el producto, los involucrados, **aprender con la utilización de los usuarios**, proponer mejoras para que el producto evolucione, y **manejar PQRS con autorización del administrador de la plataforma**.

---

## 1. Qué es DeCarambola

- **Producto:** Plataforma web para **billar tres bandas** (y modalidades libre/snooker): clubes, torneos, duelo en vivo, ranking, Sensei (IA de enseñanza).
- **Producción:** decarambola.com (despliegue manual vía Netlify).
- **Tecnología:** HTML/CSS/JS estático; `core.js` como núcleo; overlay para OBS/streaming.
- **Datos hoy:** Se usa **localStorage** para torneos, partida activa, PQRS/contactos guardados, etc. **Supabase** ya se usa (clubes, jugadores, torneos, inscripciones, partidas, mesas). Ver **`docs/SUPABASE_RECOMENDACIONES_EXPERTO.md`** para buenas prácticas y tabla PQRS; el objetivo es que Supabase sea la fuente de verdad y no depender de localStorage.
- **Sensei (IA):** Backend con **API de Gemini**. La utilización de los usuarios en el Sensei (chat, biblioteca, analizar jugada) debe servir para que el sistema aprenda y se propongan mejoras; las respuestas a PQRS deben al menos **ser autorizadas por el admin de la plataforma** antes de darse por válidas o publicarse.

---

## 2. Roles e involucrados

| Rol | Quién | Qué hace / necesita |
|-----|--------|----------------------|
| **Jugador** | Usuario que juega en el club | Perfil, partidas (duelo), entrenamiento, inscripciones, retos, ranking, certificados, consultar Sensei. |
| **Sensei (usuario)** | Mismo jugador u otro | Consultar al **Sensei** solo para **temas de juego** (chat IA con Gemini): técnicas, sistemas, biblioteca, analizar jugada. |
| **Joe (contacto / PQRS)** | Cualquier usuario | Agente **Joe** para **contacto, PQRS e información de la plataforma y servicios de administración**. Misma pantalla que Sensei (menú o enlace) pero identidad distinta: Joe pide datos para contactar y gestiona PQRS; Sensei solo billar. |
| **Organizador** | Responsable del torneo | Crear torneo, inscripciones, control de partidas, brackets, posiciones, certificados. **No** gestiona mesas ni sede. |
| **Árbitro / asistente** | Persona en la mesa sin pantalla administrativa | Recibe link desde Control torneo (duelo-tv.html?torneo=…&partida=…&arbitro=1) para anotar y enviar resultado desde el móvil. |
| **Administrador del club** | Dueño o gestor del club | Acceso con clave en index (“Soy administrador del club”). Ve **MI CLUB**: sede, personalizar, mesas, reservas, historial, código invitación; **no** ve Jugador/Sensei. **No** es el admin de la plataforma. |
| **Superadmin (admin de la plataforma)** | Responsable de DeCarambola | Acceso con **clave distinta** (en pqrs_admin.html o enlace “Admin plataforma (superadmin)” en el footer). Solo el superadmin ve y autoriza **PQRS** (tabla pqrs en Supabase). El admin del club no tiene acceso a Gestionar PQRS. |
| **Desarrollador / mantenedor** | Quien mantiene el repo | Código en “DE CARAMBOLA SUITE.”; no tocar index/core/overlay sin cuidado (Duelo TV, OBS). |

---

## 3. Módulos principales y documentación existente

- **index.html** — Portal por roles (Jugador, Sensei, Organizador, MI CLUB); modo admin con clave; enlaces a todo.
- **duelo-tv.html** — Duelo TV Premium (Fase 1: registro; Fase 2: marcador + video/stream). Puede abrirse desde Control torneo o con link árbitro.
- **duelo-tv.html / overlay_marcador.html** — Para OBS/streaming; no modificar sin revisar impacto.
- **control_torneo.html** — Lista de partidas, iniciar duelo, resultado manual, **link para árbitro/móvil**.
- **Sensei.html** — Chat con IA, biblioteca, analizar jugada; Diagramas (ocultos hasta estar operativos).
- **core.js** — Lógica compartida: MasterVIP (torneos, partidas, resultados), SESSION (timeouts por rol), etc.
- **Documentación en raíz:** varios `.md` (QA_*, MEMORIA_*, PASOS_*, LISTO_*, etc.) para QA, streaming, mesas, flujos.

El agente debe **recomendar leer** los `.md` relevantes cuando la pregunta sea sobre flujos, QA o despliegue.

---

## 4. PQRS — Definición y cómo debe actuar el agente

### 4.1 Qué son las PQRS en este proyecto

- **P**eticiones: solicitudes de información, acceso, funcionalidad o documentación.
- **Q**uejas: malestar por fallas de uso, errores en pantalla, datos incorrectos o mala experiencia.
- **R**eclamos: exigencia de corrección (bug, resultado mal registrado, acceso denegado, etc.).
- **S**ugerencias: ideas de mejora (nueva pantalla, integración, flujo, contenido del Sensei).

Involucrados que pueden generar PQRS: jugadores, organizadores, árbitros, administradores de club, y usuarios del Sensei.

### 4.2 Principios de respuesta del agente

1. **Clasificar** cada mensaje en P, Q, R o S (y combinar si aplica).
2. **Responder en español**, con tono claro y útil.
3. **No inventar** funcionalidades que no existan; indicar “hoy no está disponible” o “está previsto en documentación” si aplica.
4. **Derivar a documentación** cuando exista: por ejemplo QA_*.md, PASOS_*.md, CONTEXTO_PROYECTO_Y_PQRS.md.
5. **Para bugs o reclamos técnicos:** guiar a reproducir (pasos, navegador, pantalla) y sugerir anotar en un issue o lista de pendientes si la persona tiene acceso al repo.
6. **Para sugerencias:** agradecer, resumir la idea y sugerir que quede por escrito (doc o issue) para priorizar.
7. **Plazos:** si el usuario pide “cuándo se resuelve”, el agente no debe comprometer fechas; puede decir “se priorizará según la lista de mejoras del proyecto”.

### 4.3 Autorización del superadmin (admin de la plataforma)

**Las respuestas a PQRS deben quedar, al menos, autorizadas por el superadmin** (admin de la plataforma), **no** por el admin del club. Flujo:

1. Usuario/envío: la PQRS se registra (Joe en Sensei → tabla `pqrs` en Supabase).
2. Borrador (opcional): Gemini puede proponer un borrador de respuesta.
3. **Superadmin autoriza:** solo quien tenga la **clave de superadmin** entra en `pqrs_admin.html`, revisa y autoriza (o rechaza) la respuesta.
4. Solo tras esa autorización se considera la respuesta válida o se publica/envía al usuario.

El **admin del club** no es el admin de la plataforma: no ve ni gestiona PQRS; eso es rol de **superadmin**.

### 4.4 Dónde puede “vivir” el registro de PQRS (recomendación)

- **Opción A (rápida):** Carpeta `docs/pqrs/` con archivos por año o por tipo (peticiones.md, quejas.md, etc.) o un solo `REGISTRO_PQRS.md` donde se anoten fecha, tipo, resumen, estado y **autorización (pendiente / autorizado por admin)**. El agente puede indicar “anota esto en docs/pqrs/”.
- **Opción B (más adelante):** Base de datos (Supabase) o integración con correo/forms; el agente explicaría cómo enviar y dónde se centralizan; el flujo de autorización del admin puede ser un campo “estado” (pendiente_revision / autorizado / rechazado).

Para que el agente “lleve” el proyecto, es suficiente con que **sepa** que existe (o existirá) un lugar como `docs/pqrs/` y que **nunca dé por cerrada una PQRS sin que conste autorización del admin** (o indicar “pendiente de autorización”).

---

## 5. Qué debe hacer el agente (resumen)

- **Administrar:** Conocer la estructura del proyecto, roles y módulos; sugerir cambios de flujo o archivos solo cuando tenga contexto (p. ej. leyendo este doc y los .md citados).
- **Manejar PQRS:** Clasificar, responder con claridad, derivar a documentación, sugerir registro en `docs/pqrs/` (o el canal que se defina).
- **Responder PQRS:** Siempre dar una respuesta útil (información, pasos a seguir, o “no existe aún, se puede anotar como sugerencia”).

---

## 7. Dónde está esta información (para la IA)

- **Este archivo:** `docs/CONTEXTO_PROYECTO_Y_PQRS.md` — contexto completo proyecto + PQRS + autorización admin.
- **Gemini, uso y PQRS:** `docs/GEMINI_USO_Y_PQRS.md` — aprendizaje con la utilización de usuarios, mejoras para evolución, flujo PQRS con autorización.
- **Raíz del repo:** `AGENTS.md` — descripción breve del proyecto y del rol del agente (administrar y PQRS).
- **Regla Cursor:** `.cursor/rules/decarambola-agente.mdc` — aplica este contexto cuando se hable de administración o PQRS.

Si la IA está “conectada” desde el Sensei (API Gemini) o desde Cursor con este repo abierto, debe usar **este documento** y **AGENTS.md** como base, y **GEMINI_USO_Y_PQRS.md** para aprendizaje por uso y flujo de autorización del admin.
