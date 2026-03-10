/* ============================================================
   MASTER VIP — CORE ENGINE v3.0
   Motor central: Sede, Jugadores, Torneos, Ranking
   ✅ Supabase integrado — localStorage como respaldo offline
   ============================================================ */

// ─────────────────────────────────────────
// CONFIGURACIÓN SUPABASE
// ─────────────────────────────────────────
const SUPABASE_URL = 'https://iwvogyloebvieloequzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wD_gKc2Doa_LXu8YLoZOcw_RczMuK-J';

const DB = {
    // Método base para llamadas a Supabase
    _fetch: async function(endpoint, options = {}) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
                ...options,
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': options.prefer || 'return=representation',
                    ...options.headers
                }
            });
            if (!res.ok) {
                const err = await res.text();
                console.warn('[DB] Error:', err);
                return null;
            }
            const text = await res.text();
            return text ? JSON.parse(text) : [];
        } catch (e) {
            console.warn('[DB] Sin conexión, usando localStorage:', e.message);
            return null;
        }
    },

    // GET — leer registros
    get: async function(tabla, filtros = '') {
        return await this._fetch(`${tabla}?${filtros}&order=created_at.desc`);
    },

    // INSERT — crear registro
    insert: async function(tabla, datos) {
        return await this._fetch(tabla, {
            method: 'POST',
            body: JSON.stringify(datos)
        });
    },

    // UPDATE — actualizar registro
    update: async function(tabla, id, datos) {
        return await this._fetch(`${tabla}?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(datos),
            prefer: 'return=representation'
        });
    },

    // DELETE — eliminar registro
    delete: async function(tabla, id) {
        return await this._fetch(`${tabla}?id=eq.${id}`, {
            method: 'DELETE'
        });
    }
};

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

    // Obtener club_id activo desde localStorage (lo guarda whitelabel.js)
    getClubId: function () {
        const perfil = JSON.parse(localStorage.getItem('mi_perfil')) || {};
        return perfil.club_id || null;
    },

    // ─────────────────────────────────────────
    // 2. JUGADORES
    // ─────────────────────────────────────────
    getJugadores: function () {
        return JSON.parse(localStorage.getItem('JUGADORES_PLATAFORMA')) || [];
    },

    // Cargar jugadores desde Supabase y sincronizar localStorage
    cargarJugadoresNube: async function () {
        const clubId = this.getClubId();
        const filtro = clubId ? `club_id=eq.${clubId}&activo=eq.true` : 'activo=eq.true';
        const data = await DB.get('jugadores', filtro);
        if (data && data.length > 0) {
            // Convertir formato Supabase → formato local
            const jugadores = data.map(j => ({
                id: j.id,
                nombre: j.nombre,
                alias: j.alias || '',
                promedio: parseFloat(j.promedio) || 0,
                categoria: j.categoria || 'INICIACION',
                nivel: j.nivel || 'BRONCE',
                puntos: j.puntos || 0,
                partidas: j.partidas || 0,
                victorias: j.victorias || 0,
                mejor_serie: j.mejor_serie || 0,
                foto_url: j.foto_url || '',
                club_id: j.club_id || null,
                club: j.club || '',
                ciudad: j.ciudad || '',
                whatsapp: j.whatsapp || '',
                activo: j.activo,
                fechaRegistro: j.created_at
            }));
            localStorage.setItem('JUGADORES_PLATAFORMA', JSON.stringify(jugadores));
            return jugadores;
        }
        // Sin conexión → usar localStorage
        return this.getJugadores();
    },

    guardarJugador: async function (jugador) {
        let lista = this.getJugadores();
        const idx = lista.findIndex(j => j.nombre === jugador.nombre);

        if (idx >= 0) {
            // Actualizar existente
            lista[idx] = { ...lista[idx], ...jugador };
            localStorage.setItem('JUGADORES_PLATAFORMA', JSON.stringify(lista));

            // Sincronizar con Supabase si tiene ID de nube
            if (lista[idx].id && lista[idx].id.length > 10) {
                await DB.update('jugadores', lista[idx].id, {
                    nombre: jugador.nombre,
                    promedio: parseFloat(jugador.promedio) || 0,
                    alias: jugador.alias || null,
                    nivel: jugador.nivel || 'BRONCE',
                    puntos: jugador.puntos || 0,
                    partidas: jugador.partidas || 0,
                    victorias: jugador.victorias || 0,
                    mejor_serie: jugador.mejor_serie || 0,
                    foto_url: jugador.foto_url || null,
                    whatsapp: jugador.whatsapp || null,
                    updated_at: new Date().toISOString()
                });
            }
            return lista[idx];
        } else {
            // Crear nuevo
            jugador.id = 'J' + Date.now(); // ID temporal local
            jugador.fechaRegistro = new Date().toISOString();
            jugador.promedio = parseFloat(jugador.promedio) || 0;
            lista.push(jugador);
            localStorage.setItem('JUGADORES_PLATAFORMA', JSON.stringify(lista));

            // Guardar en Supabase
            const clubId = this.getClubId();
            const datosNube = {
                nombre: jugador.nombre,
                alias: jugador.alias || null,
                club_id: clubId || null,
                club: jugador.club || this.getSede().nombre,
                ciudad: jugador.ciudad || null,
                whatsapp: jugador.whatsapp || null,
                pin: jugador.pin || null,
                nivel: jugador.nivel || 'BRONCE',
                puntos: 0,
                partidas: 0,
                victorias: 0,
                promedio: 0,
                foto_url: jugador.foto_url || null,
                activo: true
            };
            const resultado = await DB.insert('jugadores', datosNube);
            if (resultado && resultado[0]) {
                // Reemplazar ID local por ID real de Supabase
                jugador.id = resultado[0].id;
                const idx2 = lista.findIndex(j => j.nombre === jugador.nombre);
                if (idx2 >= 0) lista[idx2].id = resultado[0].id;
                localStorage.setItem('JUGADORES_PLATAFORMA', JSON.stringify(lista));
            }
            return jugador;
        }
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

    // Cargar torneos desde Supabase
    cargarTorneosNube: async function () {
        const clubId = this.getClubId();
        const filtro = clubId ? `club_id=eq.${clubId}` : '';
        const data = await DB.get('torneos', filtro);
        if (data && data.length > 0) {
            const torneos = data.map(t => ({
                id: t.id,
                codigo: t.codigo || '',
                nombre: t.nombre,
                sede: t.club_id || '',
                sistema: t.sistema || t.formato || 'brackets',
                cupoMax: t.cupo_max || 16,
                inscripcion: parseFloat(t.inscripcion) || 0,
                baseClub: parseFloat(t.base_club) || 0,
                pctPremios: parseFloat(t.pct_premios) || 80,
                pctFee: parseFloat(t.pct_fee) || 20,
                entradaObjetivo: t.entrada_objetivo || 0,
                tiempoEntrada: t.tiempo_entrada || 40,
                modalidad: t.modalidad || 'Libre',
                reglamento: t.reglamento || '',
                estado: t.estado || 'ABIERTO',
                inscritos: [],
                rondas: [],
                posiciones: [],
                fechaCreacion: t.created_at,
                fechaInicio: t.fecha_inicio || null,
                campeon: null
            }));
            localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
            return torneos;
        }
        return this.getTorneos();
    },

    crearTorneo: async function (config) {
        let torneos = this.getTorneos();
        const torneo = {
            id: 'T' + Date.now(), // ID temporal
            codigo: 'MV-' + new Date().getFullYear() + '-' + String(torneos.length + 1).padStart(4, '0'),
            nombre: config.nombre.toUpperCase(),
            sede: this.getSede().nombre,
            sistema: config.sistema,
            cupoMax: parseInt(config.cupoMax),
            inscripcion: parseFloat(config.inscripcion) || 0,
            baseClub: parseFloat(config.baseClub) || 0,
            pctPremios: parseFloat(config.pctPremios) || 80,
            pctFee: parseFloat(config.pctFee) || 20,
            entradaObjetivo: parseInt(config.entradaObjetivo) || 0,
            tiempoEntrada: parseInt(config.tiempoEntrada) || 40,
            modalidad: config.modalidad || 'Libre',
            reglamento: config.reglamento || '',
            estado: 'ABIERTO',
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

        // Guardar en Supabase
        const clubId = this.getClubId();
        const datosNube = {
            nombre: torneo.nombre,
            club_id: clubId || null,
            codigo: torneo.codigo,
            sistema: torneo.sistema,
            formato: torneo.sistema,
            modalidad: torneo.modalidad,
            cupo_max: torneo.cupoMax,
            inscripcion: torneo.inscripcion,
            base_club: torneo.baseClub,
            pct_premios: torneo.pctPremios,
            pct_fee: torneo.pctFee,
            entrada_objetivo: torneo.entradaObjetivo,
            tiempo_entrada: torneo.tiempoEntrada,
            reglamento: torneo.reglamento,
            estado: 'ABIERTO',
            fecha_inicio: torneo.fechaInicio || null
        };
        const resultado = await DB.insert('torneos', datosNube);
        if (resultado && resultado[0]) {
            torneo.id = resultado[0].id;
            const idx = torneos.findIndex(t => t.codigo === torneo.codigo);
            if (idx >= 0) torneos[idx].id = resultado[0].id;
            localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
            localStorage.setItem('TORNEO_ACTIVO_ID', torneo.id);
        }
        return torneo;
    },

    actualizarTorneo: async function (torneo) {
        let torneos = this.getTorneos();
        const idx = torneos.findIndex(t => t.id === torneo.id);
        if (idx >= 0) torneos[idx] = torneo;
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));

        // Sincronizar estado con Supabase si tiene ID real
        if (torneo.id && torneo.id.length > 10) {
            await DB.update('torneos', torneo.id, {
                estado: torneo.estado,
                updated_at: new Date().toISOString()
            });
        }
    },

    // ─────────────────────────────────────────
    // 4. INSCRIPCIONES
    // ─────────────────────────────────────────
    inscribirJugador: async function (torneoId, jugador) {
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

        // Guardar inscripción en Supabase
        const jugadorLocal = this.buscarJugador(jugador.nombre);
        if (jugadorLocal && jugadorLocal.id && jugadorLocal.id.length > 10 &&
            torneoId && torneoId.length > 10) {
            await DB.insert('inscripciones', {
                torneo_id: torneoId,
                jugador_id: jugadorLocal.id,
                club_id: this.getClubId() || null,
                numero_orden: t.inscritos.length,
                estado: 'ACTIVO',
                pagado: false,
                handicap: parseFloat(jugador.promedio) || 0
            });
        }

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

        let jugadores = [...t.inscritos].sort(() => Math.random() - 0.5);

        if (jugadores.length % 2 !== 0) {
            jugadores.sort((a, b) => b.promedio - a.promedio);
            jugadores[0].bye = true;
            jugadores = jugadores.sort(() => Math.random() - 0.5);
        }

        if (t.sistema === 'survivor') {
            t.posiciones = jugadores.map((j, i) => ({ ...j, pos: i + 1, promTorneo: j.promedio, partidasJugadas: 0 }));
            t.rondas = [{ numero: 1, estado: 'EN_CURSO', partidas: this._generarRondaSurvivor(jugadores) }];
        } else {
            t.rondas = [{ numero: 1, estado: 'EN_CURSO', partidas: this._generarPartidas(jugadores, 1) }];
        }

        t.estado = 'EN_CURSO';
        t.inscritos = jugadores;
        torneos[idx] = t;
        localStorage.setItem('TORNEOS_LISTA', JSON.stringify(torneos));
        localStorage.setItem('TORNEO_ACTIVO_ID', t.id);

        // Actualizar estado en Supabase
        if (t.id && t.id.length > 10) {
            DB.update('torneos', t.id, { estado: 'EN_CURSO', updated_at: new Date().toISOString() });
        }

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
                ganador: j2 ? null : j1.nombre,
                estado: j2 ? 'PENDIENTE' : 'BYE',
                listoJ1: false,
                listoJ2: false,
                promFinalJ1: 0,
                promFinalJ2: 0
            });
        }
        return partidas;
    },

    _generarRondaSurvivor: function (jugadores) {
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
    registrarResultado: async function (torneoId, partidaId, resultado) {
        let torneos = this.getTorneos();
        const idx = torneos.findIndex(t => t.id === torneoId);
        if (idx < 0) return { ok: false };

        let torneo = torneos[idx];
        let partidaEncontrada = false;

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

        this._actualizarHistorial(resultado);

        // Guardar partida en Supabase
        const j1 = this.buscarJugador(resultado.j1);
        const j2 = this.buscarJugador(resultado.j2);
        const ganador = this.buscarJugador(resultado.ganador);
        await DB.insert('partidas', {
            club_id: this.getClubId() || null,
            torneo_id: (torneoId && torneoId.length > 10) ? torneoId : null,
            jugador1_id: (j1 && j1.id && j1.id.length > 10) ? j1.id : null,
            jugador2_id: (j2 && j2.id && j2.id.length > 10) ? j2.id : null,
            entrada_objetivo: torneo.entradaObjetivo || 0,
            carambolas_j1: resultado.pts1 || 0,
            carambolas_j2: resultado.pts2 || 0,
            promedio_j1: resultado.promFinalJ1 || 0,
            promedio_j2: resultado.promFinalJ2 || 0,
            ganador_id: (ganador && ganador.id && ganador.id.length > 10) ? ganador.id : null,
            tipo: 'TORNEO',
            ronda: resultado.ronda || null
        });

        const rondaActual = torneo.rondas[torneo.rondas.length - 1];
        const todasTerminadas = rondaActual.partidas.every(p => p.estado === 'TERMINADA' || p.estado === 'BYE');

        if (todasTerminadas) {
            const siguiente = this._generarSiguienteRonda(torneo);
            if (siguiente === 'CAMPEON') {
                torneo.estado = 'FINALIZADO';
                torneo.campeon = this._determinarCampeon(torneo);
                // Actualizar torneo finalizado en Supabase
                if (torneo.id && torneo.id.length > 10) {
                    const campeonJugador = this.buscarJugador(torneo.campeon);
                    await DB.update('torneos', torneo.id, {
                        estado: 'FINALIZADO',
                        ganador_id: (campeonJugador && campeonJugador.id && campeonJugador.id.length > 10) ? campeonJugador.id : null,
                        updated_at: new Date().toISOString()
                    });
                }
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
    // 7. CONFIRMACIÓN DE JUGADORES
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
    _actualizarHistorial: async function (resultado) {
        let h = JSON.parse(localStorage.getItem('ranking_historico_club')) || [];
        h.push({ nombre: resultado.j1, promedio: resultado.promFinalJ1, fecha: new Date().toLocaleDateString(), tipo: 'Torneo' });
        h.push({ nombre: resultado.j2, promedio: resultado.promFinalJ2, fecha: new Date().toLocaleDateString(), tipo: 'Torneo' });
        localStorage.setItem('ranking_historico_club', JSON.stringify(h));

        this._recalcularPromedio(resultado.j1);
        this._recalcularPromedio(resultado.j2);

        // Guardar en ranking_historico Supabase
        const clubId = this.getClubId();
        const j1 = this.buscarJugador(resultado.j1);
        const j2 = this.buscarJugador(resultado.j2);

        if (j1 && j1.id && j1.id.length > 10) {
            await DB.insert('ranking_historico', {
                club_id: clubId || null,
                jugador_id: j1.id,
                promedio: resultado.promFinalJ1 || 0,
                puntos: resultado.pts1 || 0,
                fecha: new Date().toISOString().split('T')[0]
            });
        }
        if (j2 && j2.id && j2.id.length > 10) {
            await DB.insert('ranking_historico', {
                club_id: clubId || null,
                jugador_id: j2.id,
                promedio: resultado.promFinalJ2 || 0,
                puntos: resultado.pts2 || 0,
                fecha: new Date().toISOString().split('T')[0]
            });
        }
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

            // Actualizar promedio en Supabase
            if (jugadores[idx].id && jugadores[idx].id.length > 10) {
                DB.update('jugadores', jugadores[idx].id, {
                    promedio: jugadores[idx].promedio,
                    partidas: jugadores[idx].partidas || partidas.length,
                    updated_at: new Date().toISOString()
                });
            }
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
        if (p >= 1.100) return { nombre: 'CLASE ÉLITE',  color: '#f1c40f', emoji: '🏆' };
        if (p >= 0.900) return { nombre: 'MAESTRO',      color: '#d4af37', emoji: '⭐' };
        if (p >= 0.700) return { nombre: 'PRIMERA',      color: '#c0c0c0', emoji: '🥇' };
        if (p >= 0.500) return { nombre: 'SEGUNDA',      color: '#cd7f32', emoji: '🥈' };
        if (p >= 0.350) return { nombre: 'TERCERA',      color: '#3498db', emoji: '🥉' };
        return            { nombre: 'INICIACIÓN',        color: '#555',    emoji: '🎱' };
    },

    calcularBolsa: function (torneo) {
        if (!torneo) torneo = this.getTorneoActivo();
        if (!torneo) return 0;
        const bruto = (torneo.inscritos.length * torneo.inscripcion) + torneo.baseClub;
        return Math.round(bruto * (torneo.pctPremios / 100));
    },

    // ─────────────────────────────────────────
    // 9. SINCRONIZACIÓN
    // ─────────────────────────────────────────
    sincronizar: async function (accion, datos) {
        console.log('[MasterVIP] Sincronizando:', accion, datos);
        const log = JSON.parse(localStorage.getItem('SYNC_PENDIENTE')) || [];
        log.push({ accion, datos, ts: new Date().toISOString() });
        localStorage.setItem('SYNC_PENDIENTE', JSON.stringify(log));
        return { ok: true, offline: true };
    },

    // Inicializar app: cargar datos frescos desde Supabase
    init: async function () {
        console.log('[MasterVIP] Iniciando sincronización con Supabase...');
        await this.cargarJugadoresNube();
        await this.cargarTorneosNube();
        console.log('[MasterVIP] ✅ Datos sincronizados');
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
