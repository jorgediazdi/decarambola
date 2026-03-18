# QA — Verificación de enlaces en index.html

**Objetivo:** Evitar que existan archivos en el proyecto pero no se puedan abrir desde la plataforma porque index no los enlaza.

---

## Regla

Antes de dar por cerrado un QA (o antes de un deploy), comprobar que **index.html contiene** los enlaces a todas las páginas que el usuario debe poder abrir desde la portada.

---

## Lista de enlaces que deben estar en index.html

Comprobar con búsqueda en el archivo (Ctrl+F / Cmd+F) o con:

```bash
grep -o 'href="[^"]*\.html"' index.html | sort -u
```

### Paneles ORGANIZADOR y MI CLUB — Mesas e instalaciones

| Enlace en index | Destino | Dónde debe verse |
|-----------------|---------|------------------|
| mesas.html | Salón en vivo | Panel org + Panel club |
| mesas_config.html | Configurar instalaciones | Panel org + Panel club |
| reservas_admin.html | Reservas | Panel org + Panel club |
| historial_mesas.html | Historial mesas | Panel org + Panel club |

### Otros

| Enlace | Nota |
|--------|------|
| torneo_crear.html | Panel ORGANIZADOR — Crear torneo |
| inscripciones.html | Panel ORGANIZADOR |
| control_torneo.html | Panel ORGANIZADOR |
| Brackets.html | Panel ORGANIZADOR / torneo activo |
| posiciones.html | Panel ORGANIZADOR |
| Configurador%20formato.html | Panel org y panel club (Personalizar) |
| Sensei.html | Portal principal (mayúscula S: servidores case-sensitive) |
| admin_sede.html | Panel club — Configurar sede |
| organizador.html | Panel club — Gestión jugadores |
| ranking.html | Panel club |

---

## Checklist rápida

- [ ] En index hay sección **MESAS E INSTALACIONES DEL CLUB** (o equivalente) en panel ORGANIZADOR.
- [ ] Esa misma sección (o enlaces a mesas / mesas_config / reservas / historial) está en panel MI CLUB.
- [ ] El enlace a Sensei usa `Sensei.html` (S mayúscula) para evitar 404 en Linux/Netlify.
- [ ] Tras subir a producción, hacer clic en Salón en vivo y Configurar instalaciones y confirmar que abren (no 404).
