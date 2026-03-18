# Mesa 2 + cámara: cómo se ve y por qué a veces no se ve en el rectángulo

---

## Cómo funciona

- **Mesa 2** está ligada a **esa cámara**. Lo que hagas en el marcador (puntos, entradas) es lo que se muestra en el video/stream.
- El **rectángulo central** del Duelo es donde debe verse la cámara. Según dónde abras la página, la imagen de la cámara viene de un sitio u otro.

---

## Dónde abres la página

### 1. En el navegador (Chrome, etc.) — duelo-tv-preview.html

Ahí el rectángulo puede mostrar la cámara de **dos maneras**:

| Forma | Qué hacer |
|------|-----------|
| **Stream por URL** | Abre con `?stream=...` la URL del stream (ej. YouTube). Ejemplo: `duelo-tv-preview.html?stream=https://www.youtube.com/embed/XXXX` |
| **Cámara del PC (webcam)** | Al cargar, la página intenta conectar la cámara del equipo. Si no pide permiso o falla, aparece el botón **«Mostrar cámara Mesa 2»** — hay que hacer clic para activar la cámara. |

Si **ya no ves la cámara en el rectángulo** en el navegador:

- Si usas **webcam:** comprueba que diste permiso a la cámara (Chrome: icono de candado/info en la barra de direcciones → Permisos). Si abres el archivo con `file://`, algunos navegadores bloquean la cámara; prueba con `http://localhost` o con `https://decarambola.com/duelo-tv-preview.html`.
- Si usas **stream:** revisa que la URL lleve `?stream=...` y que el enlace del stream siga siendo válido.

### 2. En OBS (Fuente Navegador con ?obs=1)

En OBS, con **duelo-tv-preview.html?obs=1**, el rectángulo del Duelo está **transparente**. La cámara **no** sale del propio navegador: la imagen que se ve ahí es la de **otra fuente de OBS** (la cámara) puesta **detrás** del navegador.

Si **ya no ves la cámara en el rectángulo** en OBS:

- La cámara debe ser una fuente aparte: **Captura de dispositivo de vídeo** (o “Dispositivo de captura de vídeo”).
- Esa fuente tiene que estar **debajo** del “Navegador” en la lista de fuentes (así se ve por el hueco transparente).
- Comprueba que la fuente de la cámara esté **habilitada** (casilla activada) y que el dispositivo sea el correcto (Insta360 u otra).
- Si la cámara se desconectó, en OBS quita la fuente y vuélvela a añadir eligiendo de nuevo el dispositivo.

---

## Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Mesa 2 con la cámara = lo del marcador se ve en el video? | Sí. Lo que se mueve en el marcador es lo que debe mostrarse en el video. |
| ¿Por qué no veo la cámara en el rectángulo del Duelo? | **En el navegador:** revisar permiso de cámara o URL de `?stream=`, y botón «Mostrar cámara Mesa 2» si hace falta. **En OBS:** revisar que la fuente “Cámara” exista, esté debajo del Navegador y activa. |
