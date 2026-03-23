# Flujo operativo — hubs (jugador · club · admin)

## Patrón UX: bloques plegables (`hub-sections.css`)

En **jugador**, **club**, **admin** y **apps** (mapa técnico) la navegación usa **pocos bloques visibles** (4–6) y el detalle va **dentro** de cada bloque:

- Archivo compartido: **`css/hub-sections.css`** (después de `ux-shell.css`).
- Cada bloque es un **`<details class="dc-hub-fold">`** con resumen clicable; dentro pueden ir **`<details class="dc-hub-nested">`** para subgrupos (ej. portal club: “Operación diaria” vs “Instalación física”).
- Variantes de acento: **`dc-hub--club`** (oro), **`dc-hub--jugador`** (neón), **`dc-hub--staff`** (rojo backoffice).

Así el administrador del club ve primero **6 áreas** ordenadas (salón → economía → marca → torneos → TV → soporte), no una lista larga.

## Qué pasó con el refactor del portal club

**No se eliminaron pantallas.** Los mismos `.html` siguen enlazados; la **presentación** pasó de lista larga a **bloques plegables** por área de trabajo + subgrupos donde hace falta.

Si algo “se perdió”, suele ser **visual** (menos scroll continuo), no funcional. Comprueba en `club/index.html` desplegando el bloque que corresponda.

---

## Mapa mental (3 entradas)

| Hub | Para quién | Primera acción típica |
|-----|------------|------------------------|
| **Jugador** | Socio / visitante que juega | Partida o perfil |
| **Club** | Staff del club (varios roles) | Salón en vivo **o** torneo **o** sede |
| **Admin (backoffice)** | Equipo DeCarambola / staff plataforma | PQRS y soporte |

---

## Flujo club (orden sugerido en la vida real)

1. **Configurar una vez** — Sede, formato, mesas (`admin_sede`, `mesas_config`, `instalacion_ficha`).
2. **Día a día** — Salón en vivo, reservas, tarifas/promos, cierre con reportes.
3. **Evento** — Organizador: crear torneo → inscripciones → control en vivo → brackets/posiciones.
4. **TV / streaming** — Duelo TV, overlay OBS (según mesa).

---

## Flujo admin plataforma (backoffice)

1. **Bandeja** — Entrar a PQRS / contactos y responder o escalar.
2. **Reproducir el bug** — Abrir jugador o club como haría el usuario.
3. **Normas técnicas** — Docs en `/docs` (Supabase, RLS, PQRS, checklist subida).

---

## Próximo salto de calidad (producto)

Cuando exista **Auth + RLS**, cada usuario verá solo los **bloques** de su rol; la estructura de hubs ya está alineada con eso.
