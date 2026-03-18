# Pasos para implementar aprendizaje con la utilización (Sensei)

Checklist para el **registro de uso** del Sensei y el **informe periódico** para el admin.

---

## 1. Backend (registro de uso e informe)

**Implementado en este repo:** carpeta **`sensei-backend/`** (Node.js + Express).

| Paso | Qué hace |
|------|-----------|
| 1.1 | **POST /uso** — Recibe `{ tipo, modalidad?, tema_o_resumen?, util?, fecha? }` y guarda en `data/uso_sensei.json`. |
| 1.2 | Almacenamiento en archivo JSON (sin datos personales). |
| 1.3 | **GET /informe?dias=30** — Devuelve temas más consultados, consultas "no útiles", conteos por tipo. |
| 1.4 | El admin puede llamar a `/informe` (o descargar desde un panel) y usar el resultado para **MEJORAS_SUGERIDAS.md**. |

**Cómo usar:** `cd sensei-backend && npm install && npm start` (puerto 3456). Ver **`sensei-backend/README.md`** para despliegue (Render, Railway, etc.).

---

## 2. Front (Sensei.html)

| Paso | Estado |
|------|--------|
| 2.1 | Tras cada respuesta del chat, se llama a **POST /uso** con `tipo: 'chat'`, `modalidad`, `tema_o_resumen` (primeros 200 caracteres del mensaje del usuario) **si** está configurada la variable `SENSEI_USO_API` (URL del backend de uso). |
| 2.2 | Botón **"¿Te sirvió? Sí | No"** junto a cada respuesta del Sensei (solo si `SENSEI_USO_API` tiene valor); al pulsar se envía `util: true/false` al mismo endpoint. |

**Activar el registro:** En `Sensei.html`, asignar la URL de tu backend de uso a `SENSEI_USO_API` (p. ej. `'https://sensei-uso.onrender.com'` o `'http://localhost:3456'`). Si queda en `''`, no se envía nada.

---

## 3. Priorización

- Usar el informe + las **sugerencias de PQRS** (tabla `pqrs`, tipo sugerencia) para rellenar **docs/MEJORAS_SUGERIDAS.md** y decidir: nuevo contenido en biblioteca, ajustes de prompt, respuestas tipo para PQRS recurrentes.

---

*Referencia: `docs/GEMINI_USO_Y_PQRS.md` (sección 2 y 3). Backend: `sensei-backend/README.md`.*
