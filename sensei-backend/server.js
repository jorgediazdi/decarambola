/**
 * Backend mínimo — Registro de uso del Sensei (DeCarambola)
 * Endpoints: POST /uso (registrar evento), GET /informe (resumen para admin)
 * Almacenamiento: archivo JSON por defecto.
 */
try { require('dotenv').config(); } catch (e) { /* opcional */ }
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

// Carpeta de datos (misma que el proyecto o ./data)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const USO_FILE = path.join(DATA_DIR, 'uso_sensei.json');

app.use(express.json());

// CORS básico para que el front (decarambola.com o localhost) pueda llamar
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readUso() {
  ensureDataDir();
  if (!fs.existsSync(USO_FILE)) return [];
  try {
    const raw = fs.readFileSync(USO_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeUso(arr) {
  ensureDataDir();
  fs.writeFileSync(USO_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

// POST /uso — registrar evento de uso del Sensei
// Body: { tipo: "chat"|"biblioteca"|"analisis", modalidad?: string, tema_o_resumen?: string, util?: boolean, fecha?: string }
app.post('/uso', (req, res) => {
  const body = req.body || {};
  const tipo = body.tipo && ['chat', 'biblioteca', 'analisis'].includes(body.tipo) ? body.tipo : 'chat';
  const evento = {
    tipo,
    modalidad: typeof body.modalidad === 'string' ? body.modalidad.trim().slice(0, 80) : null,
    tema_o_resumen: typeof body.tema_o_resumen === 'string' ? body.tema_o_resumen.trim().slice(0, 500) : null,
    util: typeof body.util === 'boolean' ? body.util : null,
    fecha: body.fecha || new Date().toISOString(),
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  };
  const lista = readUso();
  lista.push(evento);
  writeUso(lista);
  res.status(201).json({ ok: true, id: evento.id });
});

// GET /informe — resumen para el admin (temas más consultados, no útiles, etc.)
// Query: ?dias=30 (últimos N días; por defecto 30)
app.get('/informe', (req, res) => {
  const dias = Math.max(1, parseInt(req.query.dias, 10) || 30);
  const desde = Date.now() - dias * 24 * 60 * 60 * 1000;
  const lista = readUso().filter(e => new Date(e.fecha).getTime() >= desde);

  const porTema = {};
  const noUtiles = [];
  let conUtil = 0;
  let sinUtil = 0;

  lista.forEach(e => {
    const tema = (e.tema_o_resumen || '(sin tema)').trim().toLowerCase().slice(0, 120);
    if (tema) {
      porTema[tema] = (porTema[tema] || 0) + 1;
    }
    if (e.util === false) noUtiles.push({ tema: e.tema_o_resumen, fecha: e.fecha });
    if (e.util === true) conUtil++;
    if (e.util === false) sinUtil++;
  });

  const temasTop = Object.entries(porTema)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tema, count]) => ({ tema, count }));

  res.json({
    desde: new Date(desde).toISOString(),
    dias,
    total_eventos: lista.length,
    por_tipo: {
      chat: lista.filter(e => e.tipo === 'chat').length,
      biblioteca: lista.filter(e => e.tipo === 'biblioteca').length,
      analisis: lista.filter(e => e.tipo === 'analisis').length
    },
    temas_mas_consultados: temasTop,
    no_utiles: noUtiles.slice(-50),
    resumen_util: { si: conUtil, no: sinUtil }
  });
});

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'sensei-backend-uso' });
});

app.listen(PORT, () => {
  console.log('Sensei backend (uso) escuchando en puerto', PORT);
  console.log('POST /uso — registrar evento');
  console.log('GET /informe?dias=30 — informe para admin');
});
