# Tablas de Supabase — Referencia

Lista de tablas usadas por DeCarambola en Supabase, con columnas clave y relación con la app. Sirve como referencia única del esquema.

---

## 1. `clubs`

**Uso:** Unirse por código, whitelabel (nombre, logo, color). Consultada desde index (unirse por código) y whitelabel.js (datos del club).

| Columna        | Tipo   | Notas                                      |
|----------------|--------|--------------------------------------------|
| id             | uuid   | PK                                         |
| codigo         | text   | Código de invitación (único)               |
| nombre         | text   | Nombre del club                            |
| ciudad         | text   |                                            |
| color_primario | text   | Color del tema                             |
| logo_url       | text   | URL del logo (p. ej. Storage)              |
| activo         | bool   | true = visible para unirse                |
| created_at     | timestamptz | (habitual)                |

**App:** index (crear club en local; unirse por código hace SELECT por codigo); whitelabel (SELECT por id para logo/color); admin_sede.html (PATCH si el club tiene id, INSERT si fue creado solo en local).

---

## 2. `jugadores`

**Uso:** MasterVIP — cargar, guardar, actualizar; sincroniza con localStorage (JUGADORES_PLATAFORMA).

| Columna   | Tipo   | Notas                          |
|-----------|--------|--------------------------------|
| id        | uuid   | PK                             |
| nombre    | text   |                                |
| alias     | text   |                                |
| club_id   | uuid/text | Referencia al club          |
| club      | text   | Nombre del club                |
| ciudad    | text   |                                |
| whatsapp  | text   |                                |
| pin       | text   |                                |
| nivel     | text   | p. ej. BRONCE                  |
| puntos    | int    |                                |
| partidas  | int    |                                |
| victorias | int    |                                |
| promedio  | numeric|                                |
| foto_url  | text   |                                |
| activo    | bool   |                                |
| created_at / updated_at | timestamptz |        |

**App:** core.js — cargarJugadoresNube (GET por club_id), guardarJugador (INSERT/UPDATE), actualizar promedio (UPDATE).

---

## 3. `torneos`

**Uso:** Crear torneo, cargar lista, actualizar estado; sync con localStorage (TORNEOS_LISTA, TORNEO_ACTIVO_ID).

| Columna           | Tipo   | Notas                    |
|-------------------|--------|--------------------------|
| id                | uuid   | PK                       |
| club_id           | uuid/text |                        |
| codigo            | text   | p. ej. MV-2026-0001      |
| nombre            | text   |                          |
| sistema / formato | text   | brackets, survivor       |
| modalidad         | text   | Libre, etc.              |
| cupo_max          | int    |                          |
| inscripcion       | numeric|                          |
| base_club         | numeric|                          |
| pct_premios       | numeric|                          |
| pct_fee           | numeric|                          |
| entrada_objetivo  | int    |                          |
| tiempo_entrada    | int    | minutos                  |
| reglamento        | text   |                          |
| estado            | text   | BORRADOR, ABIERTO, EN_CURSO, FINALIZADO |
| fecha_inicio      | timestamptz |                   |
| ganador_id        | uuid   | (al finalizar)           |
| created_at / updated_at | timestamptz |          |

**App:** core.js — cargarTorneosNube (GET), crearTorneo (INSERT), actualizarTorneo (PATCH estado/ganador_id). Inscritos y rondas se guardan en localStorage; no en esta tabla.

---

## 4. `inscripciones`

**Uso:** Inscripciones a torneos; relación torneo_id + jugador_id. Se usa para recuperar inscritos en otro dispositivo.

| Columna      | Tipo   | Notas              |
|--------------|--------|--------------------|
| id           | uuid   | PK                 |
| torneo_id    | uuid   | FK torneos         |
| jugador_id   | uuid   | FK jugadores       |
| club_id      | uuid/text |                  |
| numero_orden | int    | Orden de inscripción |
| estado       | text   | ACTIVO, etc.       |
| pagado       | bool   |                    |
| handicap     | numeric| promedio           |
| created_at   | timestamptz |                |

**App:** core.js — inscribirJugador (INSERT); _recuperarInscritos (GET con join a jugadores: nombre, promedio, categoria).

---

## 5. `partidas`

**Uso:** Registrar resultado de partida de torneo (carambolas, entradas, ganador).

| Columna         | Tipo   | Notas        |
|-----------------|--------|--------------|
| id              | uuid   | PK           |
| club_id         | uuid/text |            |
| torneo_id       | uuid   |              |
| jugador1_id     | uuid   | FK jugadores |
| jugador2_id     | uuid   | FK jugadores |
| entrada_objetivo| int    |              |
| carambolas_j1   | int    |              |
| carambolas_j2   | int    |              |
| entradas_j1     | int    |              |
| entradas_j2     | int    |              |
| promedio_j1     | numeric|              |
| promedio_j2     | numeric|              |
| ganador_id      | uuid   | FK jugadores |
| tipo            | text   | TORNEO       |
| ronda           | int/text |             |
| created_at      | timestamptz |          |

**App:** core.js — registrarResultado (INSERT partida, UPDATE torneos, INSERT ranking_historico).

---

## 6. `ranking_historico`

**Uso:** Historial de partidas por jugador (promedio, puntos, entradas por fecha).

| Columna    | Tipo   | Notas   |
|------------|--------|---------|
| id         | uuid   | PK      |
| club_id    | uuid/text |       |
| jugador_id | uuid   | FK jugadores |
| promedio   | numeric|         |
| puntos     | int    |         |
| entradas   | int    |         |
| fecha      | date   |         |
| created_at | timestamptz |   |

**App:** core.js — _actualizarHistorial (INSERT por cada jugador de la partida).

---

## 7. `mesas_config`

**Uso:** Configuración del salón (nombre, filas, columnas, horario, tarifas). Script: `supabase_mesas_instalaciones.sql`.

| Columna     | Tipo   | Notas     |
|-------------|--------|-----------|
| id          | uuid   | PK        |
| club_id     | text   |           |
| nombre_salon| text   |           |
| filas       | int    |           |
| columnas    | int    |           |
| apertura    | time   |           |
| cierre      | time   |           |
| moneda      | text   | COP       |
| tarifas     | jsonb  |           |
| created_at / updated_at | timestamptz | |

**App:** mesas_config.html, core.js (DB) — lectura/escritura de configuración del salón.

---

## 8. `mesas`

**Uso:** Mesas/canchas del club (número, estado, tarifa, sesión activa). Incluye `url_camara` (script `supabase_mesas_url_camara.sql`) para streaming.

| Columna         | Tipo   | Notas                          |
|-----------------|--------|--------------------------------|
| id              | uuid   | PK                             |
| club_id         | text   |                                |
| salon_id        | uuid   | FK mesas_config                |
| numero          | int    |                                |
| nombre          | text   |                                |
| tipo_instalacion| text   | INSTALACIÓN                    |
| estado          | text   | libre, ocupada, reservada, mantenimiento, fuera_servicio |
| tarifa_hora     | numeric|                                |
| sesion_activa   | jsonb  |                                |
| url_camara      | text   | (opcional) Primera URL stream; se sincroniza con urls_camaras |
| urls_camaras    | jsonb  | (opcional) Lista de cámaras: [{ "nombre": "Cámara 1", "url": "https://..." }] |
| created_at / updated_at | timestamptz |             |

**App:** mesas.html, mesas_config.html, reservas, historial_mesas.

---

## 9. `mesas_reservas`

**Uso:** Reservas de mesas (jugador, fecha, duración, estado).

| Columna          | Tipo   | Notas   |
|------------------|--------|---------|
| id               | uuid   | PK      |
| mesa_id          | uuid   | FK mesas|
| club_id          | text   |         |
| jugador_nombre   | text   |         |
| fecha_reserva    | timestamptz |  |
| duracion_minutos | int    |         |
| estado           | text   | pendiente, etc. |
| notas            | text   |         |
| created_at       | timestamptz |   |

---

## 10. `mesas_historial`

**Uso:** Historial de sesiones de uso de mesas (inicio, fin, horas, costo).

| Columna       | Tipo   | Notas   |
|---------------|--------|---------|
| id            | uuid   | PK      |
| mesa_id       | uuid   | FK mesas|
| club_id       | text   |         |
| jugador_nombre| text   |         |
| inicio_sesion | timestamptz |  |
| fin_sesion    | timestamptz |  |
| horas_reales  | numeric|         |
| costo_total   | numeric|         |
| estado        | text   | abierta, cerrada |
| notas         | text   |         |
| created_at    | timestamptz |   |

---

## 11. `instalaciones_componentes`

**Uso:** Componentes de mantenimiento por mesa (nombre, tipo, horas de uso, estado).

| Columna           | Tipo   | Notas   |
|-------------------|--------|---------|
| id                | uuid   | PK      |
| mesa_id           | uuid   | FK mesas|
| club_id           | text   |         |
| nombre            | text   |         |
| tipo              | text   | CRITICO, ESTANDAR, CONSUMIBLE |
| horas_uso_actual  | int    |         |
| horas_uso_optimo  | int    |         |
| horas_uso_alerta  | int    |         |
| estado            | text   | optimo, desgaste, urgente |
| created_at / updated_at | timestamptz | |

---

## 12. `instalaciones_mantenimiento`

**Uso:** Historial de trabajos de mantenimiento (revisión, reemplazo, limpieza, reparación).

| Columna      | Tipo   | Notas   |
|--------------|--------|---------|
| id           | uuid   | PK      |
| mesa_id      | uuid   | FK mesas|
| componente_id| uuid   | FK instalaciones_componentes |
| club_id      | text   |         |
| tipo_trabajo | text   | REVISION, REEMPLAZO, LIMPIEZA, REPARACION |
| descripcion  | text   |         |
| costo        | numeric|         |
| responsable  | text   |         |
| fecha        | timestamptz |   |
| created_at   | timestamptz |   |

---

## 13. `pqrs`

**Uso:** Contacto / PQRS (agente Joe). Insert desde Sensei; gestión por superadmin en pqrs_admin.html. Script: `supabase_pqrs_contactos.sql`.

| Columna                 | Tipo   | Notas                          |
|-------------------------|--------|--------------------------------|
| id                      | uuid   | PK                             |
| nombre                  | text   |                                |
| contacto                | text   | email o teléfono               |
| mensaje                 | text   |                                |
| tipo                    | text   | peticion, queja, reclamo, sugerencia |
| estado                  | text   | pendiente_revision, autorizado, rechazado, cerrado |
| respuesta_texto        | text   | (superadmin)                   |
| respuesta_autorizada_at | timestamptz |                  |
| club_id                 | text   | (opcional)                     |
| created_at              | timestamptz |                  |

**App:** Sensei.html (INSERT); pqrs_admin.html (GET, PATCH estado y respuesta).

---

## Scripts SQL en el repo

| Archivo                          | Tablas que crea o modifica      |
|----------------------------------|---------------------------------|
| (clubs, jugadores, torneos, inscripciones, partidas, ranking_historico no tienen script en repo; se asume que existen en Supabase) | |
| supabase_mesas_instalaciones.sql | mesas_config, mesas, mesas_reservas, mesas_historial, instalaciones_componentes, instalaciones_mantenimiento |
| supabase_mesas_url_camara.sql    | mesas (añade url_camara)        |
| supabase_pqrs_contactos.sql      | pqrs                            |
| supabase_rls_produccion.sql     | RLS por club_id (ejecutar cuando Auth + app_metadata.club_id) |

---

## Relación con la app (resumen)

- **core.js:** jugadores, torneos, inscripciones, partidas, ranking_historico (DB.get, DB.insert, DB.update).
- **index.html / whitelabel.js:** clubs (fetch directo a /rest/v1/clubs).
- **torneos.html:** clubs (listado para filtros).
- **Mesas e instalaciones:** mesas_config, mesas, mesas_reservas, mesas_historial, instalaciones_* (mesas_config.html, mesas.html, reservas_admin, historial_mesas).
- **Sensei / Joe:** pqrs (INSERT en Sensei; GET/PATCH en pqrs_admin.html).

Para RLS y producción: `docs/RLS_PRODUCCION.md` (estrategia en dos fases) y script `supabase_rls_produccion.sql` (ejecutar cuando tengas Auth y `app_metadata.club_id`). Ver también `docs/SUPABASE_RECOMENDACIONES_EXPERTO.md`.
