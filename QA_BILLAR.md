# QA — DeCarambola Billar

## 1. Roles para billar

Los roles de sesión están definidos en **core.js** (objeto `SESSION`):

| Rol           | Uso                    | Timeout inactividad |
|---------------|------------------------|----------------------|
| `jugador`     | Navegación jugador     | 60 min               |
| `organizador` | Control torneos/clubes | 15 min               |
| `partida`     | Durante partida/árbitro| 30 min (+ 2 min aviso)|

- **Verificación:** En `core.js` líneas ~1009–1014 (`TIMEOUTS`) y ~1025 (`iniciar(rol)`).
- Las páginas que usan sesión deben llamar `SESSION.iniciar('jugador')`, `SESSION.iniciar('organizador')` o `SESSION.iniciar('partida')` según el contexto.
- `session.js` extiende `SESSION` con visibilidad del panel club (admin).

**Checklist:**
- [x] Roles `jugador`, `organizador`, `partida` existen en `core.js`.
- [ ] En cada pantalla relevante se llama `SESSION.iniciar(rol)` o `SESSION.verificarAlCargar(rol)`.

---

## 2. Club creado — qué se puede subir

### 2.1 Crear club desde la app (index → MI CLUB → Registrar mi club)

- **Antes:** Solo se guardaba en `localStorage` (`mis_clubes`, `club_activo`). Otros usuarios no podían unirse por código.
- **Ahora:** Al crear un club se intenta **INSERT** en Supabase tabla `clubs` (codigo, nombre, ciudad, color_primario, activo). Si Supabase lo acepta, el código queda disponible para que otros se unan.

**Checklist:**
- [x] Crear club intenta subir a Supabase (insert en `clubs`).
- [ ] En Supabase: tabla `clubs` con columnas al menos: `id`, `codigo`, `nombre`, `ciudad`, `color_primario`, `logo_url`, `activo`; y política RLS que permita INSERT con la clave anon/public que usa la app.

Si al crear club falla el INSERT, en Supabase SQL Editor puedes permitir inserciones anónimas (solo si tu app es pública):

```sql
-- Ejemplo: permitir INSERT en clubs para rol anon (ajusta si usas auth)
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert clubs" ON clubs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow select clubs" ON clubs FOR SELECT TO anon USING (true);
```

### 2.2 Logo y datos del club (admin / sede)

- **admin_sede.html:** Subida de logo a Supabase Storage (bucket `logos-clubes`), guardado de nombre, ciudad, color, PIN, etc. en `localStorage` (CLUB_CONFIG, CLUB_MESAS, ANUNCIO_IA).
- Para que el **logo y datos del club** se reflejen en Supabase (tabla `clubs`), hace falta que admin_sede o un flujo equivalente actualice la fila del club en `clubs` (por ejemplo `logo_url`, `color_primario`, `nombre`, `ciudad`). Actualmente el logo se sube a Storage y se guarda en WL/localStorage; si la tabla `clubs` tiene esa fila, se puede hacer PATCH a `clubs` con la URL del logo y el color.

**Checklist:**
- [x] Logo se sube a Supabase Storage desde admin_sede.
- [ ] (Opcional) Sincronizar nombre, ciudad, color y logo_url de la sede con la fila del club en `clubs` (PATCH) para que whitelabel y “unirse por código” vean el mismo dato.

---

## 3. Resumen

- **Roles billar:** Definidos en core.js; revisar que cada vista inicie el rol correcto.
- **Club creado:** Se sube a Supabase al crear desde index (INSERT `clubs`); verificar RLS en Supabase.
- **Logo y marca:** Se suben desde admin_sede (Storage + localStorage); opcionalmente mantener tabla `clubs` al día con PATCH.
