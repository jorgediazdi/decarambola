# Memoria — Lo que pides para el Duelo (revisar antes de subir)

Documento de referencia para ver siempre lo que estás pidiendo antes de subir a producción.

---

## Pantallas y uso

- **Móvil:** El jugador lleva el tablero (no hay cámara del club). **Sin transmisión** — no mostrar espacio ni mensaje de stream.
- **TV (club):** Pantallas del local **con** espacio para **streaming en el centro**. La única diferencia móvil vs TV es: TV lleva el espacio de transmisión en la mitad; móvil no lleva video.

---

## Diseño responsive

- **Todo el tamaño debe ser responsive.** Una sola lógica: escalar con la pantalla.
- **Bolas (círculos):** Tamaño **proporcional al rectángulo/columna** que ocupan. Proporción coherente con las otras columnas.
- **Tres columnas en TV:** Casi del **mismo tamaño** (1fr 1fr 1fr). Centro = stream, misma proporción que las dos laterales.
- **Móvil:** Solo **2 columnas** (J1 | J2), sin columna central.

---

## Contenido y controles

- **Mesa, tiempo, reloj, Finalizar, Siguiente set:** Solo **arriba** (barra superior). No duplicar en el centro.
- **Botón "Siguiente set":** Para quien juega dos partidas seguidas sin cerrar tiempo. **No resetea el tiempo de liquidación** (facturación).
- **Control del jugador activo:** **Todo el recuadro grande** (panel completo) es el control; al pasar al otro jugador, igual — todo el recuadro.
- **Nombre del jugador:** No pegado a las bolas; espacio suficiente debajo del nombre.

---

## Estadísticas

- **TV:** Estadísticas (entrada, promedio, serie, s.mayor) **alrededor de la bola** (arriba y abajo).
- **Móvil:** Estadísticas **debajo de la bola**, bien legibles y números más grandes.

---

## Colores y estilo

- Integrar con el CSS de la página (variables --oro, --negro, etc.). No que el duelo se vea “otra app”.
- Si el club tiene diseño “front asiático”, los colores se pueden alinear por variables (oro, negro, acentos).

---

## URLs para probar antes de subir

- Duelo completo: `http://localhost:9090/duelo.html`
- Solo fase 2 (pantalla de juego): `http://localhost:9090/duelo.html?demo=1`
- Fase 2 en TV: `http://localhost:9090/duelo.html?vista=tv&demo=1`
- Preview TV 24": `http://localhost:9090/duelo-tv-preview.html`

---

## Checklist antes de subir

- [ ] Probar en móvil: 2 columnas, sin video, bolas proporcionales.
- [ ] Probar en TV (o vista=tv): 3 columnas iguales, stream en el centro, bolas proporcionales.
- [ ] Barra superior: mesa, tiempo, reloj, Finalizar, Siguiente set solo arriba.
- [ ] Todo el recuadro del jugador es clicable (cambio de turno).
- [ ] Siguiente set no resetea el tiempo de liquidación.

---

*Actualiza este archivo cuando añadas o cambies requisitos; así siempre tienes en un solo sitio “lo que estoy pidiendo” antes de subir.*
