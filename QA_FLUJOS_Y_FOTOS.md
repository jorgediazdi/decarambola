# QA — Flujos y soluciones de fotos

## 1. Textos / pantallas de las fotos (solucionado)

| Foto / pantalla | Problema (texto o comportamiento) | Solución aplicada |
|-----------------|-------------------------------------|-------------------|
| **Page not found** | 404 en Netlify, enlace roto | Creado `404.html` con mensaje en español y botón "IR AL INICIO". Netlify lo sirve automático. |
| **MI HISTORIAL** | Todo en 0, parecía error | Texto aclaratorio: "Las sesiones se registran al usar las mesas del club." Los datos vienen de `mesas_historial` en Supabase. |
| **Certificado** | "0 JUGADORES" y fecha 14/3/2028 | Si no hay inscritos se muestra "Cupo X" o "Torneo". Fecha futura errónea se corrige a fecha actual. |
| **REGLAS** | "No se ha definido reglamento." | Si el torneo no tiene reglamento custom, se muestra reglamento generado (objetivo, tiempo, sistema de puntos, etc.). |
| **Admin / Config sede** | Overlay "Collaborate / Log in" tapa contenido | Es del navegador (autocompletado). No editable desde la app; el usuario puede cerrarlo con la X. |
| **Duelo scoreboard** | No estaba en 3 columnas como la referencia | Rediseño en 3 columnas: J1 \| Centro (reloj, controles, stream) \| J2. |

---

## 2. Duelo en TVs del club — video obligatorio y mesa ↔ cámara

- **Mesa y cámara con la misma referencia:** En la configuración del duelo:
  - **Mesa:** número o nombre (ej. 1, Mesa A) — misma referencia que la ubicación física en el local.
  - **URL cámara de esta mesa:** stream/cámara de esa mesa (Mesa 1 = cámara 1 = misma ubicación).
- **Vista TV del club:**
  - Abrir en el TV: `duelo-tv.html` (Fase 1 registro, luego vista TV) o pantalla ≥ 1024px.
  - En vista TV el **video siempre se muestra** (obligatorio): zona de stream visible y más grande.
  - Si no hay URL de cámara: se muestra "Mesa X — Conecte la cámara de esta mesa".
- **Móvil:** sin video por defecto; botón "Ver transmisión en vivo" abre el stream en modal.

---

## 3. Checklist QA — Flujos

### Organizador
- [ ] Inicio → Organizador → Crear Torneo (va a `torneo_crear.html`, no a ranking/inscripciones).
- [ ] Inicio → Inscripciones (con club activo).
- [ ] Inicio → Control de torneo (con torneo activo; sin torneo: mensaje claro).
- [ ] Inicio → Llaves / Brackets (va a `Brackets.html`).
- [ ] Posiciones → pestaña REGLAS: se ve reglamento (custom o generado).
- [ ] Certificados: fecha y texto de jugadores correctos (no "0 JUGADORES" ni año erróneo).

### Club / sede
- [ ] Configuración de sede (admin): PIN, anuncio en slider, mesas, disposición.
- [ ] Sin torneo activo: Control de torneo y Posiciones muestran mensaje "No hay torneo activo" o similar.
- [ ] Duelo en TV: abrir `duelo-tv.html`, en Fase 1 configurar jugadores, Mesa + URL cámara (o mesa para stream), Iniciar partida → se ve el video de la mesa.

### Jugador
- [ ] Sin club: Inscripciones y Ranking muestran bloqueo "Afiliación obligatoria".
- [ ] Con club: Mi historial (si no hay sesiones en `mesas_historial`, se ve 0 y el texto de sesiones).
- [ ] Reto: poder identificar con cédula en la misma pantalla; no sacar al menú si ya está inscrito.
- [ ] Entrenar: botón Finalizar visible y flujo hasta resumen.
- [ ] Duelo en móvil: scoreboard 3 columnas; "Ver transmisión" si hay URL.

### Sensei
- [ ] Conexión con API (sensei-billar-api.onrender.com): chat y análisis responden.
- [ ] Audio (TTS): listo para uso.
- [ ] Mañana: videos con OBS; Fase 1 streaming (ej. video como “Mesa 1”), Fase 2 repetición últimos 2 min / jugadas mejores para resumen.

### Overlay
- [ ] Overlay de marcador: URL con `?match_id=UUID`; datos cada 3 s desde API; OBS/Streamlabs como fuente Navegador.
- [ ] Vista overlay funcionando en emisión.

---

## 4. Resumen

- **Fotos con texto:** 404, historial, certificado, reglamento y navegación (Crear Torneo, Llaves) corregidos o aclarados.
- **Duelo TVs del club:** Vista TV con video obligatorio; mesa y cámara enumeradas con la misma referencia de ubicación en el local.
- **QA:** usar esta checklist para validar flujos organizador, club y jugador, Sensei (audio listo; mañana OBS/videos) y overlay.
