# Gemini, aprendizaje por uso y PQRS con autorización del admin

Este documento detalla cómo hacer que el **Sensei (API Gemini)** aprenda con la utilización de los usuarios, genere **posibilidades de mejora** para que el producto evolucione, y cómo las **PQRS se contesten con autorización del administrador de la plataforma**.

---

## 1. API Gemini en el proyecto

- El **Sensei** (chat, biblioteca, analizar jugada) está soportado por una API que utiliza **Gemini** (p. ej. sensei-billar-api.onrender.com con Gemini como motor).
- El front llama a esa API (`/chat`, análisis de video/imagen); el backend envía las peticiones a Gemini y devuelve la respuesta.
- Para que el producto **evolucione** y las **PQRS se contesten con autorización del admin**, conviene:
  - Registrar uso (qué preguntan, qué temas, qué fallos) de forma que se pueda aprender.
  - Usar ese conocimiento para proponer mejoras.
  - Hacer que las respuestas a PQRS pasen por un flujo donde el **admin de la plataforma autorice** antes de darlas por válidas.

---

## 2. Aprender con la utilización de los usuarios

### 2.1 Qué registrar (sin invadir privacidad)

- **Consultas al Sensei:** tema o tipo (chat, biblioteca, análisis de jugada), modalidad (tres bandas, libre, snooker), y si la respuesta fue útil (si añades botón “¿Te sirvió?”).
- **Errores o fallos:** cuando la API falle o el usuario reporte que la respuesta no sirvió.
- **Temas más pedidos:** agregado (p. ej. “sistema de diamantes” 50 veces, “efecto lateral” 30), no el texto literal de cada usuario si quieres mantener privacidad.

### 2.2 Dónde guardar

- **Opción rápida:** En el backend que ya usa Gemini, escribir en un almacenamiento simple (archivo, Supabase, etc.) cada evento: `{ tipo: "chat"|"biblioteca"|"analisis", modalidad, tema_o_resumen, util (true/false), fecha }`.
- **Uso:** Periódicamente (semanal o mensual) generar un **resumen para el admin**: “Temas más consultados”, “Consultas sin buena respuesta”, “Sugerencias implícitas” (temas que se buscan y no hay contenido). Ese resumen son **posibilidades de mejora** para que el producto evolucione.

### 2.3 Cómo hacer que Gemini “aprenda” con eso

- **Contexto dinámico:** Incluir en el system prompt (o en el contexto que se envía a Gemini) un resumen reciente: “Los usuarios preguntan mucho por X e Y; evita inventar sobre Z si no está en la documentación.”
- **Mejoras de contenido:** Usar el informe de “temas más pedidos” y “sin buena respuesta” para añadir entradas en la biblioteca del Sensei o ajustar las respuestas tipo.
- **No hace falta fine-tuning** al inicio; con un buen **prompt + contexto de uso** ya se mejora la calidad y la evolución del producto.

---

## 3. Posibilidades de mejora para que el producto evolucione

- **Informe periódico (para el admin):** “En el último mes: N consultas al Sensei; temas top: A, B, C; consultas marcadas como no útiles: D, E; sugerencias implícitas: F, G.”
- **Lista de mejoras sugeridas:** Con eso el admin (o el agente con autorización) puede priorizar: nuevo contenido en Sensei, cambios de flujo, o respuestas tipo para PQRS recurrentes.
- **Documentación:** Mantener en `docs/` (o en el repo) un **MEJORAS_SUGERIDAS.md** o similar, alimentado por ese informe y por las PQRS, para que el agente y el admin sepan qué evolucionar primero. Ver `docs/MEJORAS_SUGERIDAS.md` y, para implementar el registro de uso, `docs/PASOS_APRENDIZAJE_SENSEI.md`.

---

## 4. PQRS: que se contesten con autorización del admin

### 4.1 Contacto y PQRS: agente Joe (no Sensei)

**Sensei** es solo para **temas de juego** (billar, técnicas, sistemas, analizar jugada). **Contacto, PQRS e información de la plataforma y servicios de administración** tienen un agente propio: **Joe**. El usuario entra por "Joe — Contacto y PQRS" (menú en Sensei o enlace en el footer de index → `Sensei.html?contacto=1`). Joe pide de forma conversacional: (1) nombre, (2) correo o teléfono para responderte, (3) mensaje. Los datos se guardan en `localStorage` (`PQRS_CONTACTOS`) y, si existe, se envían al backend (`/contacto`). Joe tiene nombre e identidad propias para que quede claro que es la parte de **administración y contacto** de la plataforma, no el maestro de billar.

### 4.2 Flujo recomendado (respuesta con autorización)

1. **Entrada:** El usuario envía una Petición, Queja, Reclamo o Sugerencia mediante el **mismo Sensei** (flujo Contactar / PQRS que pide nombre, contacto y mensaje).
2. **Registro:** Se guarda en `docs/pqrs/` o en base de datos (Supabase), con estado **pendiente_revision**.
3. **Borrador (opcional):** Gemini puede generar un **borrador de respuesta** usando el contexto del proyecto (`docs/CONTEXTO_PROYECTO_Y_PQRS.md`) y las reglas de respuesta (español, no inventar, derivar a documentación). Ese borrador **no** se envía al usuario aún.
4. **Autorización del admin:** El **administrador de la plataforma** revisa la PQRS y el borrador (si existe), y:
   - **Autoriza** la respuesta (tal cual o editada) → estado **autorizado** y entonces se puede enviar/publicar la respuesta al usuario.
   - **Rechaza** o pide cambios → queda en **pendiente_revision** hasta que el admin apruebe algo.
5. **Cierre:** Solo cuando el admin ha **autorizado**, se considera la PQRS respondida y se puede marcar como cerrada.

Así **las PQRS se contesten, pero al menos con autorización del admin de la plataforma**; la IA no compromete a la plataforma por su cuenta.

### 4.2 Dónde implementar la autorización

- **Opción A (manual):** El admin entra a `docs/pqrs/REGISTRO_PQRS.md` (o a una lista en Supabase), ve las PQRS pendientes y los borradores generados por Gemini (guardados en el mismo registro), y escribe “Autorizado” o la respuesta final; luego alguien envía la respuesta al usuario por el canal acordado.
- **Opción B (panel admin):** Una pantalla “PQRS pendientes” en la zona de administración (solo para quien tenga clave de admin): lista de PQRS, borrador propuesto por Gemini, botones “Autorizar y enviar” / “Editar” / “Rechazar”. Al autorizar, se guarda la respuesta y el estado “autorizado” y, si está integrado, se envía por correo o se muestra en la web al usuario.

### 4.4 Qué debe recordar el agente (Gemini / Cursor)

- Proponer respuestas tipo para PQRS está bien.
- **Nunca** dar por cerrada una PQRS ni publicar una respuesta oficial sin que conste la **autorización del administrador de la plataforma**.
- Si el usuario pregunta “¿ya me respondieron?”, el agente puede decir “está en revisión” o “pendiente de autorización del administrador” hasta que el admin haya autorizado.

---

## 5. Resumen

| Objetivo | Cómo |
|----------|------|
| **Aprender con la utilización** | Registrar uso del Sensei (tipo, tema, utilidad) en backend; informe periódico para el admin. |
| **Evolución del producto** | Usar ese informe + PQRS para priorizar mejoras (contenido Sensei, flujos, respuestas tipo); documentar en MEJORAS_SUGERIDAS o similar. |
| **PQRS contestadas con autorización** | Registrar PQRS → (opcional) Gemini propone borrador → **admin autoriza** → solo entonces se da por respondida y se envía al usuario. |

Todo esto es compatible con trabajar sobre la **API de Gemini** que ya utilizas en el Sensei: el mismo backend puede registrar uso, generar borradores de respuestas a PQRS y exponer un flujo de autorización para el admin.
