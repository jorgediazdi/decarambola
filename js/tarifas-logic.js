/**
 * Motor puro de tarifas y liquidación por minuto (Salón en vivo).
 * Contrato canónico Supabase: club_id, tarifas en mesas_config.tarifas (JSON).
 * Sin I/O: funciones puras salvo conversión Date.
 *
 * Franjas base: fin de semana → mañana (<12h) → tarde [12h,20h) → noche (≥20h) → tarifa hora salón → tarifa_hora de la mesa.
 * Campo opcional `tarde` ($/h) en configuracionTarifas; si es 0 se omiten y aplica la siguiente regla.
 */

/**
 * @typedef {Object} ConfiguracionTarifas
 * @property {number} [hora]
 * @property {number} [media]
 * @property {number} [manana]
 * @property {number} [tarde] — franja 12:00–19:59 (mismo día); solo días laborables ya filtrados por finde
 * @property {number} [noche]
 * @property {number} [finde]
 * @property {number} [descuento_global_pct]
 * @property {Array<{tipo:string, desde?:string, hasta?:string, pct?:number, dias?:number[]}>} [reglas_descuento]
 */

/**
 * @param {string|number|Date} v
 * @returns {number} ms UTC
 */
function toMs(v) {
    if (v instanceof Date) return v.getTime();
    if (typeof v === "number" && !isNaN(v)) return v;
    var d = new Date(v);
    var t = d.getTime();
    return isNaN(t) ? 0 : t;
}

export function parseHMToMinutes(s) {
    if (!s) return 0;
    var p = String(s).trim().split(":");
    var h = parseInt(p[0], 10),
        m = parseInt(p[1], 10);
    if (isNaN(h)) h = 0;
    if (isNaN(m)) m = 0;
    return h * 60 + m;
}

/**
 * @param {number} mesaTarifaHora — mesa.tarifa_hora
 * @param {ConfiguracionTarifas|null|undefined} configuracionTarifas — mesas_config.tarifas
 * @param {Date} when
 * @returns {number} USD/COP etc. por hora (sin descuento)
 */
export function tarifaBasePorHora(mesaTarifaHora, configuracionTarifas, when) {
    var t = configuracionTarifas && typeof configuracionTarifas === "object" ? configuracionTarifas : {};
    var wd = when.getDay();
    var minsDay = when.getHours() * 60 + when.getMinutes();
    var baseMesa = parseFloat(mesaTarifaHora) || 0;
    var finde = parseFloat(t.finde) || 0;
    var manana = parseFloat(t.manana) || 0;
    var tarde = parseFloat(t.tarde) || 0;
    var noche = parseFloat(t.noche) || 0;
    var horaSalon = parseFloat(t.hora) || 0;
    if (finde > 0 && (wd === 0 || wd === 6)) return finde;
    if (manana > 0 && minsDay < 12 * 60) return manana;
    if (tarde > 0 && minsDay >= 12 * 60 && minsDay < 20 * 60) return tarde;
    if (noche > 0 && minsDay >= 20 * 60) return noche;
    if (horaSalon > 0) return horaSalon;
    return baseMesa;
}

/**
 * @param {ConfiguracionTarifas|null|undefined} configuracionTarifas
 * @param {Date} when
 * @returns {number} 0–100
 */
export function descuentoPctAplicable(configuracionTarifas, when) {
    var t = configuracionTarifas && typeof configuracionTarifas === "object" ? configuracionTarifas : {};
    var maxPct = Math.min(100, Math.max(0, parseFloat(t.descuento_global_pct) || 0));
    var rules = t.reglas_descuento || [];
    var wd = when.getDay();
    var hm = when.getHours() * 60 + when.getMinutes();
    for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (!r) continue;
        var p = Math.min(100, Math.max(0, parseFloat(r.pct) || 0));
        if (r.tipo === "rango_hora" && r.desde && r.hasta) {
            var a = parseHMToMinutes(r.desde);
            var b = parseHMToMinutes(r.hasta);
            if (a < b) {
                if (hm >= a && hm < b) maxPct = Math.max(maxPct, p);
            } else if (a > b) {
                if (hm >= a || hm < b) maxPct = Math.max(maxPct, p);
            }
        }
        if (r.tipo === "dia_semana" && r.dias && r.dias.length) {
            for (var j = 0; j < r.dias.length; j++) {
                if (r.dias[j] === wd) {
                    maxPct = Math.max(maxPct, p);
                    break;
                }
            }
        }
    }
    return Math.min(100, maxPct);
}

/**
 * @param {number} mesaTarifaHora
 * @param {ConfiguracionTarifas|null|undefined} configuracionTarifas
 * @param {Date} when
 */
export function tarifaEfectivaPorHora(mesaTarifaHora, configuracionTarifas, when) {
    var base = tarifaBasePorHora(mesaTarifaHora, configuracionTarifas, when);
    var pct = descuentoPctAplicable(configuracionTarifas, when);
    return base * (1 - pct / 100);
}

/**
 * Liquidación proporcional por minuto (tarifa efectiva puede variar minuto a minuto).
 * @param {number} mesaTarifaHora
 * @param {ConfiguracionTarifas|null|undefined} configuracionTarifas
 * @param {number} inicioMs
 * @param {number} finMs
 */
export function costoSesionProporcionalMinutos(mesaTarifaHora, configuracionTarifas, inicioMs, finMs) {
    if (finMs <= inicioMs) return 0;
    var totalMin = (finMs - inicioMs) / 60000;
    var enteros = Math.floor(totalMin);
    var frac = totalMin - enteros;
    var acc = 0;
    for (var k = 0; k < enteros; k++) {
        var ts = inicioMs + k * 60000 + 30000;
        acc += tarifaEfectivaPorHora(mesaTarifaHora, configuracionTarifas, new Date(ts)) / 60;
    }
    if (frac > 1e-6) {
        acc += (tarifaEfectivaPorHora(mesaTarifaHora, configuracionTarifas, new Date(finMs)) / 60) * frac;
    }
    return Math.round(acc * 100) / 100;
}

/**
 * API única para cierre de sesión y pantallas que deben coincidir.
 * @param {string|number|Date} inicio
 * @param {string|number|Date} fin
 * @param {ConfiguracionTarifas|null|undefined} configuracionTarifas
 * @param {number} [mesaTarifaHora=0]
 * @returns {{ total: number, minutos: number, inicioMs: number, finMs: number }}
 */
export function calcularTotal(inicio, fin, configuracionTarifas, mesaTarifaHora) {
    var mesaTh = mesaTarifaHora != null ? mesaTarifaHora : 0;
    var i = toMs(inicio);
    var f = toMs(fin);
    if (!i || !f || f <= i) {
        return { total: 0, minutos: 0, inicioMs: i, finMs: f };
    }
    var minutos = Math.round(((f - i) / 60000) * 100) / 100;
    var total = costoSesionProporcionalMinutos(mesaTh, configuracionTarifas, i, f);
    return { total: total, minutos: minutos, inicioMs: i, finMs: f };
}

/**
 * Snapshot JSON para mesas_historial.tarifa_aplicada al cerrar.
 * @param {string} inicioIso
 * @param {string} finIso
 * @param {number} mesaTarifaHora
 * @param {ConfiguracionTarifas|null|undefined} configuracionTarifas
 */
export function construirTarifaSnapCierre(inicioIso, finIso, mesaTarifaHora, configuracionTarifas) {
    var i = toMs(inicioIso);
    var f = toMs(finIso);
    var teFin = tarifaEfectivaPorHora(mesaTarifaHora, configuracionTarifas, new Date(f));
    var dctFin = descuentoPctAplicable(configuracionTarifas, new Date(f));
    var costo = costoSesionProporcionalMinutos(mesaTarifaHora, configuracionTarifas, i, f);
    return {
        metodo: "proporcional_minuto",
        inicio_iso: inicioIso,
        fin_iso: finIso,
        minutos: Math.round(((f - i) / 60000) * 100) / 100,
        tarifa_efectiva_ejemplo_fin: Math.round(teFin * 100) / 100,
        descuento_pct_fin: Math.round(dctFin * 100) / 100,
        total: Math.round(costo * 100) / 100,
    };
}
