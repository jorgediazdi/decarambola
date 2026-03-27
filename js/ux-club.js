/**
 * DeCarambola — UX compartido (portal club / organizador)
 * Incluir: <script src="/js/ux-club.js" defer></script>
 */
(function (global) {
    'use strict';

    function escapeHtml(s) {
        if (s == null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function ensureToastEl() {
        var el = document.getElementById('dc-ux-toast');
        if (el) return el;
        el = document.createElement('div');
        el.id = 'dc-ux-toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.className = 'dc-ux-toast';
        document.body.appendChild(el);
        return el;
    }

    var toastTimer;
    function toast(msg, tipo) {
        var el = ensureToastEl();
        el.className = 'dc-ux-toast dc-ux-toast--visible ' + (tipo === 'error' ? 'dc-ux-toast--err' : 'dc-ux-toast--ok');
        el.textContent = msg;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove('dc-ux-toast--visible');
        }, 3200);
    }

    global.DCUX = {
        escapeHtml: escapeHtml,
        toast: toast
    };
})(typeof window !== 'undefined' ? window : this);
