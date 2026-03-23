# QA — Verificación de enlaces en index.html

**Estado:** **ACTIVO** — lista canónica de destinos que deben estar enlazados desde la portada.

**Objetivo:** Que exista el archivo **y** que el usuario lo alcance desde `index.html` (no solo en disco).

**Deploy completo:** combinar con `docs/QA_CHECKLIST_SUBIDA.md` y, si aplica, `QA_NETLIFY.md`.

---

## Regla

Antes de cerrar QA o hacer deploy: comprobar **`href` en `index.html`** a cada pantalla que debe abrirse desde ORGANIZADOR / MI CLUB / JUGADOR.

Comando util:

```bash
grep -o 'href="[^"]*\.html"' index.html | sort -u
```

---

## Lista — enlaces esperados

### Mesas e instalaciones (panel org y, donde aplique, club)

| Destino | Uso |
|---------|-----|
| mesas.html | Salón en vivo |
| mesas_config.html | Configurar instalaciones |
| reservas_admin.html | Reservas |
| historial_mesas.html | Historial mesas |

### Torneos y competición

| Destino | Uso |
|---------|-----|
| torneo_crear.html | Crear torneo (ORGANIZADOR) |
| inscripciones.html | Inscripciones |
| control_torneo.html | Control torneo |
| Brackets.html | Llaves |
| posiciones.html | Posiciones |
| ranking.html | Ranking (club) |

### Otros

| Destino | Nota |
|---------|------|
| Configurador%20formato.html | Personalizar (org + club) |
| Sensei.html | **S mayúscula** (case-sensitive en Linux/Netlify) |
| admin_sede.html | Configurar sede (club) |
| organizador.html | Gestión / panel club según tu menú |
| Certificados.html | Si está en el menú |

Ajusta según tu `index.html` actual: la fuente de verdad es el **grep** + prueba manual.

---

## Checklist rápida

- [ ] Sección mesas / instalaciones enlazada en ORGANIZADOR.
- [ ] Enlaces equivalentes (o los que uses) en MI CLUB si el flujo lo requiere.
- [ ] Sensei: `Sensei.html` exacto.
- [ ] Tras deploy: clic en Salón en vivo y Configurar instalaciones → sin 404.
