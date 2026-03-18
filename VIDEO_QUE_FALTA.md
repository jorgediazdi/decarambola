# Video — Qué queda (además de conectar YouTube)

Resumen de todo lo que implica **video** en el proyecto y qué falta por hacer además de poner la clave de YouTube en OBS.

---

## 1. Duelo TV / OBS — flujo del video

| Paso | Qué es | ¿Lo tienes? |
|------|--------|-------------|
| **Marcador en OBS** | Fuente **Navegador** con `duelo-tv-preview.html` (o `?obs=1` para transparencia). | Según PASOS_DUELO_TV_INICIO.md |
| **Cámara en OBS** | Fuente **Captura de dispositivo de vídeo** (Insta360 u otra). Puesta **debajo** del Navegador para que se vea por el hueco transparente. | Cámara conectada + añadida en OBS |
| **Conectar YouTube** | En OBS: Transmisión → YouTube → pegar clave de stream. | Lo que dices que falta |

El **video** que ve la gente es: **cámara + marcador**. YouTube es solo **dónde se envía** esa señal.

---

## 2. Qué te queda de video (fuera de YouTube)

- **Cámara en OBS**  
  - Cámara conectada al PC (USB, etc.).  
  - En OBS: **Añadir fuente** → **Captura de dispositivo de vídeo** → elegir la cámara.  
  - En la escena: esa fuente **debajo** de la fuente Navegador (para que se vea por el centro transparente).

- **URL con transparencia en OBS**  
  - Que la fuente Navegador use algo como:  
    `.../duelo-tv-preview.html?obs=1`  
  - Y en propiedades del Navegador: **Fondo transparente** activado.

- **(Opcional) Stream dentro de la página**  
  - Si quieres mostrar un stream (ej. YouTube) **dentro** del marcador en vez de la cámara de OBS:  
  - `duelo-tv.html?stream=https://www.youtube.com/embed/XXXXX`  
  - o en preview:  
  - `duelo-tv-preview.html?stream=https://www.youtube.com/embed/XXXXX`  
  - Eso es **opcional**; el flujo normal es cámara en OBS + marcador.

- **(Opcional) Supabase**  
  - Solo si quieres que el marcador se actualice en tiempo real desde la base. No es obligatorio para que el video funcione.

---

## 3. Resumen: qué falta de video además de YouTube

1. **Cámara** conectada y como **fuente de vídeo** en OBS, detrás del marcador.  
2. **URL del marcador** en OBS con `?obs=1` y **fondo transparente** activado.  
3. **Conectar YouTube** en OBS (clave de transmisión) cuando quieras emitir en vivo.

Todo lo demás (duelo-tv, duelo-tv-preview, overlay) ya está en el proyecto. El único “video” que falta por configurar fuera de YouTube es: **cámara en OBS** y **transparencia** del Navegador.
