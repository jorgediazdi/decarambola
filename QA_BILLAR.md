# QA — DeCarambola Billar

**Estado:** **ACTIVO** — referencia técnica (sesión `SESSION`, club, Supabase).

**Deploy / pruebas navegador:** `docs/QA_CHECKLIST_SUBIDA.md` (incluye duelo, certificados, Sensei, etc.).

---

## 1. Roles para billar

Los roles de sesión están definidos en **core.js** (objeto `SESSION`):

| Rol           | Uso                    | Timeout inactividad |
|---------------|------------------------|----------------------|
| `jugador`     | Navegacion jugador     | 60 min               |
| `organizador` | Control torneos/clubes | 15 min               |
| `partida`     | Durante partida/árbitro| 30 min (+ 2 min aviso)|

- **Verificación:** En `core.js` (~`TIMEOUTS`, `iniciar(rol)`).
- Las páginas relevantes deben llamar `SESSION.iniciar(rol)` o `SESSION.verificarAlCargar(rol)`.
- `session.js` extiende `SESSION` con visibilidad del panel club.

**Checklist tecnica:**

- [x] Roles `jugador`, `organizador`, `partida` existen en `core.js`.
- [ ] En cada pantalla relevante se llama `SESSION.iniciar(rol)` o `SESSION.verificarAlCargar(rol)`.

---

## 2. Club creado — qué se puede subir

### 2.1 Crear club desde la app (index → MI CLUB → Registrar mi club)

- Al crear club se intenta **INSERT** en Supabase tabla `clubs` (codigo, nombre, ciudad, color_primario, activo).

**Checklist:**

- [x] Crear club intenta subir a Supabase (insert en `clubs`).
- [ ] En Supabase: tabla `clubs` con columnas mínimas y RLS acorde (ver `docs/SUPABASE_TABLAS.md` / políticas del proyecto).

Ejemplo de políticas (ajustar a tu entorno; no copiar a ciegas en producción):

```sql
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert clubs" ON clubs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow select clubs" ON clubs FOR SELECT TO anon USING (true);
```

### 2.2 Logo y datos del club (admin / sede)

- **admin_sede.html:** logo a Storage (`logos-clubes`), datos en localStorage / WL.
- Opcional: **PATCH** a `clubs` para `logo_url`, `color_primario`, etc., alineado con whitelabel.

**Checklist:**

- [x] Logo se sube a Storage desde admin_sede.
- [ ] (Opcional) Sincronizar fila `clubs` con nombre, ciudad, color, logo_url.

---

## 3. Resumen

- **Roles:** definidos en `core.js`; revisar cada vista.
- **Club:** INSERT en `clubs` al crear; verificar RLS.
- **Marca:** Storage + localStorage; opcional PATCH `clubs`.
