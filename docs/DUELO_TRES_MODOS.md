# Duelo — tres formas de usar la misma base (`duelo-tv.html`)

Todo vive en **un solo archivo** (`duelo-tv.html`) para no duplicar lógica del marcador. La diferencia es el **modo** por URL:

| Modo | URL | Qué es |
|------|-----|--------|
| **TV / mesa** | `/duelo-tv.html` o `?modo=tv` | Igual que la señal **Premium TV**: marcador vertical, **sin columna de cámara** en pantalla (ideal proyector). |
| **Móvil (solo marcador)** | `/duelo-tv.html?modo=movil` | Marcador **en dos columnas** (J1 \| J2), sin cámara. En Fase 1 **no** se muestran URLs de YouTube: solo un **checkbox** para autorizar la transmisión que el club guardó para la mesa. |
| **Producción (cámara / grabar)** | `/duelo-tv.html?modo=produccion` | Mismo marcador, pero **sí** se muestra el bloque de **stream + cámara + grabar** para quien lleva su equipo para anotar y transmitir. |

- **Fase 1** = pantalla de configuración (jugadores, metas). Siempre empezás ahí salvo que ya hayas iniciado partida en esa sesión.
- **SIG. SET** = botón en la **barra superior** durante el marcador; reinicia el set sin cerrar la partida entera.

**Preview clásico** (otro layout): `duelo-tv-preview.html`.

**Política de cambios:** no mezclar “jugador” y “producción” sin aviso: usá siempre el `?modo=` correcto o los enlaces del portal `club/duelo_premium_tv.html`.
