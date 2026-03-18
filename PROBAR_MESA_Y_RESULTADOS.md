# Cómo abrir la mesa de esta cámara y colocar resultados

Para probar y poner los resultados en el marcador que corresponde a la cámara que estás usando.

---

## Opción recomendada: una sola ventana (control + lo que se transmite)

Así la misma pantalla que controlas es la que ve la TV / OBS.

1. **Abre el marcador de la mesa** en el navegador:
   - Local: abre **duelo-tv-preview.html** (doble clic o arrastra a Chrome).
   - O desde el sitio: **https://decarambola.com/duelo-tv-preview.html**
   - Por defecto es **Mesa 2**. Si tu cámara es otra mesa, luego puedes cambiarlo en la misma pantalla si añadimos el selector.

2. **En esa misma ventana** verás abajo el **teclado** (1, 2, 3, 4, −, SIGUIENTE ENTRADA). Ahí cargas los puntos y avanzas entradas.

3. **En OBS**, en vez de “Fuente Navegador”, usa **Captura de ventana** (Window capture):
   - Añadir fuente → **Captura de ventana** (o “Ventana”).
   - Elige la ventana de Chrome donde tienes abierto **duelo-tv-preview**.
   - Así lo que haces en esa ventana (marcador + teclado) es exactamente lo que se ve en OBS y en la TV/stream.

4. **Para que en OBS se vea solo el marcador y no el teclado** (y el hueco para la cámara):
   - En esa misma ventana abre la URL con **?obs=1** al final:  
     `duelo-tv-preview.html?obs=1`  
     En modo obs se oculta el placeholder del video; el teclado sigue visible en esa ventana.
   - En OBS puedes recortar la ventana (editar la fuente → recortar) para dejar solo la zona del marcador y no el teclado, **o** usar igualmente “Captura de ventana” y colocar la cámara debajo en la escena, recortando el navegador para que no se vea la parte del teclado.

Resumen: **abres duelo-tv-preview (con o sin ?obs=1) en una ventana → en OBS capturas esa ventana → en esa misma ventana usas el teclado para cargar resultados.** Esa es la mesa que corresponde a esta cámara.

---

## Si usas “Fuente Navegador” en OBS (URL fija)

- En OBS pones una **Fuente Navegador** con la URL (ej. `.../duelo-tv-preview.html?obs=1`). Esa instancia **no** la puedes tocar con el ratón (es solo vista).
- Para cargar resultados necesitas **otra pestaña o ventana** con la misma URL. Hoy el marcador **no** sincroniza entre pestañas (cada una tiene su propio estado).
- Por tanto: para probar y colocar resultados con la fuente Navegador, lo práctico es usar la **Opción recomendada** (una ventana que controlas y que OBS captura con “Captura de ventana”).

---

## Resumen rápido

| Qué quieres | Cómo |
|-------------|------|
| Abrir la mesa de esta cámara | Abre **duelo-tv-preview.html** (o decarambola.com/duelo-tv-preview.html). Es la “Mesa 2” por defecto; misma lógica para otra mesa. |
| Colocar resultados | En esa misma página, usa el **teclado** de abajo (1, 2, 3, 4, −, SIGUIENTE ENTRADA). |
| Que eso sea lo que se transmite | En OBS usa **Captura de ventana** de esa ventana del navegador. Así la mesa que controlas es la que corresponde a la cámara que estás mostrando. |
