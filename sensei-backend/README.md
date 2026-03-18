# Sensei backend — Registro de uso

Backend mínimo (Node.js + Express) para **registrar el uso del Sensei** (chat, biblioteca, análisis) y generar un **informe periódico** para el admin. Compatible con `docs/PASOS_APRENDIZAJE_SENSEI.md`.

**Prueba en caliente:** Cuando tengas todo levantado (app + este backend), activa el registro así: 1) Ejecuta aquí `npm install` y `npm start`. 2) En Sensei.html asigna la URL del backend a `SENSEI_USO_API` (ej. `'http://localhost:3456'` en local o la URL del backend en producción). 3) Usa el Sensei y revisa GET `/informe?dias=30`. Hasta entonces se puede dejar `SENSEI_USO_API = ''` y el Sensei funciona sin registrar uso.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/uso` | Registra un evento de uso. Body: `{ tipo, modalidad?, tema_o_resumen?, util?, fecha? }`. |
| GET | `/informe?dias=30` | Devuelve resumen: temas más consultados, consultas "no útiles", conteos por tipo. |
| GET | `/health` | Comprueba que el servicio está vivo. |

## Instalación y ejecución

**Requisito:** tener **Node.js** instalado (nodejs.org o `brew install node`).

```bash
cd sensei-backend
npm install
npm start
```

Por defecto escucha en el puerto **3456**. Debes ver en consola: `Sensei backend (uso) escuchando en puerto 3456`.

**Si localhost:3456 no funciona:**
1. ¿Ejecutaste `npm install` y `npm start` dentro de `sensei-backend`?
2. ¿Tienes Node instalado? Prueba en terminal: `node -v` y `npm -v`.
3. Prueba en el navegador: abre **http://localhost:3456/health** — debe devolver `{"ok":true,"service":"sensei-backend-uso"}`.
4. Si abres Sensei como archivo (file://), algunos navegadores restringen peticiones a localhost; abre el front con un servidor local (ej. Live Server en el puerto que sea) y en Sensei.html pon `SENSEI_USO_API = 'http://localhost:3456'`. Para cambiar:

```bash
PORT=4000 npm start
```

Variables de entorno opcionales:

- `PORT` — Puerto (por defecto 3456).
- `DATA_DIR` — Carpeta donde se guarda `uso_sensei.json` (por defecto `./data`).

## Datos

Los eventos se guardan en `data/uso_sensei.json` (o en `DATA_DIR`). No se guardan datos personales; solo tipo, modalidad, resumen de tema y si la respuesta fue útil.

## Despliegue

Puedes desplegar este servicio en Render, Railway, Fly.io, o cualquier host Node. Configura la URL base en el front (Sensei.html) para que apunte a tu instancia (p. ej. `https://sensei-uso.onrender.com`).

## Relación con el front

En **Sensei.html** (suite DeCarambola) se puede:

1. Tras cada respuesta del Sensei, hacer `POST /uso` con `tipo`, `modalidad`, `tema_o_resumen`.
2. Mostrar un botón "¿Te sirvió?" y enviar `POST /uso` con `util: true/false` (y el mismo evento o un id de evento).

La URL del backend debe ser configurable (variable o config) para desarrollo y producción.

## Referencias

- `docs/PASOS_APRENDIZAJE_SENSEI.md` — Checklist completo (backend + front).
- `docs/GEMINI_USO_Y_PQRS.md` — Aprendizaje con la utilización e informe para el admin.
