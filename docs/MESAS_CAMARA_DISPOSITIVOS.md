# Mesas, cámara y parametrización de dispositivos

## Concepto

**Cada mesa puede tener una o varias cámaras.** En el sistema, cada instalación (mesa/cancha) tiene asociadas sus propias cámaras o fuentes de stream. La **primera** se usa por defecto en Duelo/transmisión; el resto queda disponible para selector multi-cámara o otras pantallas.

Además, **se pueden parametrizar todos los dispositivos o elementos alrededor** de cada mesa (cámaras, y en el futuro marcador, iluminación, etc.) desde la misma ficha de la instalación.

## Dónde se configura

- **Cámaras (una o varias):** En la **Ficha de instalación** (`instalacion_ficha.html`), sección **“Cámaras y dispositivos”**. Ahí se listan nombre + URL por cámara; se guarda en `mesas.urls_camaras` (jsonb). La primera URL también se escribe en `mesas.url_camara` para compatibilidad.
- **Uso en Duelo:** En `duelo.html`, al elegir mesa, si no se escribe una URL manual, el sistema usa `MasterVIP.getStreamUrlMesa(clubId, numeroMesa)` (primera cámara). Para listar todas: `MasterVIP.getStreamUrlsMesa(clubId, numeroMesa)`.

## Resumen técnico

| Elemento | Dónde | Tabla/API |
|----------|--------|------------|
| Varias cámaras por mesa | instalacion_ficha.html → “Cámaras y dispositivos” | `mesas.urls_camaras` (jsonb), `mesas.url_camara` (primera) |
| Primera URL para stream | core.js → `MasterVIP.getStreamUrlMesa(clubId, numeroMesa)` | `mesas` por `club_id` + `numero` |
| Lista de todas las cámaras | core.js → `MasterVIP.getStreamUrlsMesa(clubId, numeroMesa)` | Devuelve `[{ nombre, url }, ...]` |
| Más dispositivos por mesa | Misma ficha (ampliable) | Por definir |

## Scripts Supabase

- `supabase_mesas_url_camara.sql`: añade `url_camara` (text), `urls_camaras` (jsonb) y migra datos existentes.
