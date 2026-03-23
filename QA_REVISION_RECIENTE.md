# QA — Revision reciente

**Estado:** **HISTORICO** — registro de una sesion de **recuperacion de archivos** (no sustituye el QA actual).

**Para deploy y pruebas hoy:** usar en este orden lo que aplique:

1. `docs/QA_CHECKLIST_SUBIDA.md` — checklist principal (movil + PC).
2. `QA_ENLACES_INDEX.md` — que `index.html` enlace lo que debe.
3. `QA_FLUJOS_Y_FOTOS.md` — flujos y capturas.
4. `docs/QA_STREAMING.md` — si toca streaming tras subir.

---

## Lección QA (sigue vigente)

**Tener el `.html` en el repo no basta:** hay que verificar que **`index.html` tiene el `href`** a esa pantalla desde el panel que corresponde (ORGANIZADOR / MI CLUB / JUGADOR). Detalle: **`QA_ENLACES_INDEX.md`**.

---

## Resumen de esa recuperación (contexto)

| Tema | Accion |
|------|--------|
| Configurador formato | Recuperado `Configurador formato.html`; enlaces en index con `Configurador%20formato.html` |
| Netlify | `_redirects` en raiz; `404.html` con mensaje ES + vuelta al inicio |
| HTML de torneo/mesas/org | Varios recuperados desde copia; `torneo_crear` desde version correcta con pasos |
| **No se pisaron** | `index.html`, `core.js` donde afectaba Duelo TV / OBS / overlay |

Lista detallada de archivos tocados por recuperación: **historial git** o revisiones anteriores de este doc si las necesitas.

---

## Referencias cruzadas

| Necesidad | Documento |
|-----------|-----------|
| Roles billar / club | `QA_BILLAR.md` |
| Netlify / 404 | `QA_NETLIFY.md` |
| Reporte pre-subida (notas viejas) | `docs/QA_REPORTE_PRE_SUBIDA.md` |
