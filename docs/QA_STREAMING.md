# QA — Streaming (YouTube Studio + OBS + overlay)

**Checklist única** para validar después de **subir una versión** al servidor.  
Las guías técnicas detalladas siguen en los archivos enlazados abajo; **no duplicar** procedimientos aquí.

---

## Política de documentación (streaming)

| Rol | Archivo |
|-----|---------|
| **QA post-deploy (este archivo)** | Pruebas sí/no, URLs, fotos |
| **Cómo configurar** | `CONFIGURAR_YOUTUBE.md` (YouTube + embed en marcador) |
| **Capas OBS / qué se transmite** | `STREAMING_QUE_SE_TRANSMITE.md` |
| **Guía rápida escena OBS** | `LISTO_STREAMING_ESTA_NOCHE.md` |
| **Overlay en OBS** | `OVERLAY_EN_OBS.md` |
| **Duelo TV + OBS** | `docs/OBS_DUELO_TV.md` |
| **Backlog producto** (ID vídeo jugador, MUX, etc.) | `docs/SIGUIENTE_PASOS_STREAMING_Y_CLUB.md` |
| **Resumen “qué falta” de video** | `VIDEO_QUE_FALTA.md` (se mantiene; la QA no lo reemplaza) |

**Datos:** en tablas/config suele guardarse una **URL** (y a veces el ID como texto). El **vídeo no se sube a tu base**: sigue en **YouTube** (u otro host).

Si un doc queda desactualizado, **corrígelo** o indica “histórico”; **no** borrar por iniciativa de una pasada de limpieza sin acuerdo del dueño.

---

## Pre-requisitos (una vez por entorno)

- [ ] Dominio publicado (ej. `decarambola.com`) y **misma URL** que usarás en OBS.
- [ ] YouTube: canal con **transmisión en vivo** habilitada (verificación si la pide YouTube).
- [ ] OBS instalado; escena de prueba guardada.

---

## Checklist — Tras desplegar nueva versión

### A. Archivos vivos (no 404)

Sustituí `BASE` por tu origen (ej. `https://decarambola.com`).

| # | URL | Esperado |
|---|-----|----------|
| A1 | `BASE/duelo-tv.html` | Carga Fase 1 / flujo duelo |
| A2 | `BASE/duelo-tv-preview.html?obs=1` | Marcador; modo OBS (transparencia si aplica) |
| A3 | `BASE/overlay_marcador.html` | Página overlay (puede verse vacía sin `match_id`) |
| A4 | `BASE/duelo-tv.html?stream=https://www.youtube.com/embed/VIDEO_ID` | *Opcional:* prueba embed (pon un `VIDEO_ID` real de tu canal) |

- [ ] A1–A4 OK en **móvil** y **desktop** (o al menos desktop para OBS).

**Foto sugerida:** captura de A2 en navegador con `?obs=1` visible en la barra de direcciones.

---

### B. OBS — Fuente Navegador (marcador)

- [ ] Fuente **Navegador** apunta a `BASE/duelo-tv-preview.html?obs=1` (no a `file://` en producción, salvo prueba local).
- [ ] **Fondo transparente** activado en esa fuente.
- [ ] **Cámara** en capa inferior; se ve mesa por el hueco del marcador.
- [ ] Vista previa de OBS sin errores en consola (F12 en fuente navegador si hace falta).

**Foto sugerida:** captura de la escena completa en OBS.

---

### C. OBS — Overlay (opcional)

- [ ] Si usas API: URL del tipo `BASE/overlay_marcador.html?match_id=TU_UUID&rec=1` (o `interval=30` / `120`). Ver `STREAMING_QUE_SE_TRANSMITE.md`.
- [ ] Fondo transparente; posición correcta (ej. barra abajo).

**Foto sugerida:** stream de prueba con barra visible.

---

### D. YouTube Studio + salida al aire

- [ ] **Clave de transmisión** pegada en OBS → Transmisión → YouTube (no compartir en público).
- [ ] **Iniciar transmisión** en OBS → en Studio aparece preview / **Ir en vivo** según tu flujo.
- [ ] El **vídeo público** muestra lo mismo que la vista previa (retraso normal 10–120 s).

**Foto sugerida:** YouTube en vivo + OBS en segundo plano (sin mostrar la clave).

---

### E. Audio y derechos (operativo)

- [ ] Sin música de fondo en el local que entre al micrófono si no tienes licencia.
- [ ] En OBS: fuentes de audio revisadas (silenciar escritorio / Spotify si aplica).

---

### F. Regresión rápida app (relacionada)

- [ ] `control_torneo.html` carga lista/cuadro (no spinner infinito) con torneo con rondas.
- [ ] `duelo-tv.html` — flujo iniciar partida sin error JS en consola.

---

## Si algo falla tras el deploy

1. **404 / rutas:** `QA_NETLIFY.md`, `_redirects`, `netlify.toml`.
2. **Marcador en blanco:** consola del navegador (fuente OBS); probar URL en Chrome aparte.
3. **Overlay sin datos:** `match_id` válido y API/interval según docs.

---

## Estado

- Última revisión pensada para: **cada subida de versión** a producción.
- Mantener **una** checklist de fotos global: `QA_FLUJOS_Y_FOTOS.md` (sección streaming puede remitir aquí).
