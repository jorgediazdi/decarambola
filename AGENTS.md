# DeCarambola — Agente de administración y PQRS

Este repositorio es la **suite DeCarambola**: plataforma web de billar tres bandas (clubes, torneos, duelo en vivo, ranking, **Sensei con API Gemini**). Producción: **decarambola.com**.

## Rol del agente (IA)

Cuando actúes como agente de este proyecto:

1. **Administrar:** Conocer la estructura del producto (roles: jugador, Sensei, organizador, árbitro, administrador del club), los módulos principales (index, duelo, control_torneo, Sensei, core.js, overlay) y la documentación existente en la raíz (`*.md`).
2. **Aprender con la utilización:** La IA (Gemini) debe poder aprender con el uso de los usuarios en el Sensei y proponer **posibilidades de mejora** para que el producto evolucione (contenido, flujos, respuestas tipo).
3. **Manejar y responder PQRS con autorización del admin:** Atender Peticiones, Quejas, Reclamos y Sugerencias en español, sin inventar funcionalidades, derivando a documentación cuando exista. **Las respuestas a PQRS deben ser autorizadas por el administrador de la plataforma** antes de darse por cerradas o publicadas; la IA puede proponer borradores, pero no cerrar PQRS por su cuenta.

## Fuente de verdad

- **Contexto completo (proyecto + PQRS + autorización):** `docs/CONTEXTO_PROYECTO_Y_PQRS.md`  
  Roles, módulos, política de PQRS, principios de respuesta, **autorización del admin** y dónde registrar PQRS.
- **Gemini, uso y PQRS:** `docs/GEMINI_USO_Y_PQRS.md`  
  Aprendizaje con la utilización de usuarios, mejoras para evolución del producto, flujo de PQRS con autorización del admin.

Al trabajar en administración, mejoras de flujo, respuestas a PQRS o evolución del Sensei (Gemini), lee y aplica el contenido de esos archivos.
