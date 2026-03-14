# QA — Deploy en Netlify (DeCarambola)

Checklist para montar en Netlify y comprobar que nada quede roto tras los últimos cambios.

---

## 1. Configuración Netlify

- **netlify.toml** ya está: `publish = "."` (sin build).
- **\_redirects**: existe; sin reglas que afecten rutas (cada `.html` y `.js` se sirve por su nombre).
- En el dashboard de Netlify:
  - **Build command**: dejar vacío.
  - **Publish directory**: `.` (raíz del repo).
  - **Branch**: la que uses para deploy (p. ej. `main`).

---

## 2. Cambios recientes verificados

| Cambio | Archivo | Comprobación |
|--------|---------|--------------|
| Logo por rol (organizador = DE CARAMBOLA, club/jugador = logo club) | index.html | `actualizarLogoHeader()`, `logo-decarambola`, `header-logo-club` |
| Mesas en panel Organizador | index.html | Enlaces a mesas.html, mesas_config.html, reservas_admin.html, historial.html |
| Enlace Configurador | index.html | `Configurador%20formato.html` (antes Configurador_formato.html) |

---

## 3. Pruebas manuales (después del deploy)

### Index (página principal)

- [ ] Carga sin errores en consola (F12).
- [ ] Logo: al abrir **ORGANIZADOR** se ve logo DE CARAMBOLA; al abrir **JUGADOR** o **MI CLUB** se ve logo del club (si hay whitelabel).
- [ ] Panel Organizador → existe la sección **MESAS E INSTALACIONES DEL CLUB** con Salón en vivo, Configurar instalaciones, Reservas, Historial.
- [ ] Panel MI CLUB → misma sección Mesas visible.
- [ ] Clic en **Salón en vivo** → abre `mesas.html`.
- [ ] Clic en **Configurar instalaciones** → abre `mesas_config.html`.

### Navegación desde index

- [ ] Perfil, Duelo, Inscripciones, Torneos, Ranking, Posiciones, Certificados.
- [ ] **Configurador formato** → abre `Configurador formato.html` (sin 404).
- [ ] Sensei → abre `Sensei.html`.

### Scripts

- [ ] core.js carga (sin 404).
- [ ] session.js carga.
- [ ] whitelabel.js carga.

### Otras páginas críticas (una por una)

- [ ] duelo.html
- [ ] perfil.html
- [ ] posiciones.html
- [ ] control_torneo.html
- [ ] mesas.html
- [ ] mesas_config.html

---

## 4. Consola del navegador

- Abrir F12 → pestaña **Console**.
- Navegar por index, cambiar de panel, abrir 2–3 páginas.
- [ ] No debe haber errores rojos (algún aviso amarillo de red/caché es aceptable).

---

## 5. Si algo falla en Netlify

- **404 en un .html**: comprobar que el archivo está en la raíz (o en la ruta que usas) y que el nombre coincide (incluidos espacios → `%20` en la URL).
- **404 en core.js / whitelabel.js**: comprobar que están en la raíz del directorio de publish.
- **Logo no cambia**: comprobar que `session_rol` se guarda (Application → Local Storage) al abrir cada panel.
- **Mesas no cargan datos**: revisar Supabase (tablas creadas con `supabase_mesas_instalaciones.sql`, RLS, CORS si aplica).

---

## 6. Resumen

- Enlace a **Configurador formato** corregido.
- **Logo por rol** y **Mesas en panel Organizador** ya están en index.
- Netlify: publish `.`, sin build; **\_redirects** sin reglas que corten rutas.
- Tras el deploy, seguir esta checklist para validar que nada esté roto.
