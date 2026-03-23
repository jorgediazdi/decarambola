# Archivos candidatos a deprecar / borrar (revisión manual)

**No borrar nada** hasta confirmar que tu deploy y enlaces no lo usan. Esta lista es orientativa.

## Carpeta anidada `DE CARAMBOLA SUITE./`

Dentro del repo hay a veces una subcarpeta con el mismo nombre del proyecto que **duplica** HTML/MD. Si no forma parte de tu flujo de publicación (Netlify `publish = "."` suele servir solo la raíz), es **candidata a eliminación** o a excluir del repo para evitar confusión y doble mantenimiento.

## Páginas de prueba / desarrollo

| Archivo | Uso | Recomendación |
|---------|-----|----------------|
| `prueba_buffer_video.html` | Prueba de buffer de video | Deprecar o mover a `/dev/` si ya no pruebas |
| `duelo-tv-preview.html` | **Mantener** si usas OBS con vista que incluye stream | No borrar si el club usa preview |

## Duelo TV (marzo 2026)

- **`duelo-tv.html`**: marcador en **layout vertical** (tipo señal Premium), **sin** panel visible de cámara/stream. La URL de stream y la cámara siguen en configuración por compatibilidad, pero no se muestran en pantalla.
- Si necesitas **proyectar stream + marcador** en un mismo lienzo horizontal, usa **`duelo-tv-preview.html`** u OBS con varias fuentes.

## Documentación duplicada

- Varios `.md` existen en raíz y a veces copiados bajo `DE CARAMBOLA SUITE./`. Conserva **una** copia canónica (normalmente en raíz o `docs/`).

## Cómo validar antes de borrar

1. Buscar en el repo: `rg "nombre_archivo" --glob '*.html'`
2. Probar enlaces desde `index.html`, `club/index.html`, `jugador/index.html`
3. Commit en rama y deploy de prueba
