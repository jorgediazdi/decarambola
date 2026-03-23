# Mapa de archivos HTML (DeCarambola)

**Nada oculto:** todos los `.html` del repo listados aquí para saber qué abrir y desde dónde enlazar.

**Rutas canónicas del club:** prefije `apps/club/...` cuando exista copia en la raíz — evita editar dos sitios.

---

## Entradas principales

| Archivo | Uso |
|---------|-----|
| `index.html` | Inicio público, elección de app (jugador / club / admin) |
| `jugador/index.html` | Hub jugador (B2C) |
| `club/index.html` | Portal club por roles (B2B) |
| `admin/index.html` | Backoffice plataforma (PQRS, QA) |

---

## Jugador / partida / TV

| Archivo | Uso |
|---------|-----|
| `mi_partida.html` | Entrenamiento: una mesa, entradas, serie, guardar |
| `entrenamiento.html` | **Hub** que enlaza a Mi partida (sin redirección automática) |
| `duelo-tv.html` | Marcador dos jugadores, tiempo por entrada, SIG. SET, stream |
| `duelo-tv-preview.html` | Vista previa Duelo TV |
| `club/duelo_premium_tv.html` | Señal TV fija mesa |
| `overlay_marcador.html` | Capa OBS |

---

## Perfil, ranking, historial

| Archivo | Uso |
|---------|-----|
| `perfil.html` | Perfil jugador |
| `ranking.html` | Ranking |
| `historial.html` | Historial |
| `categorias.html` | Categorías |

---

## Torneos y retos (jugador / genérico)

| Archivo | Uso |
|---------|-----|
| `torneo_amigos.html` | Torneo amigos |
| `reto_crear.html` | Retos |
| `torneo_crear.html` | Crear torneo (copia raíz; ver apps) |
| `inscripciones.html` | Inscripciones (copia raíz) |
| `Brackets.html` | Brackets (copia raíz) |
| `posiciones.html` | Posiciones (copia raíz) |
| `Certificados.html` | Certificados (copia raíz) |
| `torneos.html` | Listado torneos (copia raíz) |
| `organizador.html` | Panel organizador (copia raíz) |
| `control_torneo.html` | Control torneo (copia raíz) |
| `certificado_ver.html` | Ver certificado |

---

## Club — sala (`apps/club/sala/`)

| Archivo | Uso |
|---------|-----|
| `admin_sede.html` | Configurar sede / marca |
| `configurador_formato.html` | Formato de torneo |
| `mesas.html` | Salón en vivo |
| `mesas_config.html` | Configurar mesas |
| `instalacion_ficha.html` | Ficha instalación / QR mesa |
| `tarifas_salon.html` | Tarifas y promos |
| `reservas_admin.html` | Reservas |
| `historial_mesas.html` | Historial mesas |
| `reportes.html` | Reportes |
| `socios.html` | Jugadores y socios |

*En la raíz hay duplicados de algunos (`mesas.html`, `reservas_admin.html`, etc.): enlazar desde `club/index.html` apunta a `apps/club/sala/...`.*

---

## Club — organizador (`apps/club/organizador/`)

| Archivo | Uso |
|---------|-----|
| `organizador.html` | Panel |
| `torneo_crear.html` | Crear torneo |
| `inscripciones.html` | Inscripciones |
| `control_torneo.html` | Control en vivo |
| `Brackets.html` | Llaves |
| `posiciones.html` | Posiciones |
| `Certificados.html` | Certificados |
| `torneos.html` | Listado |

---

## Admin / soporte / otros

| Archivo | Uso |
|---------|-----|
| `pqrs_admin.html` | Gestionar PQRS |
| `Sensei.html` | Sensei + contacto (`?contacto=1`) |
| `apps/index.html` | Índice apps (si se usa) |
| `404.html` | Error |
| `docs/OBS_DUELO_TV.html` | Guía OBS |

---

## Archivos legacy en raíz (misma función que `apps/club/...`)

Si editas funcionalidad, **prioriza** `apps/club/...`. Ejemplos en raíz: `admin_sede.html`, `Configurador formato.html`, `instalacion_ficha.html`, `mesas_config.html`, `reportes.html`, `socios.html`, `historial_mesas.html`.

---

*Última revisión: mapa generado para transparencia post-refactor hubs.*
