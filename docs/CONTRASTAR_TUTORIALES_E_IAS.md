# Cómo contrastar tutoriales (u otras IAs) con **este** proyecto

Otras fuentes suelen dar ejemplos genéricos (Next.js, tabla `club`, paquetes mal nombrados). **Este repo es la referencia** cuando algo no cuadra.

## 1. Regla de oro

> Si el tutorial dice X y **nuestro código o `docs/`** dicen Y → **gana este proyecto** (o actualizamos el proyecto a propósito).

## 2. Dónde mirar antes de copiar y pegar

| Tema | Dónde contrastar |
|------|------------------|
| Tablas y columnas Supabase | SQL en `supabase/`, `docs/CANON_CLUB_ID.md`, búsqueda en el repo por `.from('` |
| URLs y rutas de la app | `docs/CLUB_LOGO_Y_URLS_SALA.md`, `netlify.toml`, `club/index.html` |
| Auth / roles / mesas | `docs/PERMISOS_JUGADOR_VS_CLUB.md`, `js/sala-supabase-gate.js` |
| Keys y cliente JS en el navegador | `js/supabase-client.js`, `whitelabel.js` (no usar service role en frontend) |
| Script Node `check_club.js` | `check_club.js`, `.env.example`, `package.json` |

## 3. Señales de que el tutorial **no** es de este stack

- Paquete `@supabase/supabase-client` → en Node el correcto es **`@supabase/supabase-js`**.
- Tabla `club` en singular → aquí suele ser **`clubs`**.
- Solo variables `NEXT_PUBLIC_*` → acá también usamos **`SUPABASE_URL`** / **`SUPABASE_ANON_KEY`** en `.env` para scripts.
- “Pegá esto en `app/page.tsx`” → este proyecto es **HTML + JS estático** en muchas pantallas; la ruta no existe igual.

## 4. Cómo pedir ayuda (a una IA o a un dev) para que encaje

Decí explícitamente:

- “**En mi repo DeCarambola** la tabla se llama …”
- “Uso **Netlify** y publico desde la **raíz** (`netlify.toml`).”
- “El identificador de club es **`clubs.codigo`** en `profiles.club_id` (ver `CANON_CLUB_ID.md`).”

Así la respuesta se **adapta** a lo que querés, en lugar de quedarte con un ejemplo genérico.

## 5. Si algo falla después de copiar código

1. Leé el **mensaje de error** exacto (consola o terminal).
2. Buscá en el repo la **palabra** de la API que falla (`clubs`, `logo_url`, etc.).
3. Compará **versiones** (ej. Supabase v2 vs snippets v1).

---

**Resumen:** otras IAs **pueden equivocarse** o hablar de otro framework; vos adaptás contrastando con **archivos reales** y **`docs/`** de este proyecto.
