# Inventario de arquitectura por roles (Supabase única · 3 superficies)

**Fecha:** 2026-03-12  
**Alcance:** raíz del repo `DE CARAMBOLA SUITE.` (archivos canónicos en la raíz; existe copia espejo en `DE CARAMBOLA SUITE./` — ver §8).

**Superficies objetivo**

| Superficie | Rol de negocio |
|------------|----------------|
| **App principal** | Jugador / usuario final (partida, perfil, ranking, retos, consumo de torneo/streaming donde aplique). |
| **Portal club** | Operación de la sede (mesas, reservas, socios, branding, torneos “en casa”, reportes de salón). |
| **Backoffice DeCarambola** | Staff plataforma (PQRS, soporte, visión global si se añade; sin mezclar con operación diaria del club salvo que el producto lo defina). |

**Leyenda de perfil (columna 4)**

- `principal` — solo app jugador.  
- `club` — solo portal club.  
- `backoffice` — solo staff DeCarambola.  
- `principal+club` — compartido entre dos perfiles.  
- `principal+club+backoffice` / **todos** — compartido entre los tres.  
- `club+backoffice` — compartido club y staff (p. ej. reportes agregados vs. por club).

**Acción sugerida (columna 5)**

- **mantener** — ubicación/nombre OK de cara a la migración.  
- **mover** — cambiar solo carpeta o entrypoint (misma lógica).  
- **duplicar** — misma lógica, **vista o shell distinto por rol** (no eliminar la funcionalidad compartida).  
- **reutilizar** — extraer módulo compartido (JS/componentes) y que cada app lo consuma.  
- **refactorizar** — cambiar estructura, auth o contratos de datos.

**Riesgo de impacto (columna 6)** — al modificar el archivo o su contrato con Supabase/localStorage.

- **Bajo** — página aislada o redirect.  
- **Medio** — varias entradas enlazan aquí o comparten estado local.  
- **Alto** — núcleo de datos, auth, PWA, o casi todas las pantallas dependen de ello.

---

## 1. Páginas HTML (raíz del proyecto)

> Rutas **actuales** relativas a la raíz del repo (no incluir prefijo `DE CARAMBOLA SUITE./` salvo nota en §8).

| Archivo | Ruta actual | Función actual | Perfil | Acción sugerida | Riesgo |
|---------|-------------|----------------|--------|-----------------|--------|
| `index.html` | `/index.html` | Hub con pestañas Jugador / Club / Organizador; identificación jugador; accesos a todas las áreas | **todos** | **refactorizar** (3 apps o shells con routing; misma BD) | **Alto** |
| `404.html` | `/404.html` | Página de error | **todos** | **mantener** (por deploy) | Bajo |
| `certificado_ver.html` | `/certificado_ver.html` | Verificación pública de certificado (redirect/consulta) | **principal+club** | **reutilizar** (URL estable; capa API) | Medio |
| `entrenamiento.html` | `/entrenamiento.html` | Redirect a `mi_partida.html` | **principal** | **mantener** o **mover** junto a app jugador | Bajo |
| `mi_partida.html` | `/mi_partida.html` | Entrenamiento / “mi partida” (cronómetro, práctica) | **principal** | **mover** a app principal | Medio |
| `duelo-tv.html` | `/duelo-tv.html` | Transmisión / marcador en vivo (Duelo TV) | **principal+club** | **duplicar** shell (TV club vs. móvil jugador) o **reutilizar** core marcador | Alto |
| `duelo-tv-preview.html` | `/duelo-tv-preview.html` | Preview / prueba de layout Duelo TV | **club** (+ dev) | **mover** a portal club o entorno interno | Bajo |
| `club/duelo_premium_tv.html` | `/club/duelo_premium_tv.html` | Señal especial Duelo Premium TV para pantalla de mesa | **club** | **mantener** (entrypoint de señal) | Bajo |
| `overlay_marcador.html` | `/overlay_marcador.html` | Overlay para OBS / marcador | **principal+club** | **mover** a portal club (producción) + enlace desde principal si aplica | Medio |
| `perfil.html` | `/perfil.html` | Carnet / perfil del jugador | **principal** | **mover** a app principal | Medio |
| `historial.html` | `/historial.html` | Historial del jugador | **principal** | **mover** a app principal | Medio |
| `ranking.html` | `/ranking.html` | Ranking del club / tabla | **principal+club** | **reutilizar** datos; **duplicar** vista (jugador vs. gestor) si hace falta | Medio |
| `categorias.html` | `/categorias.html` | Información de categorías | **principal** | **mover** a app principal | Bajo |
| `reto_crear.html` | `/reto_crear.html` | Crear / ver retos y duelos | **principal** | **mover** a app principal | Medio |
| `Sensei.html` | `/Sensei.html` | IA Sensei + contacto PQRS (`?contacto=1`) | **principal**; contacto implica **principal+backoffice** | **refactorizar** (separar FAQ billar vs. formulario PQRS); **reutilizar** backend | Alto |
| `inscripciones.html` | `/inscripciones.html` | Inscripción a torneos | **principal+club** | **reutilizar** lógica; vistas por rol | Alto |
| `torneo_crear.html` | `/torneo_crear.html` | Alta y configuración de torneo | **club** (hoy pestaña “Organizador”) | **mover** a portal club | Alto |
| `control_torneo.html` | `/control_torneo.html` | Control operativo del torneo (rondas, partidas) | **club** | **mover** a portal club | Alto |
| `Brackets.html` | `/Brackets.html` | Llaves / brackets | **principal+club** | **reutilizar** + permisos RLS | Alto |
| `posiciones.html` | `/posiciones.html` | Tabla de posiciones / grupos | **principal+club** | **reutilizar** + permisos | Alto |
| `Certificados.html` | `/Certificados.html` | Emisión / gestión de diplomas | **principal+club** | **duplicar** o capas (solo lectura jugador vs. emisión club) | Medio |
| `organizador.html` | `/organizador.html` | Dashboard KPI torneos del club / accesos rápidos | **club** | **mover** a portal club | Medio |
| `torneos.html` | `/torneos.html` | Listado / filtro de torneos | **principal+club** | **reutilizar**; filtros según rol | Medio |
| `torneo_amigos.html` | `/torneo_amigos.html` | Torneos entre amigos | **principal** (+ **club** si moderan) | **mover** principal; enlaces club opcionales | Medio |
| `Configurador formato.html` | `/Configurador%20formato.html` | Identidad visual del club | **club** | **mover** a portal club | Medio |
| `admin_sede.html` | `/admin_sede.html` | Configurar sede (nombre, colores, logo) | **club** | **mover** a portal club | Medio |
| `mesas.html` | `/mesas.html` | Salón en vivo — estado de mesas | **club** | **mover** a portal club | Alto |
| `mesas_config.html` | `/mesas_config.html` | Configurar instalaciones / disposición | **club** | **mover** a portal club | Alto |
| `instalacion_ficha.html` | `/instalacion_ficha.html` | Ficha de mesa/instalación (desde `mesas.html`) | **club** | **mover** a portal club | Medio |
| `reservas_admin.html` | `/reservas_admin.html` | Gestión de reservas | **club** | **mover** a portal club | Alto |
| `historial_mesas.html` | `/historial_mesas.html` | Historial de uso de mesas / sesiones | **club** | **mover** a portal club | Medio |
| `reportes.html` | `/reportes.html` | KPI ingresos/horas/sesiones por **club** (`getClubId`) | **club**; agregación multi-club → **club+backoffice** | **duplicar** o vista “global” solo backoffice; **no eliminar** versión club | Alto |
| `socios.html` | `/socios.html` | Listado jugadores/socios del club | **club** | **mover** a portal club (añadir en menú club si falta) | Medio |
| `pqrs_admin.html` | `/pqrs_admin.html` | Gestión PQRS (autorizar/rechazar) | **backoffice** | **mover** a backoffice; proteger con rol staff | Alto |
| `prueba_buffer_video.html` | `/prueba_buffer_video.html` | Prueba técnica de buffer de video | interno / **backoffice** | **mantener** fuera de producción o eliminar solo tras sustituto | Bajo |

### 1.1 Documentación HTML embebida

| Archivo | Ruta actual | Función actual | Perfil | Acción sugerida | Riesgo |
|---------|-------------|----------------|--------|-----------------|--------|
| `docs/OBS_DUELO_TV.html` | `/docs/OBS_DUELO_TV.html` | Guía OBS | **principal+club** | **mantener** en docs o enlazar desde portal club | Bajo |

---

## 2. JavaScript y PWA (raíz)

| Archivo | Ruta actual | Función actual | Perfil | Acción sugerida | Riesgo |
|---------|-------------|----------------|--------|-----------------|--------|
| `core.js` | `/core.js` | Cliente Supabase (`DB`), `MasterVIP` (sede, jugadores, torneos, ranking, mesas, etc.), claves públicas | **todos** | **refactorizar** → SDK/modules + auth por app; **no eliminar** APIs usadas por las 3 superficies | **Alto** |
| `session.js` | `/session.js` | Visibilidad panel club, `club_admin` en localStorage | **club** (+ depende de `index`) | **reutilizar** en portal club; unificar con Supabase Auth/roles | Medio |
| `whitelabel.js` | `/whitelabel.js` | Tema / marca por club (localStorage) | **club**; staff podría auditar → **club+backoffice** | **reutilizar** | Medio |
| `Version.js` | `/Version.js` | Versión desplegada (cache bust) | **todos** | **mantener** por app o monorepo | Bajo |
| `sw.js` | `/sw.js` | Service Worker (PWA / caché) | **todos** | **duplicar** o parametrizar por origen si se separan dominios | Alto |

---

## 3. SQL y base de datos (Supabase)

| Archivo | Ruta actual | Función actual | Perfil | Acción sugerida | Riesgo |
|---------|-------------|----------------|--------|-----------------|--------|
| `supabase_rls_produccion.sql` | `/supabase_rls_produccion.sql` | Políticas RLS producción | **todos** (por datos) | **refactorizar** por `app_role` / JWT claims | **Alto** |
| `supabase_mesas_instalaciones.sql` | `/supabase_mesas_instalaciones.sql` | Esquema mesas/instalaciones | **club** (+ lecturas jugador si aplica) | **mantener**; RLS por `club_id` | Alto |
| `supabase_mesas_url_camara.sql` | `/supabase_mesas_url_camara.sql` | URLs cámara mesas | **club** | **mantener** | Medio |
| `supabase_pqrs_contactos.sql` | `/supabase_pqrs_contactos.sql` | Tablas PQRS / contacto | **principal** (insert) + **backoffice** (gestión) | **mantener**; RLS estricto | Alto |

> Ver también `docs/SUPABASE_TABLAS.md`, `docs/RLS_PRODUCCION.md` — metadocumentación, **todos**, riesgo **Alto** al desincronizar.

---

## 4. Backend auxiliar

| Archivo / carpeta | Ruta actual | Función actual | Perfil | Acción sugerida | Riesgo |
|-------------------|-------------|----------------|--------|-----------------|--------|
| `sensei-backend/server.js` | `/sensei-backend/server.js` | API Node para Sensei / integraciones | **principal** + operación **backoffice** | **mantener**; variables de entorno por entorno | Medio |

---

## 5. Documentación (`docs/`)

| Recurso | Función | Perfil | Acción | Riesgo |
|---------|---------|--------|--------|--------|
| `SUPABASE_TABLAS.md`, `RLS_PRODUCCION.md`, `SUPABASE_RECOMENDACIONES_EXPERTO.md` | Modelo datos y seguridad | **todos** | **actualizar** tras unificar apps | Alto |
| `POLITICA_TRANSMISION_INTERNA.md`, `OBS_DUELO_TV.md` | Política y guías streaming | **principal+club** | **mantener** | Bajo |
| `CONTEXTO_PROYECTO_Y_PQRS.md`, `GEMINI_USO_Y_PQRS.md`, `pqrs/README.md` | PQRS | **principal+backoffice** | **mantener** | Bajo |
| `QA_CHECKLIST_SUBIDA.md`, `QA_REPORTE_PRE_SUBIDA.md` | QA deploy | **backoffice** / dev | **mantener** | Bajo |
| Resto (`MEJORAS_SUGERIDAS.md`, `PENDIENTES_*`, etc.) | Seguimiento | interno | **mantener** | Bajo |

---

## 6. Clasificación por tipo de funcionalidad (regla “no borrar si es multi-perfil”)

| Funcionalidad | Perfiles | Nota |
|---------------|----------|------|
| Streaming / Duelo TV / overlay OBS | **principal+club** | Misma lógica de marcador; vistas distintas (móvil vs. TV/producción). |
| Torneos (crear, control, brackets, posiciones, certificados) | **principal+club** | Jugador consume; club opera. Posible lectura pública con RLS. |
| Inscripciones | **principal+club** | Jugador se inscribe; club inscribe en sede. |
| Ranking / categorías | **principal+club** | Consulta jugador; club puede usar en pantallas. |
| Mesas, reservas, historial mesas, socios, reportes de salón | **club** | Consumo del club; reportes agregados multi-club serían **club+backoffice** (vista nueva, no sustituto). |
| PQRS (formulario Sensei / contacto) | **principal+backoffice** | No eliminar flujo jugador al añadir panel staff. |
| Facturación / control global de clubes (si no existe en repo) | **backoffice** | Implementar solo en backoffice; datos en misma BD con RLS. |

---

## 7. Mapa rápido: pestaña actual en `index.html` → superficie sugerida

| Pestaña actual | Pantallas enlazadas principalmente | Superficie objetivo |
|----------------|-----------------------------------|---------------------|
| Jugador | `duelo-tv`, `mi_partida`, `inscripciones`, `reto_crear`, `perfil`, `ranking`, `categorias`, `Brackets`, `posiciones`, `Certificados`, `Sensei` | **App principal** |
| Club | `admin_sede`, `Configurador formato`, `mesas`, `mesas_config`, `reservas_admin`, `historial_mesas` | **Portal club** |
| Organizador | `torneo_crear`, `inscripciones`, `control_torneo`, `Brackets`, `posiciones`, `Certificados` | **Portal club** (operador torneo); vistas de solo lectura en **app principal** |

---

## 7.1 Bloques operativos (como hoy)

| Bloque | Debe incluir | Asignación final |
|--------|--------------|------------------|
| **Jugador** | Duelo móvil, perfil, ranking, categorías, retos, consumo de torneos, Sensei | **`/jugador/`** |
| **Club** | Sede, mesas, reservas, socios, reportes de salón | **`/club/`** |
| **Organizador** | Creación de torneo, inscripciones, control torneo, brackets de entrada, posiciones, certificados | **`/club/`** (sección organizador) |
| **Contacto** | Canal PQRS/contacto visible para todos los roles | **`/jugador/` + `/club/` + `/admin/`** (enlace a `Sensei.html?contacto=1`) |

**Decisiones pedidas y aplicadas:**

- `duelo-tv.html` queda como funcionalidad compartida: **Duelo móvil (Jugador)** y **Duelo Premium TV (Club/Organizador)**.  
- `torneo_crear.html` queda en bloque **Organizador** (dentro de portal club).  
- `perfil.html` queda en bloque **Jugador**.  
- `Brackets.html` queda en **Jugador** (consulta) y **Organizador** (operación).  
- Ninguna funcionalidad compartida se elimina: se marca compartida o con vista por rol.

---

## 8. Carpeta duplicada `DE CARAMBOLA SUITE./`

Contiene copias de muchos `.html`, `.js` y `.sql` con la misma función nominal.

| Elemento | Ruta | Función | Perfil | Acción sugerida | Riesgo |
|----------|------|---------|--------|-----------------|--------|
| Espejo de proyecto | `/DE CARAMBOLA SUITE./**` | Duplicado del árbol | **todos** | **refactorizar** deploy: una sola raíz publicada; evitar ediciones dobles | **Alto** (drift, ZIP, caché) |

---

## 9. Próximos pasos (después del inventario)

**Estado:** fase 1 aplicada — hubs `/jugador/`, `/club/`, `/admin/` (ver `PLAN_MIGRACION_3_APPS.md`).

1. Fijar **dominios o subrutas** (`app.`, `club.`, `admin.`) y una sola **Supabase URL**.  
2. Sustituir progresivamente `anon key` en cliente por **auth por rol** + RLS (sin romper `core.js` hasta tener módulos).  
3. Para cada fila **principal+club**, decidir **reutilizar** vs **duplicar vista** antes de mover archivos.  
4. Eliminar duplicado `DE CARAMBOLA SUITE./` del artefacto de despliegue o sincronizarlo por script único.

---

## 10. Verificación de cobertura (sin dejar archivos por fuera)

**Resultado:** cobertura completa de archivos canónicos del producto en las 3 apps (Jugador, Club con grupo Organizador, Backoffice) o en capa compartida.

### 10.1 Entradas de app (hubs)

- `jugador/index.html` → App Jugador.  
- `club/index.html` → Portal Club con dos grupos internos: **Administración Sala** y **Organizador (torneos)**.  
- `admin/index.html` → Backoffice DeCarambola.

### 10.2 Páginas funcionales canónicas (`.html`) clasificadas

- **Jugador:** `mi_partida.html`, `entrenamiento.html`, `perfil.html`, `historial.html`, `categorias.html`, `reto_crear.html`, `torneo_amigos.html`, `Sensei.html`.  
- **Club · Administración Sala:** `admin_sede.html`, `Configurador formato.html`, `mesas.html`, `mesas_config.html`, `instalacion_ficha.html`, `reservas_admin.html`, `historial_mesas.html`, `reportes.html`, `socios.html`, `duelo-tv-preview.html`, `club/duelo_premium_tv.html`.  
- **Club · Organizador (torneos):** `organizador.html`, `torneo_crear.html`, `control_torneo.html`, `inscripciones.html`, `Brackets.html`, `posiciones.html`, `Certificados.html`, `torneos.html`.  
- **Backoffice:** `pqrs_admin.html`, `prueba_buffer_video.html` (interno técnico).  
- **Compartidos entre apps:** `duelo-tv.html`, `overlay_marcador.html`, `certificado_ver.html`, `index.html`, `404.html`.

### 10.3 Archivos de soporte (también cubiertos)

- **Compartidos (todos):** `core.js`, `session.js`, `whitelabel.js`, `sw.js`, `Version.js`.  
- **Supabase (todos por datos):** `supabase_rls_produccion.sql`, `supabase_mesas_instalaciones.sql`, `supabase_mesas_url_camara.sql`, `supabase_pqrs_contactos.sql`.  
- **Backend:** `sensei-backend/server.js` (Sensei/contacto).  
- **Docs operativas:** `docs/OBS_DUELO_TV.html` + Markdown en `docs/`.

> Nota de control: la carpeta duplicada `DE CARAMBOLA SUITE./` sigue siendo espejo técnico; no se considera árbol canónico funcional y debe resolverse en despliegue para evitar desincronización.

---

## Apéndice A — Módulos lógicos en `core.js` (`MasterVIP` + `DB`)

> No son archivos separados; son **agrupaciones funcionales** para migración y RLS.

| Módulo / grupo | Ejemplos de API | Función actual | Perfil | Acción sugerida | Riesgo |
|----------------|-----------------|----------------|--------|-----------------|--------|
| `DB` + credenciales Supabase | `DB.get`, `DB.insert`, … | Cliente REST anon hacia Supabase | **todos** | **refactorizar** (auth por app, sin romper tablas) | Alto |
| Sede / club | `getSede`, `setSede`, `getClubId` | Contexto de club activo | **club** (+ lectura **principal** donde aplica) | **reutilizar**; club_id desde JWT | Alto |
| Streaming mesa | `getStreamUrlMesa`, `getStreamUrlsMesa` | URLs de stream por mesa | **principal+club** | **reutilizar** | Medio |
| Jugadores | `getJugadores`, `buscarJugador`, fotos/avatar | Catálogo y UI jugador | **principal+club** | **reutilizar** | Alto |
| Torneos / partidas | `getTorneos`, `getTorneoActivo`, sorteos, rondas, `_generarPartidas`, … | Motor torneo | **principal+club** | **reutilizar** + RLS por rol | Alto |
| Ranking / categoría | `_recalcularPromedio`, `obtenerPromedioActual`, `getCategoria` | Clasificación | **principal+club** | **reutilizar** | Alto |
| Bolsa / formato | `calcularBolsa`, `formatearPesos`, `nombreRonda`, … | Utilidades torneo | **club** (+ lectura **principal**) | **reutilizar** | Medio |
| Whitelabel / diseño | `applyDesign`, `getDesign`, `getLogoHTML` | Tema club | **club** | **reutilizar** con `whitelabel.js` | Medio |
| Sesión partida (timer, árbitro) | `iniciar`, `cerrar`, `_avisarArbitro`, `_continuarPartida`, … | Flujo duelo / partida en vivo | **principal+club** | **reutilizar**; separar UI TV vs. móvil | Alto |
| Estadísticas locales | `calcularEstadisticas`, `limpiarLocal` | Historial offline / sync | **principal** | **refactorizar** hacia fuente única Supabase | Medio |

---

*Documento generado como inventario previo a cualquier movimiento masivo de archivos; cumple la regla: funcionalidad multi-perfil → **compartida** o **duplicada con vista según rol**, no eliminación.*
