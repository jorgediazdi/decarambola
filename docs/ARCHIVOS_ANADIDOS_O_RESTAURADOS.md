# Archivos añadidos o restaurados — Para que no se pierdan

Lista de **páginas y archivos** que se fueron creando o restaurando. Si algo falta, esta lista sirve de referencia.

---

## Páginas HTML (pantallas de la app)

| Archivo | Qué es |
|---------|--------|
| **mi_partida.html** | Mi Partida: solo tus carambolas, entradas, promedio, serie. Guardar en perfil. Enlace desde Entrenamiento. |
| **entrenamiento.html** | Entrenamiento: enlaces a Mi Partida, Partida/Duelo, Sensei, Retos. |
| **Brackets.html** | Redirige a control_torneo.html?vista=cuadro (llaves del torneo). |
| **Certificados.html** | Generador de certificados: torneo, Campeón/Subcampeón/Participación, canvas, descarga PNG, WhatsApp. |
| **certificado_ver.html** | Vista de certificado de duelo (params en URL) + QR grande para escanear con el teléfono. |
| **categorias.html** | Categorías del deporte (Élite, Maestro, Primera, etc.) y “Tu categoría”. |
| **admin_sede.html** | Admin de la sede: nombre, ciudad, color, logo; PATCH/INSERT a Supabase `clubs`. |
| **pqrs_admin.html** | Superadmin: listar PQRS, autorizar/rechazar, notificar al usuario (copiar, WhatsApp/correo). |
| **404.html** | Página de error 404. |
| **Configurador formato.html** | Configurador de formato de torneo (organizador). |
| **duelo-tv-preview.html** | Preview para Duelo TV. |
| **duelo_movil.html** | Duelo en versión móvil. |
| **prueba_buffer_video.html** | Prueba de buffer de video. |

El resto de HTML (index, duelo, Sensei, mesas, control_torneo, perfil, ranking, etc.) ya existía; algunos se **modificaron** (cámaras, sesión, etc.).

---

## Scripts y configuración

| Archivo | Qué es |
|---------|--------|
| **supabase_mesas_url_camara.sql** | Añade `url_camara` y `urls_camaras` (varias cámaras por mesa) en `mesas`. |
| **supabase_pqrs_contactos.sql** | Tabla PQRS / contactos en Supabase. |
| **supabase_rls_produccion.sql** | RLS para producción (por club_id en JWT). |
| **manifest.json** | PWA: nombre, colores, icono. |
| **sw.js** | Service worker mínimo para instalación. |
| **icon.svg** | Icono de la app. |
| **_headers** | Cabeceras para Netlify (si aplica). |
| **_redirects** | Redirecciones para Netlify (si aplica). |

---

## Carpetas y documentación

| Carpeta/archivo | Qué es |
|-----------------|--------|
| **docs/** | Documentación: QA, RLS, Supabase, PQRS, cámaras, pendientes, etc. |
| **sensei-backend/** | Backend Node (POST /uso, GET /informe) para registro de uso del Sensei. |
| **assets/** | Recursos estáticos (si aplica). |
| **AGENTS.md** | Guía para el agente / Cursor. |

---

## Cómo no perder nada: guardar en Git

Todo lo que está **sin commit** (archivos nuevos `??` o modificados `M`) solo existe en tu carpeta. Si borras la carpeta o la reemplazas, se pierde.

**Para que no se pierda:**

1. Abrir terminal en la carpeta del proyecto.
2. Añadir todo y hacer commit:
   ```bash
   cd "/Users/buysell/Desktop/DE CARAMBOLA SUITE."
   git add .
   git commit -m "Añadir mi_partida, Certificados, Brackets, categorias, entrenamiento, cámaras, admin_sede, pqrs_admin, docs y scripts Supabase"
   ```
3. Si usas GitHub/GitLab: `git push` para subir la copia remota.

Así tienes:
- **Historial** de qué se añadió y cuándo.
- **Posibilidad de volver atrás** si algo se rompe.
- **Copia en el remoto** si haces push (no se pierde aunque se borre el equipo).

Si quieres, en el siguiente paso podemos revisar juntos el resultado de `git status` después del commit.
