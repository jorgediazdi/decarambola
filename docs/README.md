# Documentación — cómo mantenerla

## QA por tema (canónico)

| Tema | Documento principal |
|------|---------------------|
| **Antes / después de subir versión** | `docs/QA_CHECKLIST_SUBIDA.md` |
| **Arranque salón + Supabase + streaming (orden)** | `docs/ARRANQUE_OPERACION_SALON.md` |
| **SQL: comprobar columnas / RLS / corregir mesas** | `docs/SQL_VERIFICAR_Y_CORREGIR_MESAS.md` |
| **Streaming** (YouTube, OBS, overlay) | `docs/QA_STREAMING.md` |
| **Enlaces en portada** (`index.html`) | `QA_ENLACES_INDEX.md` |
| **Flujos + fotos** (organizador, club, jugador) | `QA_FLUJOS_Y_FOTOS.md` |
| **Deploy Netlify** | `QA_NETLIFY.md` |
| **Roles sesión / club billar / Supabase** | `QA_BILLAR.md` |
| **Orden jugador → club (staff) → admin** | `docs/FLUJO_JUGADOR_CLUB_ADMIN.md` |
| **«Falta fila en profiles»** (Auth sí, tabla `profiles` no) | `docs/FIX_PROFILES_ROLE_SUPABASE.md` + SQL `008_backfill_profiles_desde_auth.sql` |
| **Nombre “MASTER PRUEBA” / caché marca** | `docs/WHITELABEL_NOMBRE_CLUB.md` |

## Estado — docs streaming (fase 1, limpio duro)

| Archivo | Estado | Uso |
|---------|--------|-----|
| `docs/QA_STREAMING.md` | ACTIVO | QA post-deploy + fotos |
| `CONFIGURAR_YOUTUBE.md` | ACTIVO | Setup YouTube + embed |
| `STREAMING_QUE_SE_TRANSMITE.md` | ACTIVO | Capas y refresh overlay |
| `OVERLAY_EN_OBS.md` | REFERENCIA | Receta corta overlay OBS |
| `LISTO_STREAMING_ESTA_NOCHE.md` | REFERENCIA | Checklist rápido escena |
| `VIDEO_QUE_FALTA.md` | REFERENCIA | Contexto + backlog video |
| `docs/SIGUIENTE_PASOS_STREAMING_Y_CLUB.md` | ACTIVO | Backlog producto streaming/club |

## Estado — QA general (fase 2)

| Archivo | Estado | Uso |
|---------|--------|-----|
| `docs/QA_CHECKLIST_SUBIDA.md` | ACTIVO | Checklist principal pre/post subida |
| `QA_ENLACES_INDEX.md` | ACTIVO | Que `href` debe existir en `index.html` |
| `QA_BILLAR.md` | ACTIVO | SESSION, club, Supabase `clubs` |
| `QA_FLUJOS_Y_FOTOS.md` | ACTIVO | Casos por pantalla / fotos |
| `QA_NETLIFY.md` | ACTIVO | Deploy y rutas |
| `QA_REVISION_RECIENTE.md` | HISTÓRICO | Snapshot recuperación archivos; lección enlaces |
| `docs/QA_REPORTE_PRE_SUBIDA.md` | REFERENCIA | Notas antiguas; ver checklist nueva |

## Reglas

1. No duplicar listas largas en varios `QA_*.md`: actualizar el **documento principal** del tema y los demás remiten.
2. No borrar documentos sin decisión explícita del dueño; marcar HISTÓRICO / REFERENCIA.
3. Streaming en datos: se guarda **URL** (y opcional ID texto), no el archivo de vídeo en tu base; el vídeo queda en YouTube.
