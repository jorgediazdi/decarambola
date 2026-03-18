# QA — Revisión reciente (post-recuperación)

Revisión realizada tras recuperar archivos y dejar intacto Duelo TV / OBS / overlay.

---

## 1. Cambios aplicados en esta revisión

| Acción | Detalle |
|--------|---------|
| **Configurador formato** | Archivo `Configurador formato.html` recuperado desde la copia; enlaces en `index.html` actualizados a `Configurador%20formato.html` (2 lugares: panel MI CLUB y panel ORGANIZADOR). |
| **_redirects** | Creado en la raíz para Netlify (sin reglas que corten rutas). |
| **404.html** | Creado: mensaje en español y botón "IR AL INICIO" para páginas no encontradas. |

---

## 2. Verificación de lo que no se tocó (Duelo TV / OBS / overlay)

- **index.html**: sin reemplazo; sigue con menús, logo por rol, Mesas, Duelo, enlaces a duelo-tv y overlay.
- **core.js**: sin reemplazo; mantiene referencias a duelo-tv, overlay, OBS, cámara (~16 coincidencias).
- **overlay_marcador.html**: intacto (overlay para OBS/Streamlabs).
- **duelo-tv.html**, **duelo-tv-preview.html**: presentes y sin cambios.

---

## 3. Archivos recuperados (listados en RECUPERAR_ARCHIVOS.md)

Origen usado: **Copia de DE CARAMBOLA SUITE. → DE CARAMBOLA SUITE.**  
`torneo_crear.html` se tomó del **Desktop** (versión correcta "Crear Torneo" con barra de progreso).

| Archivo | Estado |
|---------|--------|
| organizador.html | OK — recuperado |
| torneo_amigos.html | Sin cambio (no estaba en copia; se mantiene el del proyecto) |
| torneo_crear.html | OK — desde Desktop (Crear Torneo con progreso) |
| torneos.html | OK — recuperado |
| ranking.html | OK — recuperado |
| mesas.html | OK — recuperado |
| mesas_config.html | OK — recuperado |
| inscripciones.html | OK — recuperado |
| control_torneo.html | OK — recuperado |
| index.html | No recuperado (para no pisar Duelo TV/OBS/overlay) |
| core.js | No recuperado (igual motivo) |
| posiciones.html | OK — recuperado |
| historial.html | OK — recuperado |

---

## 4. Checklist QA — Pruebas manuales recomendadas

### Index y navegación
- [ ] Abrir `index.html`: sin errores en consola (F12).
- [ ] Panel ORGANIZADOR: **CREAR TORNEO** → abre `torneo_crear.html` (pantalla Crear Torneo con barra de pasos).
- [ ] Panel ORGANIZADOR: **Configurar instalaciones** → `mesas_config.html`.
- [ ] Panel ORGANIZADOR: **Salón en vivo** → `mesas.html`.
- [ ] **VER LLAVES** / **Brackets** → `Brackets.html`.
- [ ] **Personalizar** (MI CLUB y ORGANIZADOR) → `Configurador%20formato.html` (sin 404).
- [ ] Sensei → `Sensei.html`.

### Páginas recuperadas (una por una)
- [ ] organizador.html — carga y enlaces internos.
- [ ] torneo_crear.html — flujo de pasos (nombre, reglas, premios, etc.).
- [ ] torneos.html, ranking.html, posiciones.html.
- [ ] mesas.html, mesas_config.html, historial.html.
- [ ] inscripciones.html, control_torneo.html.

### Duelo TV y overlay (intactos)
- [ ] duelo-tv.html — vista TV; configuración mesa + URL cámara.
- [ ] overlay_marcador.html — abrir con `?match_id=...`; comprobar en OBS como fuente Navegador.

### Netlify (tras deploy)
- [ ] Logo por rol (ORGANIZADOR = DE CARAMBOLA; JUGADOR/MI CLUB = logo club si hay whitelabel).
- [ ] Ruta inexistente → se sirve 404.html con "IR AL INICIO".

---

## 5. Resumen

- **Recuperación:** Archivos de la lista restaurados desde la Copia (y `torneo_crear.html` desde Desktop); `index.html`, `core.js` y overlay no se reemplazaron.
- **Correcciones en esta QA:** Configurador formato añadido y enlaces corregidos; `_redirects` y `404.html` creados.
- **Próximo paso:** Ejecutar la checklist anterior en local y, tras subir a Netlify, repetir las pruebas de index, Configurador y 404.

Documentos de referencia: `QA_BILLAR.md`, `QA_FLUJOS_Y_FOTOS.md`, `QA_NETLIFY.md`.

---

## 6. Lección QA: enlaces deben existir en el HTML

**Problema:** Tener los archivos (mesas.html, mesas_config.html, etc.) no basta si **index.html no los enlaza**. Si los enlaces no están en el index, el usuario nunca los ve en la plataforma.

**Regla para futuras QAs:**
- **Verificar en index.html** que existan los `href` a cada página que debe ser accesible desde la portada (Mesas, Configurar instalaciones, Reservas, Historial, Configurador, Sensei, etc.).
- No dar por válido solo “el archivo existe”; comprobar que **hay un enlace visible** en el panel correspondiente (ORGANIZADOR y/o MI CLUB).
- En deploy, probar al menos: Index → Panel Organizador → Salón en vivo / Configurar instalaciones; Panel MI CLUB → misma sección.

Lista mínima de enlaces que index debe tener (panel org y/o club):  
`mesas.html`, `mesas_config.html`, `reservas_admin.html`, `historial_mesas.html`, `Configurador%20formato.html`, `Sensei.html` (mayúscula S en servidores case-sensitive).
