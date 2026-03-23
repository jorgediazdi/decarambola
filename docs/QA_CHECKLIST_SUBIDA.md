# QA — checklist antes de subir nueva versión

**Objetivo:** verificar lo crítico en **móvil y PC** antes de publicar (Netlify / hosting). Marca cada ítem: ☐ pendiente · ☑ OK · ✗ fallo (nota).

**Fecha referencia:** 2026-03-12 · Ajusta `Version.js` (`APP_VERSION`) al subir.

---

## A. Pre-subida (1 vez)

| # | Comprobación | Estado |
|---|----------------|--------|
| A1 | `git status` — todo lo que debe ir en producción está **commiteado** (o lista clara de archivos si subes ZIP). | ☐ |
| A2 | **`Version.js`** — subir `APP_VERSION` (ej. `2026.03.12.1`) para que usuarios reciban archivos nuevos. | ☐ |
| A3 | **`sw.js`** — si cambiaste lógica de SW, subir versión en registro (`index.html` ya usa `sw.js?v=…`). | ☐ |
| A4 | Probar en **ventana privada** o tras borrar caché del sitio (evita “sigo viendo la vieja”). | ☐ |

---

## B. Flujos críticos (navegador)

### B1 · Inicio y jugador
| # | Paso | Estado |
|---|------|--------|
| B1.1 | `index.html` carga sin error en consola (F12). | ☐ |
| B1.2 | **ENTRENAR** (acción rápida) abre **`mi_partida.html`** directo. | ☐ |
| B1.3 | `entrenamiento.html` **redirige** a `mi_partida.html` (marcador antiguo / favoritos). | ☐ |
| B1.4 | Panel **JUGADOR**: menú (perfil, posiciones, Joe, etc.) enlaces OK. | ☐ |

### B2 · Club (móvil)
| # | Paso | Estado |
|---|------|--------|
| B2.1 | Abrir **MI CLUB** varias veces: acciones y lista **no desaparecen** de forma errática. | ☐ |
| B2.2 | **Unirse / crear / mis clubes** se muestran al tocar (si aplica). | ☐ |

### B3 · Duelo TV
| # | Paso | Estado |
|---|------|--------|
| B3.1 | Fase 1: iniciar partida → Fase 2 marcador OK. | ☐ |
| B3.2 | Botón **SIGUIENTE ENTRADA** (azul) visible y usable en **móvil**. | ☐ |
| B3.3 | **Finalizar / Volver** → va a **`mi_partida.html`**. | ☐ |
| B3.4 | Opcional: `?hidepolicy=1` oculta caja de política; `?wm=off` sin marca de agua. | ☐ |

### B4 · Certificados
| # | Paso | Estado |
|---|------|--------|
| B4.1 | `Certificados.html` — torneo (selector + tabs) genera imagen. | ☐ |
| B4.2 | Enlace tipo duelo con `?n1=&n2=&p1=…` abre **certificado de duelo** en la misma página (o `certificado_ver.html` **redirige** a `Certificados.html` con mismos params). | ☐ |
| B4.3 | Bloque logo/redes no rompe la página si no hay `wl_red_*`. | ☐ |

### B5 · Sensei / Joe
| # | Paso | Estado |
|---|------|--------|
| B5.1 | `Sensei.html` — chat billar sin HTML roto en mensajes. | ☐ |
| B5.2 | **Joe — Contacto** / `?contacto=1` flujo PQRS sin errores. | ☐ |
| B5.3 | **PLATAFORMA · TV** → abre `docs/OBS_DUELO_TV.html` (si despliegas la carpeta `docs/`). | ☐ |

### B6 · Política / docs (opcional en hosting)
| # | Paso | Estado |
|---|------|--------|
| B6.1 | Si publicas `/docs/`, `OBS_DUELO_TV.html` y `POLITICA_TRANSMISION_INTERNA.md` abren bien. | ☐ |

---

## C. Riesgos conocidos (no es bug)

- **YouTube / OBS:** la app no inicia el live solo; hace falta **OBS + Iniciar transmisión**.
- **Varios clubes / un canal:** ver `docs/POLITICA_TRANSMISION_INTERNA.md`.

---

## D. Tras subir

| # | Paso | Estado |
|---|------|--------|
| D1 | Abrir la **URL pública** en móvil (4G) y repetir B1–B3 mínimo. | ☐ |
| D2 | Confirmar que `Version.js` provocó recarga o nueva versión en consola. | ☐ |

---

*Reemplaza parcialmente notas antiguas en `QA_REPORTE_PRE_SUBIDA.md` donde hable de **entrenamiento con 4 tarjetas** — ahora entrenamiento = redirect a Mi partida.*
