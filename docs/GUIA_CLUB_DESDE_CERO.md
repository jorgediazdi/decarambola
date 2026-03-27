# Guía Club — desde cero (no experto)

Para dueños de billar y recepción. Resumen: **entrada → marca (sede) → instalaciones (mesas) → día a día (salón, reservas).**

## 1. Qué es “Club”

- **Jugador** = jugar, ranking, retos (`/jugador/`).
- **Club** = **tu sede**: mesas, reservas, tarifas, **marca** (nombre, logo, color) y opcionalmente torneos y TV.
- **Organizador** = torneos (crear evento, inscripciones, llaves). Puede convivir con el club en el mismo sitio.

Menú principal del club: **Portal club** → `https://TU-DOMINIO/club/` (o tarjeta **MI CLUB** en el inicio).

## 2. Cómo entrar

1. Abrí el sitio (ej. `https://decarambola.com`).
2. **MI CLUB** y/o **Portal club** (`/club/`).
3. En producción suele hacer falta **Iniciar sesión** como **personal del club** (`auth.html`). El PIN del jugador **no** reemplaza eso.
4. Modo prueba solo en entornos que lo permitan: ` /club/?dev=1 ` (ver `docs/FLUJO_JUGADOR_CLUB_ADMIN.md`).

## 3. Crear o recuperar la marca

**Pantalla:** **Configurar sede** → `apps/club/sala/admin_sede.html`  
En el portal: bloque **Club y marca** → **Configurar sede** (etiqueta MARCA).

| Qué | Detalle |
|-----|--------|
| Nombre del club | Texto que verán en la app |
| Ciudad | Si el formulario lo pide |
| Color | Color principal del club |
| Logo | Subir imagen **o** pegar **URL HTTPS** pública (ideal: Storage/CDN estable) |
| Guardar | Siempre al final |

**Recuperar** = volver a **Configurar sede** con la misma cuenta y editar + guardar.

**Código de invitación:** en el inicio (MI CLUB) o en sede; tocá para copiar y compartir con socios.

Más detalle técnico del logo: `docs/CLUB_LOGO_Y_URLS_SALA.md`.

## 4. Flujo completo recomendado

| Orden | Acción |
|------|--------|
| 1 | Entrar (sesión staff si aplica) |
| 2 | **Portal club** |
| 3 | **Configurar sede** → marca lista |
| 4 | **Configurar instalaciones** → asistente (nombre del salón, plano, mesas, tarifas) → **guardar** |
| 5 | **Salón en vivo** → operación diaria |
| 6 | **Reservas**, **Historial**, **Tarifas**, **Reportes** según necesidad |
| 7 | **Socios** si mantenés base de jugadores |
| 8 | **Torneos** (organizador) solo si hacés eventos |
| 9 | **TV / Duelo** si usás pantalla u OBS |

URLs canónicas (mismo dominio para todos los clubes; cambia el **usuario** que inicia sesión):

| Uso | Ruta |
|-----|------|
| Portal | `/club/` |
| Marca | `/apps/club/sala/admin_sede.html` |
| Instalaciones | `/apps/club/sala/mesas_config.html` |
| Salón en vivo | `/apps/club/sala/mesas.html` |

Enlaces viejos `/club/sala/...` sin `apps/` pueden fallar; el sitio redirige vía `_redirects` cuando corresponde.

## 5. Si algo falla

- Ventana privada o caché viejo (nombre/logo repetidos).
- Confirmar **rol club** en Supabase (`profiles`) si no ves el panel: `docs/FLUJO_JUGADOR_CLUB_ADMIN.md`, `docs/PASO1_RLS_MESAS.md`.

## Checklist operación completa (club + salón + tarifas + TV/OBS)

Ver **`docs/CHECKLIST_MINIMO_CLUB_SALON_TV.md`** — orden sugerido para producción y aclaración **MI CLUB = Portal club**.

## Referencias

- `docs/CHECKLIST_MINIMO_CLUB_SALON_TV.md` — **checklist mínimo** club → salón → tarifas → cámaras → Duelo Premium / OBS  
- `docs/FLUJO_JUGADOR_CLUB_ADMIN.md` — jugador vs club vs admin  
- `docs/CLUB_LOGO_Y_URLS_SALA.md` — logo y URLs sala  
- `NOTA_SALON_EN_VIVO.md` — Salón en vivo  
- `PASOS_MESAS_INSTALACIONES.md` — pasos mesas (si existe en el repo)
