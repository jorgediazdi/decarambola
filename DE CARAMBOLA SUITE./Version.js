/* DeCarambola — Control de versión y caché
   Actualizar APP_VERSION cada vez que se sube a GitHub */
(function() {
    var APP_VERSION = '2026.03.14.1';
    var stored = localStorage.getItem('dc_app_version');
    if (stored === APP_VERSION) return;

    localStorage.setItem('dc_app_version', APP_VERSION);

    // Limpiar caché del service worker si existe
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) { caches.delete(name); });
        });
    }

    // Forzar una única recarga al detectar versión distinta.
    var reloadKey = 'dc_app_version_reloaded';
    if (sessionStorage.getItem(reloadKey) === APP_VERSION) return;
    sessionStorage.setItem(reloadKey, APP_VERSION);

    try {
        var url = new URL(window.location.href);
        url.searchParams.set('v', APP_VERSION);
        window.location.replace(url.toString());
    } catch (e) {
        window.location.reload();
    }
})();