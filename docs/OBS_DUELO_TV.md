# OBS + Duelo TV — guía rápida (5 pasos)

> **Política operativa (dueño de plataforma):** el canal oficial DeCarambola solo para eventos **organizados**; cada local transmite lo demás con **su propio canal**. Ver `POLITICA_TRANSMISION_INTERNA.md`. **No compartir** clave de transmisión.

Transmite el marcador **Duelo TV** con OBS hacia YouTube. La página es `duelo-tv.html` (abre el archivo desde tu servidor o carpeta publicada).

---

## 1) Prepara OBS (una vez)

- Instala **OBS Studio**.
- En **Ajustes → Transmisión**, elige **YouTube** y vincula tu canal (o pega la clave de transmisión si ya la usas).
- Crea una **escena** nueva, por ejemplo: `Duelo TV`.

---

## 2) Añade Duelo TV como fuente

- En la escena, **+ → Navegador** (Browser).
- **URL:** la ruta completa a `duelo-tv.html` (ej. `https://tudominio.com/duelo-tv.html` o archivo local si pruebas en tu PC).
- Ancho / alto: por ejemplo **1920 × 1080** (o el tamaño de tu transmisión).
- Marca **Apagar fuente cuando no esté visible** solo si quieres ahorrar CPU; para directo suele dejarse visible.

---

## 3) Configura mesa / club (opcional)

En la **Fase 1** de Duelo TV:

- **Mesa:** número o nombre (cada mesa puede tener su propia config guardada).
- **Marca de agua:** Club / DeCarambola / Off.
- **Modo transmisión asistida:** si está activo, al **Iniciar partida** se puede abrir YouTube Studio en otra pestaña (tú sigues dando **Iniciar transmisión** en OBS).
- **Guardar configuración de esta mesa:** recuerda stream, YouTube Live, asistida y marca de agua **solo para esa mesa y club**.

La caja superior indica: **Club · Mesa · si hay perfil guardado**.

---

## 4) Inicia la partida y el directo

1. En el navegador (o en la vista previa de OBS): completa jugadores y pulsa **Iniciar partida**.
2. En OBS: **Iniciar transmisión** cuando quieras salir al aire.
3. En YouTube Studio verás el preview del live (si ya vinculaste OBS).

> La web **no** puede iniciar el live de YouTube por ti; OBS es quien envía el vídeo. Si OBS ya tiene la clave guardada, no hace falta volver a configurarla cada vez.

---

## 5) Cierra con orden

1. **Detener transmisión** en OBS.
2. En Duelo TV: **Finalizar** o vuelve al menú según el flujo que uses.
3. En YouTube, el directo queda **guardado** como video (según la configuración de tu canal).

---

## Consejos

- **Pantalla completa:** en Duelo TV hay botón para pantalla completa en la TV/monitor.
- **Sin marca de agua:** en Fase 1 elige “Sin marca de agua” o usa `?wm=off` en la URL del navegador.
- **Sin caja de política (punto 1) en pantalla:** añade `?hidepolicy=1` a la URL de `duelo-tv.html` si en OBS quieres ocultar el aviso interno para operadores.
- **Problemas de caché:** recarga la página del navegador (F5) o limpia caché del navegador fuente en OBS.

---

## Pregunta frecuente: ¿un solo canal de YouTube para todos los clubes?

**Sí se puede** técnicamente: todas las sedes usarían el mismo equipo/OBS con la misma cuenta de YouTube. La app no elige el canal; lo define **quién tiene la clave de transmisión** en OBS.

**Riesgos y límites:**

- **Un solo directo a la vez** por clave: dos sedes no pueden transmitir simultáneamente al mismo canal con la misma clave; harían falta otro canal u otro evento.
- **Clave de transmisión:** si circula, alguien podría emitir a tu canal. Trátala como secreta; solo operadores de confianza.
- **Marca y reputación:** todo lo que salga en ese canal afecta a **una** marca; un problema puede afectar al canal entero.
- **Políticas de YouTube:** música, imágenes y contenido deben cumplir normas; quien opera el directo es responsable.
- **Organización:** sin títulos claros o listas de reproducción, mezclar muchos clubes puede confundir a la audiencia.

**Recomendación:** canal central para eventos oficiales, o **un canal por club** si cada sede tiene marca y horarios propios. La misma página `duelo-tv` sirve en todos los casos; solo cambia la cuenta de YouTube configurada en OBS.

---

*DeCarambola — documento interno del proyecto.*
