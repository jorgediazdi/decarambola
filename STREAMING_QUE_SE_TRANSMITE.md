# Qué se transmite con el overlay

Así queda montado para **saber qué lleva la señal** cuando grabas o transmites a YouTube.

---

## 1. Contenido de la señal (OBS)

Lo que sale en **Grabación** o **Transmisión** es:

| Capa en OBS (de atrás a adelante) | Qué es |
|-----------------------------------|--------|
| **Cámara** (Captura de dispositivo de vídeo) | Mesa / Insta360. |
| **Navegador 1** — `duelo-tv-preview.html?obs=1` | Marcador (J1 | hueco transparente | J2). Por el hueco se ve la cámara. |
| **Navegador 2** (opcional) — `overlay_marcador.html?match_id=...` | Barra de marcador (nombres, puntos, meta) si usas API. |

Es decir: **se transmite la cámara + el marcador (y opcionalmente la barra overlay)**. Todo lo que ves en la vista previa de OBS es lo que se graba y lo que iría a YouTube.

---

## 2. Refresco del overlay al grabar / en vivo

- **Grabando (OBS):** para no saturar ni cargar el buffer, el overlay que pide datos a la API **no debe refrescarse más de cada 30 segundos**.
  - **Cómo:** usa el overlay con `?rec=1` o `?interval=30`:
    - `overlay_marcador.html?match_id=XXX&rec=1`  
    - o `overlay_marcador.html?match_id=XXX&interval=30`
  - Así el overlay actualiza cada **30 s** mientras grabas.

- **En vivo en YouTube:** en el video de YouTube puedes usar hasta **120 segundos** de retraso/buffer si lo configuras en YouTube; el overlay en OBS puede seguir en 30 s (`rec=1` o `interval=30`) o subir a 120 s si quieres:
  - `overlay_marcador.html?match_id=XXX&interval=120`

---

## 3. Resumen de URLs

| Uso | URL del overlay (ejemplo) |
|-----|---------------------------|
| Grabación (≤ 30 s refresh) | `.../overlay_marcador.html?match_id=XXX&rec=1` o `&interval=30` |
| En vivo YouTube (hasta 120 s) | `.../overlay_marcador.html?match_id=XXX&interval=120` (opcional) |
| Por defecto (3 s) | `.../overlay_marcador.html?match_id=XXX` |

Con esto sabes **qué transmites** (cámara + marcador + overlay opcional) y **cómo** tener el refresco a 30 s al grabar y hasta 120 s en YouTube si lo quieres.
