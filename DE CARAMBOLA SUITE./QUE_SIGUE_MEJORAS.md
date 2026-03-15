# Qué sigue · Qué falta · Comparado con lo mejor

## Lo que ya tienes (muy sólido)

| Área | Qué hay |
|------|--------|
| **Jugador** | Perfil, partidas (duelo), entrenamiento, inscripciones, retos, ranking, categorías, certificados, Sensei (IA billar) |
| **Club** | Unirse/crear por código, whitelabel (marca/logo), admin sede, mesas e instalaciones, reservas, reportes, historial, socios |
| **Eventos** | Crear torneo, control, brackets, posiciones, inscripciones |
| **Técnico** | Supabase + fallback localStorage, roles (jugador/organizador/partida), versionado/caché |

Para un producto de **billar tres bandas** con clubes y torneos, esto ya está a nivel **muy bueno** y cubre casi todo el ciclo (jugador, club, mesas, torneos).

---

## Comparado con “lo mejor” — qué suele tener una app top

Las mejores apps de deporte/clubes suelen añadir:

1. **Login real** (email/contraseña o redes) + recuperar contraseña, no solo identificación por cédula.
2. **PWA** (instalable en el móvil, icono en la pantalla, algo de uso offline).
3. **Notificaciones push** (recordatorios de partidas, torneos, mensajes del club).
4. **Pagos** (cuotas del club, inscripciones de torneos, reserva de mesas).
5. **Mensajería / avisos** dentro del club (comunicados, horarios).
6. **App nativa** (iOS/Android) o al menos PWA muy pulida.

En tu caso **no hace falta tener todo eso para ser “la mejor” en tu nicho**: puedes ser la mejor en **billar tres bandas + clubes + torneos** centrándote en lo que ya haces bien y en 2–3 mejoras clave.

---

## Sugerencia: qué sigue (priorizado)

### Corto plazo (rápido y con impacto)

1. **Completar QA de sesión**  
   Que cada pantalla relevante llame `SESSION.iniciar(rol)` o `SESSION.verificarAlCargar(rol)` según corresponda (jugador / organizador / partida). Así los timeouts y la experiencia son consistentes.

2. **Sincronizar club en Supabase**  
   Cuando en admin_sede se sube logo o se cambia nombre/ciudad/color, hacer **PATCH** a la tabla `clubs` para que “unirse por código” y whitelabel vean siempre el mismo dato. Revisar/ajustar RLS para que el INSERT al crear club funcione en producción.

3. **PWA mínima**  
   Añadir `manifest.json` (nombre, iconos, colores) y, si quieres, un service worker muy simple para “Añadir a la pantalla de inicio”. No hace falta modo offline completo al principio.

### Medio plazo (siguiente nivel)

4. **Login opcional**  
   Mantener cédula como hoy y añadir **login con email/contraseña** (Supabase Auth). Quien quiera puede tener cuenta recuperable y mismo perfil en varios dispositivos.

5. **Notificaciones**  
   Avisos del club o del torneo (ej. “Tu partida es a las 18:00”) por **notificaciones push** (Web Push + Supabase o similar). Empieza por 1–2 tipos de avisos (partida, torneo).

6. **Pagos**  
   Aunque sea solo para un caso (ej. inscripción a torneo o reserva de mesa), integrar un pasarela (Stripe, Mercado Pago, etc.) da sensación de producto “de verdad” y abre monetización.

### Largo plazo (si quieres acercarte al “top” genérico)

7. **Mensajería / avisos del club**  
   Un muro o lista de comunicados del club (texto + fecha), sin necesidad de chat en tiempo real al inicio.

8. **App instalable muy pulida**  
   PWA con iconos, splash y comportamiento “app-like” en móvil; luego valorar app nativa solo si el uso lo pide.

9. **Analíticas y métricas**  
   Dashboard sencillo para el club: partidas por mes, uso de mesas, ingresos, picos de uso, etc.

---

## ¿Es esta la mejor?

- **En tu nicho (billar tres bandas + clubes + torneos en Colombia / región):** puedes ser **la mejor** porque integras en un solo sitio: jugador, club, mesas, reservas, torneos, Sensei y whitelabel. Eso no es común.
- **Frente a una app genérica “top” (multi-deporte, con pagos, push, app nativa):** faltan sobre todo login “clásico”, PWA/instalable, push y pagos. No son requisitos para ser la mejor en billar; son el siguiente escalón si quieres crecer hacia un producto más estándar.

**Resumen:** Lo que sigue con más sentido es: **(1) QA de sesión**, **(2) sincronizar club en Supabase** y **(3) PWA mínima**. Con eso la base queda muy sólida; después puedes elegir login, notificaciones o pagos según prioridad de negocio.
