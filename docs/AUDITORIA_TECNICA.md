# Auditoría técnica — criterios (DeCarambola)

Una **auditoría** no es solo “tocar código”: es **comprobar** lo existente y **decidir** si hace falta cambio.

## 1. Seguridad

- **Servidor manda**: RLS, políticas en `clubs` / `profiles`, auth. El navegador es **no confiable**.
- **Claves**: anon key en cliente está bien diseñado; no meter service role en front.
- **Superficie**: qué datos se filtran por `club_id` / `codigo`; evitar `.eq()` con valores vacíos o ambiguos.
- **Sesión**: qué pasa si el usuario manipula `localStorage` (solo UX; no sustituir validación en API).

## 2. Eficiencia

- **Red**: peticiones duplicadas, carreras (dos fetch o dos update a la vez), `paint()` innecesario.
- **CPU/DOM**: bucles sobre muchos nodos sin necesidad; repintados en cascada.

## 3. Mantenibilidad

- **Una regla, un sitio** (ej. `clubsFilter` para id vs codigo).
- **Comentarios** donde el negocio no es obvio (qué es “paso 5” en BD).
- **Legacy**: migrar o borrar rutas muertas (`localStorage` viejo, flags duplicados).

## 4. Cuándo **no** cambiar

- Si el riesgo es bajo y el coste de regresión es alto, documentar y dejar para otro sprint.
- Si el “arreglo” solo mueve el problema (ej. otro flag duplicado).

## Ejemplo aplicado: `js/club-setup-guide.js`

- Coherencia SELECT/UPDATE con la misma clave y `clubsFilter`.
- Control de carreras (`fetchInFlight`, `markMutationInFlight`).
- Sin estado de pasos 5–6 en `localStorage`; solo `removeItem` legacy explícito.
- Comentario de cabecera recordando que **RLS** es la autoridad en producción.
