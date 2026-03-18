/* ============================================================
   SESSION — Panel del club y visibilidad admin
   DeCarambola · Requiere core.js (SESSION, DB)
   ============================================================ */

(function() {
    if (typeof SESSION === 'undefined') return;

    SESSION.actualizarVisibilidadPanelClub = function() {
        var clubes = [];
        try { clubes = JSON.parse(localStorage.getItem('mis_clubes') || '[]'); } catch(e) {}
        var esAdmin = clubes.some(function(c) { return c.admin === true; });
        localStorage.setItem('club_admin', esAdmin ? 'true' : 'false');
        var wrapper = document.getElementById('wrapper-panel-club');
        if (wrapper) wrapper.style.display = '';
    };

    SESSION.isClubAdmin = function() {
        return localStorage.getItem('club_admin') === 'true';
    };
})();
