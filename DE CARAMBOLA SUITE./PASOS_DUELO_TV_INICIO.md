# Lo que necesitamos para Duelo TV — Paso a paso (con certeza)

Este documento define **con certeza** todo lo necesario y el orden exacto para poner en marcha Duelo TV (marcador + cámara + OBS + opcional Supabase).

---

## 1. Lo que SÍ necesitamos (lista experta)

### En tu computador
- [ ] **Carpeta del proyecto** en un solo lugar (ej. `DE CARAMBOLA SUITE.` en Escritorio).
- [ ] **Archivos mínimos**:
  - `duelo-tv-preview.html`
  - `assets/logo-decarambola.svg`
- [ ] **Navegador** Chrome o Edge (recomendado para OBS).
- [ ] **OBS Studio** instalado.

### Para que el marcador se vea (sin servidor)
- [ ] Abrir el HTML **desde la misma carpeta** donde está `assets/`:
  - Doble clic en `duelo-tv-preview.html`, **o**
  - En OBS: Fuente Navegador → URL = ruta completa al archivo, ej.  
    `file:///Users/buysell/Desktop/DE%20CARAMBOLA%20SUITE./duelo-tv-preview.html`
- [ ] Las rutas de imágenes son **relativas** (`assets/logo-decarambola.svg`). No hace falta servidor web para ver el logo.

### Para la cámara (Insta360) en OBS
- [ ] **Cámara** conectada (USB o la que uses).
- [ ] En OBS: una fuente **Captura de dispositivo de vídeo** (o **Dispositivo de captura de vídeo**) apuntando a esa cámara.
- [ ] El **diseño** de `duelo-tv-preview.html` tiene la zona central en **16:9**, transparente, para que en OBS pongas la cámara **detrás** de la capa del navegador.

### Opcional: estadísticas en tiempo real (Supabase)
- [ ] Cuenta en **Supabase** y un proyecto creado.
- [ ] **URL del proyecto** (ej. `https://xxxx.supabase.co`) y **Anon key** (desde Supabase → Settings → API).
- [ ] Una **tabla** (ej. `mesa_activa`) con las columnas que quieras mostrar (p1, p2, e1, e2, promedios, mesa, etc.).
- [ ] **Realtime** activado para esa tabla (Supabase → Database → Replication).
- [ ] En `duelo-tv-preview.html`, rellenar al inicio del script:  
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TABLE_NAME`.

### Opcional: transmitir a YouTube
- [ ] Cuenta de YouTube con **transmisión en directo** habilitada.
- [ ] **Clave de transmisión** (YouTube Studio → Crear → Configuración del stream).
- [ ] En OBS: Configuración → Transmisión → Servicio YouTube, pegar la clave.

---

## 2. Orden de pasos para iniciar (paso a paso)

### Paso 1 — Comprobar que el marcador se ve
1. Ve a la carpeta del proyecto (donde está `duelo-tv-preview.html` y la carpeta `assets/`).
2. Abre `duelo-tv-preview.html` con doble clic (o arrastra al navegador).
3. **Comprueba**: logo "De Carambola" visible arriba; dos columnas de jugadores y en el centro el recuadro "16:9 — Cámara Insta360 (OBS detrás)".
4. Si el logo no se ve: asegúrate de que exista la carpeta `assets` y dentro `logo-decarambola.svg` en la **misma carpeta** que el HTML.

### Paso 2 — OBS: solo el marcador
1. Abre **OBS Studio**.
2. En la escena, añade una fuente **Navegador** (Browser).
3. En **URL** pon:
   - **Si es aplicación en el escritorio** (archivo local, sin servidor):  
     `file:///Users/buysell/Desktop/DE%20CARAMBOLA%20SUITE./duelo-tv-preview.html`  
     (sustituye por la ruta real de tu carpeta; espacios → `%20`).
   - **Si la app corre en un servidor**:  
     `http://localhost:9090/duelo-tv-preview.html` (o la URL de tu host).
4. **Ancho:** 1920 · **Alto:** 1080 (o el tamaño de tu lienzo OBS).
5. Deja **Fondo transparente** desactivado por ahora (solo marcador).
6. **Comprueba:** en la vista previa de OBS se ve el mismo marcador que en el navegador (dos columnas de jugadores y recuadro central).

### Paso 3 — OBS: añadir la cámara detrás
1. En OBS, **clic derecho** en la fuente **Navegador** → **Propiedades** (o doble clic).
2. Cambia la **URL** para usar modo transparente (añade **?obs=1** al final). Según cómo uses la app:
   - **Si es una aplicación en el escritorio** (abres el HTML con doble clic, sin servidor):  
     `file:///Users/buysell/Desktop/DE%20CARAMBOLA%20SUITE./duelo-tv-preview.html?obs=1`  
     (sustituye la ruta por la carpeta real donde está tu proyecto; los espacios → `%20`).
   - **Si la app corre en un servidor** (localhost o en la nube):  
     `http://localhost:9090/duelo-tv-preview.html?obs=1`  
     o `https://tu-dominio.com/duelo-tv-preview.html?obs=1`
3. Activa la casilla **Fondo transparente** (Transparent background) en la misma ventana de propiedades.
4. Aceptar. Si hace falta, **clic derecho** en la fuente Navegador → **Actualizar** para recargar.
5. En la **misma escena**, añade una nueva fuente: **Captura de dispositivo de vídeo** (o **Dispositivo de captura de vídeo**) y elige tu cámara (ej. Insta360).
6. En la lista de fuentes de la escena, **arrastra la cámara debajo** del Navegador (así la cámara queda **atrás** y el marcador delante).
7. Con la cámara seleccionada, **redimensiona** (esquinas) para que llene todo el lienzo.
8. La **zona central** del marcador es transparente: por ahí se verá la mesa/cámara.
9. Ajusta posición o escala de la cámara hasta que el marco del marcador no tape la mesa.

### Paso 4 — (Opcional) Conectar Supabase
1. En Supabase: crea la tabla (ej. `mesa_activa`) con columnas para: jugadores, p1, p2, e1, e2, promedios, mesa, etc.
2. Activa Realtime para esa tabla.
3. En `duelo-tv-preview.html`, abre el archivo y busca las líneas de `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TABLE_NAME`. Rellénalas y guarda.
4. (Opcional) Para Realtime nativo, carga antes el SDK de Supabase en el HTML:  
   `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`  
   y crea el cliente con tu URL y anon key.
5. Recarga el HTML en OBS (clic derecho en la fuente Navegador → Actualizar). Los cambios de la base deberían reflejarse en el marcador; sin conexión se usan los últimos datos en localStorage.

### Paso 5 — (Opcional) Transmitir a YouTube
1. En OBS: Configuración → Transmisión → YouTube, pega la clave de transmisión.
2. Iniciar transmisión cuando quieras salir al aire.

---

## 3. Resumen de certeza

| Necesario | Qué es |
|-----------|--------|
| **Carpeta única** | Donde están `duelo-tv-preview.html` y `assets/`. |
| **Rutas relativas** | Logo = `assets/logo-decarambola.svg` (ya está así en el HTML). |
| **OBS** | Fuente Navegador (marcador) + Fuente Cámara (detrás). |
| **Zona 16:9** | Centro del HTML transparente; ahí va la cámara en OBS. |
| **Supabase** | Solo si quieres que el marcador se mueva desde la base; si no, el HTML funciona igual sin servidor. |

Si sigues estos pasos en orden, tienes la certeza de lo que hace falta para iniciar. Cualquier paso que falle se puede aislar (por ejemplo: “Paso 1 OK, Paso 2 el logo no carga” → revisar que `assets/logo-decarambola.svg` exista y la ruta sea relativa).
