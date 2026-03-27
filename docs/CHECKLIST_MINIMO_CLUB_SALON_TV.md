# Checklist mínimo: club → salón → tarifas → TV (Premium / OBS / YouTube)

Guía **en orden** para dejar operativo el billar: marca, mesas, cobro por tiempo, señal en pantalla y cámara por mesa. Sustituí `TU-DOMINIO` por el tuyo (ej. `decarambola.com`).

---

## MI CLUB y Portal club: ¿es lo mismo?

**Sí, es el mismo menú de gestión**, solo cambia **desde dónde entrás**:

| Entrada | URL típica | Notas |
|--------|------------|--------|
| **MI CLUB** | Desde el **inicio** de la app (`index.html`) — tarjeta / sección embebida | Misma rejilla de accesos (salón, reservas, torneos, TV…). |
| **Portal club** | `https://TU-DOMINIO/club/` o `club/index.html` | **Pantalla completa** del mismo hub; más cómodo en el club. |

No hace falta repetir pasos en los dos: configurás **una vez** y aplica en todo el sitio (mismo `localStorage` / mismo usuario).

---

## Orden recomendado (no saltear)

### 1 · Cuenta y club “real” en el sistema

1. En el **inicio** → afiliarte / **unirte con el código** del club (o crear club si el flujo lo permite).
2. Tocá tu club en **Mis clubes** para dejarlo **activo** (así `mi_perfil.club_id` queda con el **código** del club — necesario para reservas, mesas y tarifas).
3. Si administrás el local: **“Soy administrador del club”** + PIN (abajo en el inicio), para ver **MI CLUB** completo.

**Marca (nombre, logo, color):**  
`https://TU-DOMINIO/apps/club/sala/admin_sede.html` — **Configurar sede**.

---

### 2 · Salón e instalaciones (plano + mesas)

1. **Configurar instalaciones** (asistente por pasos):  
   `https://TU-DOMINIO/apps/club/sala/mesas_config.html`  
   - Paso 1: **nombre del salón** (obligatorio) + filas/columnas.  
   - Pasos 2–4: tipo de mesa, cantidad, **tarifas base** (también se pueden afinar después en Tarifas).
2. Guardar al final → crea configuración y mesas en base (según tu Supabase).

**Operación diaria:**  
`https://TU-DOMINIO/apps/club/sala/mesas.html` — **Salón en vivo** (abrir/cerrar uso, estados).

---

### 3 · Tarifas para liquidar por tiempo ($/minuto)

El sistema liquida por **minutos reales** según tarifa efectiva + descuentos (ver textos en pantalla).

1. **Rápido:** `https://TU-DOMINIO/apps/club/sala/tarifas_salon.html` — edita tarifa hora, franjas, % sin pasar todo el asistente.
2. **Completo:** ya en el paso 4 de **mesas_config** o combinando **tarifas_salon** + lo guardado en `mesas_salon_config`.

**Reportes:** `apps/club/sala/reportes.html` — apoyo para cierre.

---

### 4 · Cámara + TV por mesa (imagen correcta en Duelo / stream)

1. Abrí **Ficha de instalación** por mesa:  
   `https://TU-DOMINIO/apps/club/sala/instalacion_ficha.html`  
   (desde Salón en vivo tocando una mesa, o con `?id=` de la mesa si ya tenés el enlace).
2. En **“Cámaras y dispositivos”** cargá **URL(s) HTTPS** de cada cámara o stream estable.
3. La **primera** URL es la que usa por defecto Duelo / transmisión (`url_camara` + `urls_camaras` en Supabase).

Detalle técnico: `docs/MESAS_CAMARA_DISPOSITIVOS.md`.

**Importante:** `mi_perfil.club_id` debe ser el **mismo código** que en `mesas.club_id` (ver `docs/CANON_CLUB_ID.md`), si no la app no encuentra la mesa/cámara.

---

### 5 · Duelo TV “Premium”, OBS y YouTube

Todo apunta a las **mismas páginas** del repo; vos armás la **escena en OBS** y YouTube recibe lo que OBS **Transmite**.

| Qué necesitás | Dónde está en la app |
|---------------|----------------------|
| Menú de modos (TV / móvil / producción) | `https://TU-DOMINIO/club/duelo_premium_tv.html` |
| Señal tipo **TV / proyector** | `duelo-tv.html?modo=tv` |
| **Producción** (cámara + anotar + stream) | `duelo-tv.html?modo=produccion` |
| Vista previa / hueco transparente OBS | `duelo-tv-preview.html` (y `?obs=1` si aplica) |
| **Overlay** solo marcador | `overlay_marcador.html` |

- **YouTube:** no es una pantalla aparte en la app: en **OBS** → fuente de captura / navegador con la URL de arriba → **Iniciar transmisión** a tu clave de YouTube.
- Receta corta overlay: `OVERLAY_EN_OBS.md` y `STREAMING_QUE_SE_TRANSMITE.md` en la raíz del repo.
- Modos explicados: `docs/DUELO_TRES_MODOS.md`.

---

### 6 · Reservas (cuando el club ya está vinculado)

`https://TU-DOMINIO/apps/club/sala/reservas_admin.html` — solo tiene sentido con **club activo** y código en perfil (paso 1 de este checklist).

---

## Resumen en 6 líneas

1. **Inicio** → club activo + admin si aplica.  
2. **Configurar sede** → marca.  
3. **Configurar instalaciones** → salón y mesas.  
4. **Tarifas** → cobro por tiempo.  
5. **Ficha de cada mesa** → URLs de cámara/TV.  
6. **Duelo Premium TV** → elegir modo → OBS → YouTube.

---

## Si algo “no enlaza”

- **404:** rutas deben llevar `/apps/club/sala/...` (ver `docs/URLS_SIN_404_NETLIFY.md`).
- **“Sin club” en reservas:** reactivar club en inicio y código en `mi_perfil` (mismo string que en Supabase).
- **Caché al subir carpeta a Netlify:** subir **todo** el sitio; subir `Version.js` y `sw.js?v=` en `index.html` cada deploy (ver `docs/DEPLOY_Y_CACHE.md`).

---

## Documentos relacionados

- `docs/GUIA_CLUB_DESDE_CERO.md` — visión general club.  
- `docs/CLUB_LOGO_Y_URLS_SALA.md` — URLs fijas sala.  
- `docs/CANON_CLUB_ID.md` — un solo tipo de `club_id`.  
- `NOTA_SALON_EN_VIVO.md` — Salón en vivo.
