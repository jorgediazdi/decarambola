/**
 * dc-nav.js — Navegación global DeCarambola
 * Incluir con: <script src="/js/dc-nav.js" defer></script>
 */
(function () {
    "use strict";

    var NAV_ITEMS = [
        {
            id: "home",
            label: "Inicio",
            icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
            href: "/index.html"
        },
        {
            id: "torneos",
            label: "Torneos",
            icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z",
            href: "/apps/club/organizador/organizador.html"
        },
        {
            id: "jugar",
            label: "Jugar",
            icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
            href: "/apps/club/sala/mesas.html"
        },
        {
            id: "ranking",
            label: "Ranking",
            icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
            href: "/ranking.html"
        },
        {
            id: "perfil",
            label: "Perfil",
            icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
            href: "/perfil.html"
        }
    ];

    function isNavActive(item, pathname) {
        var p = pathname || "";
        if (item.id === "home") {
            var pl = (p || "").toLowerCase();
            return (
                pl === "/" ||
                pl === "" ||
                pl.endsWith("/index.html") ||
                pl.endsWith("/index.htm")
            );
        }
        if (item.id === "torneos") {
            return p.indexOf("organizador") !== -1;
        }
        if (item.id === "jugar") {
            return p.indexOf("mesas") !== -1 && p.indexOf("mesas_config") === -1;
        }
        if (item.id === "ranking") {
            return p.indexOf("ranking") !== -1;
        }
        if (item.id === "perfil") {
            return p.indexOf("perfil") !== -1;
        }
        return false;
    }

    function buildNav() {
        if (document.getElementById("dc-bottom-nav")) {
            return;
        }
        if (document.body && document.body.getAttribute("data-dc-no-bottom-nav") === "1") {
            return;
        }

        var path = window.location.pathname || "";

        var nav = document.createElement("nav");
        nav.id = "dc-bottom-nav";
        nav.className = "dc-bottom-nav";
        nav.setAttribute("role", "navigation");
        nav.setAttribute("aria-label", "Navegación principal");

        for (var i = 0; i < NAV_ITEMS.length; i++) {
            var item = NAV_ITEMS[i];
            var isActive = isNavActive(item, path);
            var a = document.createElement("a");
            a.href = item.href;
            a.className = "dc-nav-item" + (isActive ? " active" : "");
            a.setAttribute("aria-label", item.label);
            if (isActive) {
                a.setAttribute("aria-current", "page");
            }
            a.innerHTML =
                '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
                '<path d="' +
                item.icon +
                '"/>' +
                "</svg>" +
                "<span>" +
                item.label +
                "</span>" +
                '<div class="dc-nav-dot"></div>';
            nav.appendChild(a);
        }

        document.body.appendChild(nav);
    }

    function initReveal() {
        var els = document.querySelectorAll(".dc-reveal");
        if (!els.length) {
            return;
        }
        if (!("IntersectionObserver" in window)) {
            for (var i = 0; i < els.length; i++) {
                els[i].classList.add("is-visible");
            }
            return;
        }
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add("is-visible");
                        observer.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        for (var j = 0; j < els.length; j++) {
            observer.observe(els[j]);
        }
    }

    function init() {
        buildNav();
        initReveal();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
