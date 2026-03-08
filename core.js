/* ============================================================
   MASTER VIP — CORE ENGINE v2.0
   Motor central: Sede, Jugadores, Torneos, Ranking
   ============================================================ */

const MasterVIP = {

    // ─────────────────────────────────────────
    // 1. SEDE / CLUB
    // ─────────────────────────────────────────
    getSede: function () {
        return JSON.parse(localStorage.getItem('CONFIG_SEDE_ACTIVA')) || { nombre: 'GLOBAL', pin: '0000' };
    },

    setSede: function (nombre, pin) {
        const config = { nombre: nombre.toUpperCase(), pin: pin };
        localStorage.setItem('CONFIG_SEDE_ACTIVA', JSON.stringify(config));
        sessionStorage.setItem('club_activo', config.nombre);
        return config;
    },

    // ─────────────────────────────────────────
    // 2. JUGADORES REGISTRADOS EN LA PLATAFORMA
    // ─────────────────────────────────────────
    getJugadores: function () {
        return JSON.parse(localStorage.getItem('JUGADORES_PLATAFORMA')) || [];
    },

    guardarJugador: function (jugador) {
        let lista = this.getJugadores();
        const idx = lista.findIndex(j => j.nombre === jugador.nombre);
        if (idx >= 0) {
            lista[idx] = { ...lista[idx], ...jugador };
        } else {
            jugador.id = 'J' + Date.now();
            jugador.fechaRegistro = new Date().toISOString();
            jugador.promedio = parseFloat(jugador.promedio) || 0;
            lista.push(jugador);
        }
        localStorage.setItem('JUGADORES_PLATAFORMA', JSON.stringify(lista));
        return jugador;
    },

    buscarJugador: function (nombre) {
        return this.getJugadores().find(j => j.nombre.toUpperCase() === nombre.toUpperCase()) || null;
    },

    // ─────────────────────────────────────────
    // 3. TORNEOS
    // ─────────────────────────────────────────
    getTorneos: function () {
        return JSON.parse(localStorage.getItem('TORNEOS_LISTA')) || [];
    },

    getTorneoActivo: function () {
        const id = localStorage.getItem('TORNEO_ACTIVO_ID');
        if (!id) return null;
        return this.getTorneos().find(t => t.id === id) || null;
    },

    crearTorneo: function (config) {
        let torneos = this.getTorneos();
        const torneo = {
            id: 'T' + Date.now(),
            codigo: 'MV-' + new Date().getFullYear() + '-' + String(torneos.length + 1).padStart(4, '0'),
            nombre: config.nombre.toUpperCase(),
            sede: this.getSede().nombre,
            sistema: config.sistema,         // 'brackets' | 'grupos' | 'survivor'
            cupoMax: parseInt(config.cupoMax),
            inscripcion: parseFloat(config.inscripcion) || 0,
            baseClub: parseFloat(config.baseClub) || 0,
            pctPremios: parseFloat(config.pctPremios) || 80,
            pctFee: parseFloat(config.pctFee) || 20,
            entradaObjetivo: parseInt(config.entradaObjetivo) || 0,
            tiempoEntrada: parseInt(config.tiempoEntrada) || 40,
            modalidad: config.modalidad || 'Libre',
            reglamento: config.reglamento || '',
            estado: 'ABIERTO',              // ABIERTO | CERRADO | EN_CURSO | FINALIZADO
            inscritos: [],
            rondas: [],
            posiciones: [],
            fechaCreacion: new Date().toISOString(),
            fechaInicio: config.fechaInicio || null,
            campeon: null
        };
        torneos.push(torneo);
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
        localStorage.setItem('TORNEO_ACTIVO_ID', torneo.id);
        return torneo;
    },

    actualizarTorneo: function (torneo) {
        let torneos = this.getTorneos();
        const idx = torneos.findIndex(t => t.id === torneo.id);
        if (idx >= 0) torneos[idx] = torneo;
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
    },

    // ─────────────────────────────────────────
    // 4. INSCRIPCIONES
    // ─────────────────────────────────────────
    inscribirJugador: function (torneoId, jugador) {
        let torneos = this.getTorneos();
        const idx = torneos.findIndex(t => t.id === torneoId);
        if (idx < 0) return { ok: false, msg: 'Torneo no encontrado' };

        const t = torneos[idx];
        if (t.estado !== 'ABIERTO') return { ok: false, msg: 'El torneo ya no acepta inscripciones' };
        if (t.inscritos.length >= t.cupoMax) return { ok: false, msg: 'El torneo está lleno' };
        if (t.inscritos.find(j => j.nombre === jugador.nombre)) return { ok: false, msg: 'Este jugador ya está inscrito' };

        t.inscritos.push({
            nombre: jugador.nombre,
            tel: jugador.tel || '',
            promedio: parseFloat(jugador.promedio) || 0,
            eliminado: false,
            bye: false
        });

        torneos[idx] = t;
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
        return { ok: true, msg: 'Inscrito correctamente', total: t.inscritos.length };
    },

    // ─────────────────────────────────────────
    // 5. SORTEO Y GENERACIÓN DE BRACKETS
    // ─────────────────────────────────────────
    realizarSorteo: function (torneoId) {
        let torneos = this.getTorneos();
        const idx = torneos.findIndex(t => t.id === torneoId);
        if (idx < 0) return { ok: false, msg: 'Torneo no encontrado' };

        const t = torneos[idx];
        if (t.inscritos.length < 2) return { ok: false, msg: 'Se necesitan al menos 2 jugadores' };

        // Mezcla aleatoria
        let jugadores = [...t.inscritos].sort(() => Math.random() - 0.5);

        // Manejo de número impar → BYE al mejor promedio
        if (jugadores.length % 2 !== 0) {
            jugadores.sort((a, b) => b.promedio - a.promedio);
            jugadores[0].bye = true;
            jugadores = jugadores.sort(() => Math.random() - 0.5);
        }

        if (t.sistema === 'survivor') {
            // Survivor: solo una tabla ordenada, sin brackets
            t.posiciones = jugadores.map((j, i) => ({ ...j, pos: i + 1, promTorneo: j.promedio, partidasJugadas: 0 }));
            t.rondas = [{ numero: 1, estado: 'EN_CURSO', partidas: this._generarRondaSurvivor(jugadores) }];
        } else {
            // Brackets o Grupos
            t.rondas = [{ numero: 1, estado: 'EN_CURSO', partidas: this._generarPartidas(jugadores, 1) }];
        }

        t.estado = 'EN_CURSO';
        t.inscritos = jugadores;
        torneos[idx] = t;
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
        localStorage.setItem('TORNEO_ACTIVO_ID', t.id);
        return { ok: true, torneo: t };
    },

    _generarPartidas: function (jugadores, numRonda) {
        const partidas = [];
        for (let i = 0; i < jugadores.length; i += 2) {
            const j1 = jugadores[i];
            const j2 = jugadores[i + 1] || null;
            partidas.push({
                id: 'P' + Date.now() + i,
                ronda: numRonda,
                j1: j1.nombre,
                j2: j2 ? j2.nombre : 'BYE',
                prom1: j1.promedio,
                prom2: j2 ? j2.promedio : 0,
                pts1: 0,
                pts2: 0,
                ganador: j2 ? null : j1.nombre,  // BYE avanza solo
                estado: j2 ? 'PENDIENTE' : 'BYE', // PENDIENTE | LISTO_J1 | LISTO_J2 | EN_JUEGO | TERMINADA | BYE
                listoJ1: false,
                listoJ2: false,
                promFinalJ1: 0,
                promFinalJ2: 0
            });
        }
        return partidas;
    },

    _generarRondaSurvivor: function (jugadores) {
        // En survivor todos juegan contra el siguiente en la tabla
        const partidas = [];
        for (let i = 0; i < jugadores.length; i += 2) {
            if (jugadores[i + 1]) {
                partidas.push({
                    id: 'PS' + Date.now() + i,
                    ronda: 1,
                    j1: jugadores[i].nombre,
                    j2: jugadores[i + 1].nombre,
                    pts1: 0, pts2: 0,
                    promFinalJ1: 0, promFinalJ2: 0,
                    ganador: null,
                    estado: 'PENDIENTE',
                    listoJ1: false, listoJ2: false
                });
            }
        }
        return partidas;
    },

    // ─────────────────────────────────────────
    // 6. REGISTRAR RESULTADO DE PARTIDA
    // ─────────────────────────────────────────
    registrarResultado: function (torneoId, partidaId, resultado) {
        let torneos = this.getTorneos();
        const idx = torneos.findIndex(t => t.id === torneoId);
        if (idx < 0) return { ok: false };

        let torneo = torneos[idx];
        let partidaEncontrada = false;

        // Buscar la partida en todas las rondas
        for (let r of torneo.rondas) {
            const pIdx = r.partidas.findIndex(p => p.id === partidaId);
            if (pIdx >= 0) {
                r.partidas[pIdx] = {
                    ...r.partidas[pIdx],
                    pts1: resultado.pts1,
                    pts2: resultado.pts2,
                    promFinalJ1: resultado.promFinalJ1,
                    promFinalJ2: resultado.promFinalJ2,
                    ganador: resultado.ganador,
                    estado: 'TERMINADA'
                };
                partidaEncontrada = true;
                break;
            }
        }

        if (!partidaEncontrada) return { ok: false, msg: 'Partida no encontrada' };

        // Actualizar promedio del jugador en el historial general
        this._actualizarHistorial(resultado);

        // Verificar si la ronda terminó y generar siguiente
        const rondaActual = torneo.rondas[torneo.rondas.length - 1];
        const todasTerminadas = rondaActual.partidas.every(p => p.estado === 'TERMINADA' || p.estado === 'BYE');

        if (todasTerminadas) {
            const siguiente = this._generarSiguienteRonda(torneo);
            if (siguiente === 'CAMPEON') {
                torneo.estado = 'FINALIZADO';
                torneo.campeon = this._determinarCampeon(torneo);
            } else if (siguiente) {
                torneo.rondas.push(siguiente);
            }
        }

        torneos[idx] = torneo;
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
        return { ok: true, torneo };
    },

    _generarSiguienteRonda: function (torneo) {
        const rondaActual = torneo.rondas[torneo.rondas.length - 1];
        const ganadores = rondaActual.partidas
            .filter(p => p.ganador)
            .map(p => {
                const jugadorOriginal = torneo.inscritos.find(j => j.nombre === p.ganador) || { nombre: p.ganador, promedio: 0 };
                return { ...jugadorOriginal, promedio: p.ganador === p.j1 ? p.promFinalJ1 : p.promFinalJ2 };
            });

        if (ganadores.length <= 1) return 'CAMPEON';
        if (ganadores.length === 0) return null;

        const numRonda = rondaActual.numero + 1;
        return {
            numero: numRonda,
            estado: 'EN_CURSO',
            partidas: this._generarPartidas(ganadores, numRonda)
        };
    },

    _determinarCampeon: function (torneo) {
        const ultimaRonda = torneo.rondas[torneo.rondas.length - 1];
        const final = ultimaRonda.partidas[0];
        return final ? final.ganador : null;
    },

    // ─────────────────────────────────────────
    // 7. CONFIRMACIÓN DE JUGADORES (los 2 listos)
    // ─────────────────────────────────────────
    confirmarListo: function (torneoId, partidaId, jugador) {
        let torneos = this.getTorneos();
        const idx = torneos.findIndex(t => t.id === torneoId);
        if (idx < 0) return { ok: false };

        let torneo = torneos[idx];
        let estadoNuevo = null;

        for (let r of torneo.rondas) {
            const pIdx = r.partidas.findIndex(p => p.id === partidaId);
            if (pIdx >= 0) {
                const p = r.partidas[pIdx];
                if (jugador === p.j1) p.listoJ1 = true;
                if (jugador === p.j2) p.listoJ2 = true;

                if (p.listoJ1 && p.listoJ2) {
                    p.estado = 'EN_JUEGO';
                    estadoNuevo = 'EN_JUEGO';
                } else {
                    p.estado = p.listoJ1 || p.listoJ2 ? 'ESPERANDO' : 'PENDIENTE';
                    estadoNuevo = p.estado;
                }
                r.partidas[pIdx] = p;
                break;
            }
        }

        torneos[idx] = torneo;
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
        return { ok: true, estado: estadoNuevo };
    },

    // ─────────────────────────────────────────
    // 8. RANKING E HISTORIAL
    // ─────────────────────────────────────────
    _actualizarHistorial: function (resultado) {
        let h = JSON.parse(localStorage.getItem('ranking_historico_club')) || [];
        h.push({ nombre: resultado.j1, promedio: resultado.promFinalJ1, fecha: new Date().toLocaleDateString(), tipo: 'Torneo' });
        h.push({ nombre: resultado.j2, promedio: resultado.promFinalJ2, fecha: new Date().toLocaleDateString(), tipo: 'Torneo' });
        localStorage.setItem('ranking_historico_club', JSON.stringify(h));

        // Actualizar promedio en jugadores plataforma
        this._recalcularPromedio(resultado.j1);
        this._recalcularPromedio(resultado.j2);
    },

    _recalcularPromedio: function (nombre) {
        const h = JSON.parse(localStorage.getItem('ranking_historico_club')) || [];
        const partidas = h.filter(x => x.nombre.toUpperCase() === nombre.toUpperCase());
        if (partidas.length === 0) return;
        const prom = partidas.reduce((acc, x) => acc + parseFloat(x.promedio), 0) / partidas.length;

        let jugadores = this.getJugadores();
        const idx = jugadores.findIndex(j => j.nombre.toUpperCase() === nombre.toUpperCase());
        if (idx >= 0) {
            jugadores[idx].promedio = parseFloat(prom.toFixed(3));
            localStorage.setItem('JUGADORES_PLATAFORMA', JSON.stringify(jugadores));
        }
    },

    obtenerPromedioActual: function (nombre) {
        const jugador = this.buscarJugador(nombre);
        if (jugador) return jugador.promedio;
        const h = JSON.parse(localStorage.getItem('ranking_historico_club')) || [];
        const partidas = h.filter(x => x.nombre.toUpperCase() === nombre.toUpperCase());
        if (partidas.length === 0) return 0;
        return partidas.reduce((acc, x) => acc + parseFloat(x.promedio), 0) / partidas.length;
    },

    getCategoria: function (promedio) {
        const p = parseFloat(promedio);
        if (p >= 1.100) return { nombre: 'CLASE ÉLITE', color: '#f1c40f', emoji: '🏆' };
        if (p >= 0.900) return { nombre: 'MAESTRO', color: '#d4af37', emoji: '⭐' };
        if (p >= 0.700) return { nombre: 'PRIMERA', color: '#c0c0c0', emoji: '🥇' };
        if (p >= 0.500) return { nombre: 'SEGUNDA', color: '#cd7f32', emoji: '🥈' };
        if (p >= 0.350) return { nombre: 'TERCERA', color: '#3498db', emoji: '🥉' };
        return { nombre: 'INICIACIÓN', color: '#555', emoji: '🎱' };
    },

    calcularBolsa: function (torneo) {
        if (!torneo) torneo = this.getTorneoActivo();
        if (!torneo) return 0;
        const bruto = (torneo.inscritos.length * torneo.inscripcion) + torneo.baseClub;
        return Math.round(bruto * (torneo.pctPremios / 100));
    },

    // ─────────────────────────────────────────
    // 9. SINCRONIZACIÓN (preparado para nube)
    // ─────────────────────────────────────────
    sincronizar: async function (accion, datos) {
        // Aquí se conectará la URL real del backend cuando esté en Netlify
        // Por ahora guarda localmente y simula éxito
        console.log('[MasterVIP] Sincronizando:', accion, datos);
        const log = JSON.parse(localStorage.getItem('SYNC_PENDIENTE')) || [];
        log.push({ accion, datos, ts: new Date().toISOString() });
        localStorage.setItem('SYNC_PENDIENTE', JSON.stringify(log));
        return { ok: true, offline: true };
    },

    // ─────────────────────────────────────────
    // 10. UTILIDADES
    // ─────────────────────────────────────────
    formatearPesos: function (n) {
        return '$ ' + Number(n).toLocaleString('es-CO');
    },

    nombreRonda: function (totalRondas, numRonda) {
        const faltanParaFinal = totalRondas - numRonda;
        if (faltanParaFinal === 0) return 'GRAN FINAL';
        if (faltanParaFinal === 1) return 'SEMIFINAL';
        if (faltanParaFinal === 2) return 'CUARTOS DE FINAL';
        if (faltanParaFinal === 3) return 'OCTAVOS DE FINAL';
        return 'RONDA ' + numRonda;
    },

    totalRondas: function (numJugadores) {
        return Math.ceil(Math.log2(numJugadores));
    }
};
