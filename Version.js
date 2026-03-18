/* DeCarambola — Control de versión y caché
   Actualizar APP_VERSION cada vez que se sube a GitHub */
(function(){
    var APP_VERSION = '2026.03.18.1';
    var stored = localStorage.getItem('dc_app_version');
    if (stored !== APP_VERSION) {
        localStorage.setItem('dc_app_version', APP_VERSION);
        // Limpiar caché del service worker si existe
        if ('caches' in window) {
            caches.keys().then(function(names) {
                names.forEach(function(n) { caches.delete(n); });
            });
        }
        // Si hubo versión anterior, recargar para forzar archivos nuevos
        if (stored) {
            console.log('Nueva versión detectada:', APP_VERSION, '— recargando');
            window.location.reload(true);
        }
    }
})();