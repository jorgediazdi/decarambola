# Configurar YouTube — DeCarambola

> **Checklist de pruebas tras subir versión:** `docs/QA_STREAMING.md`

Guía paso a paso para **transmitir en vivo a YouTube** desde OBS y, opcionalmente, **mostrar un stream de YouTube** en el marcador.

---

## Parte 1 — Transmitir a YouTube (OBS → YouTube)

### 1. Habilitar transmisión en vivo en YouTube

1. Entra a **https://studio.youtube.com**
2. Inicia sesión con la cuenta con la que quieras transmitir.
3. En el menú izquierdo: **Crear** (icono de cámara con +) → **Transmitir en directo**.
4. Si es la primera vez, YouTube puede pedir **verificar tu canal** (número de teléfono, etc.). Complétalo.
5. Cuando esté listo, verás la pantalla de **Configuración del stream** o **Streaming**.

### 2. Obtener la clave de transmisión

1. En **YouTube Studio** → **Crear** → **Transmitir en directo**.
2. En la configuración del evento (o en **Configuración del stream**), busca **Clave de transmisión** (Stream key).
3. Pulsa **Copiar** para copiar la clave (es larga, tipo `xxxx-xxxx-xxxx-xxxx`).
4. **No la compartas** en público; es como una contraseña de tu canal.

### 3. Configurar OBS para YouTube

1. Abre **OBS Studio**.
2. Menú **Configuración** (o **Settings**) → **Transmisión** (o **Stream**).
3. **Servicio:** elige **YouTube - Transmisión en directo** (o **YouTube - RTMPS**).
4. **Clave de transmisión:** pega la clave que copiaste.
5. Pulsa **Aceptar** (o **OK**).
6. Para empezar a transmitir: en OBS, botón **Iniciar transmisión** (o **Start Streaming**).

### 4. En YouTube Studio (mientras transmites)

- En **Transmitir en directo**, cuando OBS esté enviando señal, verás la vista previa y podrás pulsar **Ir en vivo** para que el público vea el stream.
- Puedes poner **título** y **descripción** del directo antes de ir en vivo.

---

## Parte 2 — Mostrar un stream de YouTube en el marcador (opcional)

Si quieres que **dentro de la pantalla del marcador** (Duelo TV) se vea un vídeo o stream de YouTube en el recuadro central:

### Obtener la URL de embed de tu directo

1. Cuando estés **transmitiendo** (o tengas un vídeo en vivo), abre la **página del vídeo** en YouTube.
2. Pulsa **Compartir** → **Insertar** (o **Incorporar**).
3. Copia la URL que aparece en `src="..."`, por ejemplo:  
   `https://www.youtube.com/embed/ABCD1234`  
   o con parámetros:  
   `https://www.youtube.com/embed/ABCD1234?autoplay=1`

### Usar la URL en Duelo TV

1. Abre **duelo-tv.html** (en tu sitio o local).
2. En la **Fase 1** (registro), en el campo **URL del stream (opcional)** pega la URL de embed, por ejemplo:  
   `https://www.youtube.com/embed/TU_VIDEO_ID?autoplay=1`
3. Completa jugadores y opciones y pulsa **Iniciar partida**.
4. En la vista del marcador, el recuadro central mostrará el stream de YouTube.

También puedes abrir directamente:  
`https://tu-sitio.com/duelo-tv.html?stream=https://www.youtube.com/embed/TU_VIDEO_ID`

---

## Resumen rápido

| Qué quieres hacer              | Dónde |
|--------------------------------|--------|
| Transmitir OBS → YouTube       | OBS: Configuración → Transmisión → YouTube → pegar clave |
| Clave de transmisión           | YouTube Studio → Crear → Transmitir en directo → Configuración del stream |
| Ver YouTube en el marcador     | duelo-tv.html → campo "URL del stream" o `?stream=...` |

---

## Problemas frecuentes

- **"La transmisión no inicia"**: Comprueba que la clave esté pegada completa, sin espacios. En OBS, servidor suele ser el por defecto (YouTube).
- **"No se ve el vídeo en el marcador"**: Usa la URL de **embed** (`youtube.com/embed/...`), no la URL normal del vídeo.
- **Retraso en vivo**: En YouTube Studio puedes ajustar el retraso (p. ej. hasta 120 s); en overlay_marcador puedes usar `?interval=120` para refrescos más espaciados.
