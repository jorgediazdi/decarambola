/* DeCarambola — Control de versión y caché
   Actualizar APP_VERSION cada deploy + en index.html subir sw.js?v= (mismo deploy) */
(function(){
    var APP_VERSION = '2026.03.24.001';
    var stored = localStorage.getItem('dc_app_version');
    if (stored === APP_VERSION) return;

    localStorage.setItem('dc_app_version', APP_VERSION);
    var mustReload = !!stored;

    function reloadOnce() {
        if (!mustReload) return;
        try {
            console.log('[DeCarambola] Nueva versión:', APP_VERSION, '— recargando');
        } catch (e) {}
        window.location.reload();
    }

    function clearCaches() {
        if (!('caches' in window)) return Promise.resolve();
        return caches.keys().then(function(names) {
            return Promise.all(names.map(function(n) { return caches.delete(n); }));
        });
    }

    function unregisterSW() {
        if (!('serviceWorker' in navigator)) return Promise.resolve();
        return navigator.serviceWorker.getRegistrations().then(function(regs) {
            return Promise.all(regs.map(function(r) { return r.unregister(); }));
        });
    }

    clearCaches()
        .then(unregisterSW)
        .then(reloadOnce)
        .catch(reloadOnce);
})();