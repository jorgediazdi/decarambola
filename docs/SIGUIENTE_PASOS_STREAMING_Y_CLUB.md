# Siguientes pasos — Streaming + portal club

> **QA cada vez que subes build:** **`docs/QA_STREAMING.md`** (YouTube + OBS + overlay + URLs).

Documento corto para **no mezclar** lo operativo (probar hoy) con el **backlog** (después de cerrar lo anterior).

---

## 1) ¿El streaming es “admin”?

**No.** El **backoffice** (`admin/`) es equipo plataforma (PQRS, tareas internas).

**Transmitir** es **operación de sala / torneo**: **OBS** en el PC del club + **YouTube** como destino. La app solo prepara **URLs** (marcador, preview, overlay) que OBS incrusta.

---

## 2) Activar prueba de transmisión (checklist)

1. **YouTube Studio** → Crear → Transmitir en directo → copiar **clave de transmisión**.  
   Guía: `CONFIGURAR_YOUTUBE.md`
2. **OBS** → Configuración → Transmisión → **YouTube** → pegar clave → **Iniciar transmisión** cuando quieras salir al aire.
3. **Marcador en OBS** (recomendado para composición cámara + hueco transparente):  
   Fuente **Navegador** → URL pública, por ejemplo:  
   `https://TU-DOMINIO/duelo-tv-preview.html?obs=1`  
   Activar **fondo transparente**. Detalle: `LISTO_STREAMING_ESTA_NOCHE.md`, `STREAMING_QUE_SE_TRANSMITE.md`, `docs/OBS_DUELO_TV.md`
4. **Cámara** debajo del navegador en la misma escena (captura de vídeo).
5. **Overlay barra** (opcional): `overlay_marcador.html?match_id=...&rec=1` o `&interval=30` / `120` según `STREAMING_QUE_SE_TRANSMITE.md`

La web **no** inicia el YouTube Live por ti: quien **envía** video es **OBS**.

---

## 3) Backlog (después de lo que ya acordamos) — lo que comentaste

| Tema | Idea | Estado en repo |
|------|------|----------------|
| **Todo en YouTube + guardar** | Directo va a YouTube; VOD queda en el canal. En BD lo razonable es guardar **URL** (embed/watch) y/o **ID** de vídeo como texto — **no** el archivo de vídeo; el archivo **sigue en YouTube**. Enlazar eso al **torneo o partida** | **Pendiente producto** (modelo datos + pantalla jugador) |
| **ID nuevo para el jugador** | Ej. código corto o `watch?v=VIDEO_ID` asociado al evento para que encuentre el vídeo | **Pendiente** |
| **MUX** | Torneos especiales o **pago**; segunda herramienta | **Fase posterior** |
| **Audio / derechos** | Política: **sin música de fondo** en el local que entre al micrófono; en OBS **silenciar** fuentes con música; solo audio “seguro” en **directos de torneo** (voz, mesa, sin playlist) | **Operativo + reglas**; no solo código |
| **Duelo TV** embed en marcador | `duelo-tv.html?stream=https://www.youtube.com/embed/VIDEO_ID` | Ya documentado en `CONFIGURAR_YOUTUBE.md` |

---

## 4) No puedo entrar al portal club completo

El portal **`/club/index.html`** está protegido por `js/club-portal-gate.js`:

- Hace falta **sesión Supabase** y rol **`club_admin`** o **`superadmin`**, y para `club_admin` también **`club_id`** en `profiles`.
- El **PIN** de la app principal **no** abre este portal.

**Para probar solo la UI sin tocar roles:**

- Abre:  
  `https://TU-DOMINIO/club/index.html?dev=1`  
  Eso activa modo dev y muestra el contenido (sin sustituir un login real en producción).

**Para flujo real:**

1. `auth.html` → iniciar sesión con cuenta staff.  
2. En Supabase: fila en `profiles` con `role` y `club_id` según `docs/FIX_PROFILES_ROLE_SUPABASE.md` y `docs/PASO1_RLS_MESAS.md`.  
3. Si no ves nombre/logo del club: `docs/SQL_CLUBS_LEER_PORTAL.md`.

---

## 5) Orden sugerido

1. Cerrar **bugs/UI** que ya tenés en curso.  
2. **Probar portal** con `?dev=1` o cuenta `club_admin` real.  
3. **Probar YouTube** con OBS + checklist de arriba.  
4. Luego **backlog**: ID de vídeo para jugador + persistencia en BD + MUX si aplica.
