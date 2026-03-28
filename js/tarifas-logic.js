/**
 * Motor de tarifas — modelo simple (Salón en vivo).
 * Contrato Supabase: mesas_config.tarifas (JSON).
 *
 * Una tarifa base $/h y ajustes opcionales por horario (%, con signo):
 * negativo = descuento, positivo = recargo. Cobro proporcional al minuto;
 * si la sesión cruza franjas, cada minuto usa el % que corresponda a ese instante.
 *
 * Compatibilidad: JSON antiguo (hora, manana, finde, …) se normaliza al leer.
 */

/**
 * @typedef {Object} ConfiguracionTarifasNorm
 * @property {number} tarifa_base
 * @property {number} descuento_manana
 * @property {number} descuento_noche
 * @property {number} descuento_finde
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
 * Migra configuración antigua o incompleta a tarifa_base + tres %.
 * @param {object|null|undefined} raw
 * @returns {ConfiguracionTarifasNorm}
 */
export function normalizarConfiguracionTarifas(raw) {
    var t = raw && typeof raw === "object" ? raw : {};
    var tarifa_base = parseFloat(t.tarifa_base) || 0;
    if (tarifa_base <= 0) tarifa_base = parseFloat(t.hora) || 0;
    if (tarifa_base <= 0) {
        var cands = [t.manana, t.tarde, t.noche, t.finde];
        for (var i = 0; i < cands.length; i++) {
            var v = parseFloat(cands[i]) || 0;
            if (v > 0) {
                tarifa_base = v;
                break;
            }
        }
    }
    if (tarifa_base <= 0) {
        var med = parseFloat(t.media) || 0;
        if (med > 0) tarifa_base = med * 2;
    }
    return {
        tarifa_base: tarifa_base,
        descuento_manana: parseFloat(t.descuento_manana) || 0,
        descuento_noche: parseFloat(t.descuento_noche) || 0,
        descuento_finde: parseFloat(t.descuento_finde) || 0,
    };
}

/**
 * % de ajuste vigente en un instante (negativo descuento, positivo recargo).
 * @param {object|null|undefined} configuracionTarifas
 * @param {Date} when
 */
export function ajusteHorarioPct(configuracionTarifas, when) {
    var cfg = normalizarConfiguracionTarifas(configuracionTarifas);
    var wd = when.getDay();
    var mins = when.getHours() * 60 + when.getMinutes();

    var pct = 0;

    // Franja horaria — aplica todos los días incluyendo finde
    if (mins < 12 * 60) pct += cfg.descuento_manana;
    else if (mins >= 20 * 60) pct += cfg.descuento_noche;

    // Fin de semana se acumula sobre la franja
    if (wd === 0 || wd === 6) pct += cfg.descuento_finde;

    return pct;
}

/**
 * @param {number} mesaTarifaHora — mesa.tarifa_hora (respaldo si no hay tarifa_base en config)
 * @param {object|null|undefined} configuracionTarifas
 * @param {Date} when
 * @returns {number} $/h efectivos en ese instante
 */
export function tarifaBasePorHora(mesaTarifaHora, configuracionTarifas, when) {
    var cfg = normalizarConfiguracionTarifas(configuracionTarifas);
    var base = cfg.tarifa_base > 0 ? cfg.tarifa_base : parseFloat(mesaTarifaHora) || 0;
    if (base <= 0) return 0;
    var pct = ajusteHorarioPct(configuracionTarifas, when);
    return base * (1 + pct / 100);
}

/**
 * Reservado por compatibilidad con pantallas que leían % global antiguo.
 * En el modelo simple el ajuste va en tarifaBasePorHora; aquí retornamos 0.
 */
export function descuentoPctAplicable(configuracionTarifas, when) {
    void configuracionTarifas;
    void when;
    return 0;
}

/**
 * @param {number} mesaTarifaHora
 * @param {object|null|undefined} configuracionTarifas
 * @param {Date} when
 */
export function tarifaEfectivaPorHora(mesaTarifaHora, configuracionTarifas, when) {
    return tarifaBasePorHora(mesaTarifaHora, configuracionTarifas, when);
}

function acumularCostoPorMinuto(mesaTarifaHora, configuracionTarifas, inicioMs, finMs) {
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
    return acc;
}

/**
 * @param {number} mesaTarifaHora
 * @param {object|null|undefined} configuracionTarifas
 * @param {number} inicioMs
 * @param {number} finMs
 */
export function costoSesionProporcionalMinutos(mesaTarifaHora, configuracionTarifas, inicioMs, finMs) {
    if (finMs <= inicioMs) return 0;
    var acc = acumularCostoPorMinuto(mesaTarifaHora, configuracionTarifas, inicioMs, finMs);
    return Math.round(acc * 100) / 100;
}

/**
 * @param {string|number|Date} inicio
 * @param {string|number|Date} fin
 * @param {object|null|undefined} configuracionTarifas
 * @param {number} [mesaTarifaHora=0]
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
 */
export function construirTarifaSnapCierre(inicioIso, finIso, mesaTarifaHora, configuracionTarifas) {
    var i = toMs(inicioIso);
    var f = toMs(finIso);
    var cfg = normalizarConfiguracionTarifas(configuracionTarifas);
    var teFin = tarifaEfectivaPorHora(mesaTarifaHora, configuracionTarifas, new Date(f));
    var adjFin = ajusteHorarioPct(configuracionTarifas, new Date(f));
    var costo = costoSesionProporcionalMinutos(mesaTarifaHora, configuracionTarifas, i, f);
    return {
        metodo: "proporcional_minuto",
        modelo: "tarifa_base_ajustes",
        tarifa_referencia: Math.round(cfg.tarifa_base * 100) / 100,
        inicio_iso: inicioIso,
        fin_iso: finIso,
        minutos: Math.round(((f - i) / 60000) * 100) / 100,
        ajuste_pct_ejemplo_fin: Math.round(adjFin * 100) / 100,
        tarifa_efectiva_ejemplo_fin: Math.round(teFin * 100) / 100,
        total: Math.round(costo * 100) / 100,
    };
}
