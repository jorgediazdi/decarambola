# Qué hacer para tener Auth (paso a paso)

Haz esto **en orden**. Son ~15 minutos la primera vez.

---

## Paso 1 — Activar correo en Supabase (tú, en el navegador)

1. Entra a [supabase.com](https://supabase.com) → tu proyecto (**iwvogyloebvieloequzr** o el que uses).
2. Menú **Authentication** → **Providers**.
3. En **Email** deja **Enabled** activado.
4. (Opcional) Desactiva “Confirm email” solo en **desarrollo** para no tener que abrir el mail cada vez:  
   **Authentication** → **Providers** → **Email** → “Confirm email” **OFF** (en producción vuelve a **ON**).

---

## Paso 2 — URLs de tu web (evita errores al redirigir)

1. **Authentication** → **URL Configuration**.
2. **Site URL:** tu URL real, por ejemplo `https://TU-SITIO.netlify.app` (o `http://localhost:8080` si pruebas en local).
3. **Redirect URLs:** añade la misma URL y, si quieres, `http://127.0.0.1:5500/**` (Live Server de VS Code).

Guarda cambios.

---

## Paso 3 — Crear tabla `profiles` y RLS (SQL)

1. En Supabase: **SQL Editor** → **New query**.
2. Abre el archivo del repo: **`supabase/migrations/001_profiles_auth.sql`**.
3. Copia **todo** el contenido, pégalo en el editor y pulsa **Run**.

Si no da error, ya tienes:

- Tabla `public.profiles` (una fila por usuario).
- Políticas: cada usuario solo lee/edita **su** fila.
- Trigger: al registrarse, se crea la fila en `profiles` sola.

---

## Paso 4 — Probar login en la web

1. Sube el proyecto a Netlify (o abre en local con un servidor estático).
2. Abre **`/auth.html`** en el navegador.
3. **Crear cuenta:** email + contraseña (mínimo lo que pida Supabase, suele ser 6 caracteres).
4. **Iniciar sesión** con ese mismo email.

Si ves tu correo arriba y “Cerrar sesión”, **Auth funciona**.

---

## Paso 5 — Qué viene después (no lo tienes que hacer hoy)

- Hacer que **`core.js`** use el **token del usuario** (`session.access_token`) en las peticiones a tablas protegidas, en lugar de solo la anon key.
- Añadir RLS al resto de tablas (`clubs`, `jugadores`, PQRS, etc.) según `docs/MATRIZ_ROLES_SUPABASE_IMPLEMENTACION.md`.

---

## Si algo falla

| Síntoma | Qué revisar |
|---------|-------------|
| “Invalid login” / “Invalid login credentials” | **No es un error de la web:** Supabase no encontró esa pareja correo+clave. Revisa mayúsculas/espacios en el correo; si nunca creaste usuario en **este** proyecto, usa **Crear cuenta**; si olvidaste la clave, en **`auth.html`** usa **¿Olvidaste la contraseña?** (o en Supabase → **Authentication** → **Users** → tu usuario → **Send password recovery** / **Reset password**). |
| “Email not confirmed” | Activa usuario en **Authentication** → **Users** o desactiva confirmación en desarrollo (Paso 1). |
| Pantalla en blanco / error consola | Abre **F12 → Consola** y copia el mensaje. |
| SQL error al ejecutar migración | Puede que la tabla ya exista; dime el texto exacto del error. |

---

## Cliente en un módulo (para Cursor / páginas nuevas)

Archivo **`js/supabase-client.js`** exporta `supabase` listo para importar (usa CDN ESM, sin npm):

```html
<script type="module">
  import { supabase } from './js/supabase-client.js';

  const { data, error } = await supabase.from('mesas').select('*').limit(5);
  console.log(data, error);
</script>
```

Ruta recomendada en HTML: `/js/supabase-client.js` (absoluta desde la raíz del sitio).

Con **Vite** u otro bundler, en `supabase-client.js` cambia la primera línea a  
`import { createClient } from '@supabase/supabase-js'` y configura URL/key con variables de entorno.

---

## Archivos que añadimos en el repo

| Archivo | Para qué |
|---------|----------|
| `auth.html` | Pantalla Entrar / Registrarse / Salir |
| `js/supabase-client.js` | `createClient` + export `supabase` (ESM) |
| `supabase/migrations/001_profiles_auth.sql` | Tabla + RLS + trigger |
| `docs/PASOS_AUTH_EMPEZAR.md` | Esta guía |

La **anon key** ya está en `core.js`; `auth.html` usa la misma (es pública y está pensada para el navegador). **Nunca** pongas la **service_role** en el front.
