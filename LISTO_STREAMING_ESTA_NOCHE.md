# Listo para streaming esta noche (conectar YouTube)

- **TV en la mesa:** no necesita overlay; solo el marcador/cámara que ya tienes.
- **Streaming (esta noche):** mismo marcador + cámara en OBS, y **sí** quieres tener el overlay listo para cuando conectes YouTube.

---

## Qué tener listo antes de conectar YouTube

### 1. OBS — Escena de streaming
- [ ] Fuente **Navegador** con la URL del marcador en transparente:
  - Local: `file:///.../duelo-tv-preview.html?obs=1`
  - O si está en servidor: `https://decarambola.com/duelo-tv-preview.html?obs=1`
- [ ] En esa fuente Navegador: **Fondo transparente** activado.
- [ ] Fuente **Cámara** (Captura de dispositivo de vídeo) **debajo** del Navegador, rellenando el hueco.
- [ ] En la vista previa de OBS se ve: marco del marcador + mesa/cámara por el centro.

### 2. Overlay para el stream (opcional)
Si quieres la **barra de marcador** (overlay_marcador) encima del stream:
- [ ] En OBS, añadir otra fuente **Navegador** con:
  - **Grabando (refresh cada 30 s, mejor buffer):**  
    `https://decarambola.com/overlay_marcador.html?match_id=TU_MATCH_ID&rec=1`  
    o `...&interval=30`
  - **En vivo YouTube (opcional 120 s):**  
    `...?match_id=TU_MATCH_ID&interval=120`
- [ ] Esa fuente: **Fondo transparente** activado, tamaño/posición donde quieras la barra (ej. abajo).
- Si no usas API todavía, puedes omitir este overlay y usar solo el marcador de duelo-tv-preview; los datos se controlan en esa pantalla.
- Detalle: ver **STREAMING_QUE_SE_TRANSMITE.md** (qué se transmite y refrescos 30 s / 120 s).

### 3. Conectar YouTube (esta noche)
- [ ] YouTube Studio → Crear → **Configuración del stream** → copiar **Clave de transmisión**.
- [ ] OBS → **Configuración** → **Transmisión** → Servicio: **YouTube - Transmisión en directo** → pegar la clave.
- [ ] **Aceptar**. Cuando quieras salir al aire: **Iniciar transmisión** en OBS.

---

## Resumen

| Dónde        | Overlay / marcador |
|-------------|--------------------|
| TV en mesa  | No hace falta overlay; con marcador/cámara basta. |
| Streaming   | Marcador (duelo-tv-preview?obs=1) + cámara en OBS; overlay_marcador opcional. |

Para esta noche: con el punto 1 comprobado y el 3 (clave de YouTube en OBS), estás listo para transmitir.
