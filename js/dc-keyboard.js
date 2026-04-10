/**
 * dcKeyboard — teclado virtual para pantallas táctil / TV.
 * Se activa en focus (y pointerdown) sobre input/textarea con data-dc-keyboard.
 * Numérico: type=number o data-dc-keyboard="numeric"
 */
(function () {
    'use strict';

    var GOLD = 'var(--dc-gold, #c9a84c)';

    var activeEl = null;
    var shiftOn = false;
    var numericMode = false;
    var panelEl = null;
    var backdropEl = null;
    var keysRoot = null;
    var openRaf = 0;

    function isTarget(el) {
        if (!el || !el.matches) return false;
        return el.matches('input[data-dc-keyboard], textarea[data-dc-keyboard]');
    }

    function isNumericMode(el) {
        if (!el) return false;
        var attr = (el.getAttribute('data-dc-keyboard') || '').trim().toLowerCase();
        if (attr === 'numeric') return true;
        var t = (el.type || '').toLowerCase();
        return t === 'number' || t === 'tel';
    }

    function injectStyles() {
        if (document.getElementById('dc-keyboard-styles')) return;
        var style = document.createElement('style');
        style.id = 'dc-keyboard-styles';
        style.textContent =
            '.dc-kb-backdrop{position:fixed;inset:0;z-index:9998;background:transparent;touch-action:none;}' +
            '.dc-kb-backdrop.dc-kb-open{pointer-events:auto;}' +
            '.dc-kb-panel{position:fixed;left:0;right:0;bottom:0;width:100%;z-index:9999;' +
            'background:#0d0d0d;border-top:1px solid ' +
            GOLD +
            ';' +
            'transform:translateY(100%);transition:transform .3s ease;max-height:50vh;overflow:auto;' +
            'box-shadow:0 -8px 32px rgba(0,0,0,.45);}' +
            '.dc-kb-panel.dc-kb-visible{transform:translateY(0);}' +
            '.dc-kb-keys{padding:10px 12px 14px;padding-bottom:max(14px,env(safe-area-inset-bottom));}' +
            '.dc-kb-row{display:flex;gap:6px;margin-bottom:6px;align-items:stretch;justify-content:center;}' +
            '.dc-kb-row:last-child{margin-bottom:0;}' +
            '.dc-kb-key{' +
            'flex:1;min-width:48px;min-height:48px;border:1px solid #2a2a2a;border-radius:8px;' +
            'background:#1a1a1a;color:#eaeaea;font-size:1rem;font-weight:600;font-family:inherit;' +
            'cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;' +
            'display:flex;align-items:center;justify-content:center;padding:4px 6px;user-select:none;' +
            '}' +
            '.dc-kb-key:active{filter:brightness(1.12);}' +
            '.dc-kb-key--ok{background:' +
            GOLD +
            ';color:#000;font-weight:700;border-color:transparent;}' +
            '.dc-kb-key--bksp{background:#2a1a1a;color:#e74c3c;border-color:#3a2a2a;}' +
            '.dc-kb-key--shift.dc-kb-shift-on{background:#2a2a40;border-color:' +
            GOLD +
            ';color:' +
            GOLD +
            ';}' +
            '.dc-kb-num-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px 12px;' +
            'padding-bottom:max(12px,env(safe-area-inset-bottom));}' +
            '.dc-kb-num-grid .dc-kb-key{min-width:64px;min-height:64px;aspect-ratio:1;flex:none;width:100%;}' +
            '.dc-kb-key--space{flex:3;}' +
            '.dc-kb-key--narrow{flex:0.85;max-width:72px;}';
        document.head.appendChild(style);
    }

    function ensureDom() {
        injectStyles();
        if (backdropEl && panelEl) return;
        backdropEl = document.createElement('div');
        backdropEl.className = 'dc-kb-backdrop';
        backdropEl.setAttribute('aria-hidden', 'true');
        panelEl = document.createElement('div');
        panelEl.className = 'dc-kb-panel';
        panelEl.setAttribute('role', 'dialog');
        panelEl.setAttribute('aria-label', 'Teclado virtual');
        keysRoot = document.createElement('div');
        keysRoot.className = 'dc-kb-keys';
        panelEl.appendChild(keysRoot);
        document.body.appendChild(backdropEl);
        document.body.appendChild(panelEl);

        backdropEl.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            close(true);
        });
        panelEl.addEventListener('pointerdown', function (e) {
            e.stopPropagation();
        });
    }

    function getCaret(el) {
        if (el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'search' || el.type === '') {
            try {
                return {
                    start: el.selectionStart != null ? el.selectionStart : el.value.length,
                    end: el.selectionEnd != null ? el.selectionEnd : el.value.length
                };
            } catch (err) {
                return { start: el.value.length, end: el.value.length };
            }
        }
        var len = String(el.value || '').length;
        return { start: len, end: len };
    }

    function setCaret(el, start, end) {
        if (el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'search' || el.type === '') {
            try {
                el.setSelectionRange(start, end);
            } catch (e2) {}
        }
    }

    function insertText(el, text) {
        var v = String(el.value != null ? el.value : '');
        var caret = getCaret(el);
        var a = caret.start;
        var b = caret.end;
        var next = v.slice(0, a) + text + v.slice(b);
        var maxLen = el.maxLength > 0 ? el.maxLength : null;
        if (maxLen != null && next.length > maxLen) {
            next = next.slice(0, maxLen);
        }
        el.value = next;
        var pos = a + text.length;
        if (maxLen != null && pos > maxLen) pos = maxLen;
        setCaret(el, pos, pos);
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function insertDigit(el, d) {
        var t = (el.type || '').toLowerCase();
        var maxLen = el.maxLength > 0 ? el.maxLength : 12;
        var only = String(el.value != null ? el.value : '').replace(/\D/g, '');
        if (t === 'number') {
            only = (only + d).slice(0, maxLen);
            el.value = only;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        var caret = getCaret(el);
        var start = Math.min(caret.start, only.length);
        var end = Math.min(caret.end, only.length);
        if (start !== end) {
            only = only.slice(0, start) + only.slice(end);
        }
        only = (only.slice(0, start) + d + only.slice(start)).slice(0, maxLen);
        el.value = only;
        var pos = Math.min(start + 1, only.length);
        setCaret(el, pos, pos);
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function backspace(el) {
        if (numericMode) {
            var t = (el.type || '').toLowerCase();
            var only = String(el.value != null ? el.value : '').replace(/\D/g, '');
            if (t === 'number') {
                el.value = only.slice(0, -1);
                el.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
            var caret = getCaret(el);
            var start = Math.min(caret.start, only.length);
            var end = Math.min(caret.end, only.length);
            if (start !== end) {
                only = only.slice(0, start) + only.slice(end);
            } else if (start > 0) {
                only = only.slice(0, start - 1) + only.slice(start);
                start -= 1;
            }
            el.value = only;
            setCaret(el, start, start);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        var v2 = String(el.value != null ? el.value : '');
        var c2 = getCaret(el);
        if (c2.start !== c2.end) {
            el.value = v2.slice(0, c2.start) + v2.slice(c2.end);
            setCaret(el, c2.start, c2.start);
        } else if (c2.start > 0) {
            el.value = v2.slice(0, c2.start - 1) + v2.slice(c2.start);
            setCaret(el, c2.start - 1, c2.start - 1);
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function clampNumberIfNeeded(el) {
        if (!isNumericMode(el)) return;
        var n = parseInt(String(el.value).replace(/\D/g, ''), 10);
        if (isNaN(n)) {
            el.value = '';
            return;
        }
        var min = el.min !== '' && el.min != null ? parseInt(el.min, 10) : null;
        var max = el.max !== '' && el.max != null ? parseInt(el.max, 10) : null;
        if (min != null && !isNaN(min) && n < min) n = min;
        if (max != null && !isNaN(max) && n > max) n = max;
        el.value = String(n);
    }

    function renderAlphaKeys() {
        keysRoot.innerHTML = '';
        keysRoot.className = 'dc-kb-keys';

        var rows = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'bksp']
        ];

        function letterDisp(ch) {
            if (ch === 'shift' || ch === 'bksp') return ch;
            return shiftOn ? ch.toUpperCase() : ch;
        }

        rows.forEach(function (row) {
            var r = document.createElement('div');
            r.className = 'dc-kb-row';
            row.forEach(function (key) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'dc-kb-key';
                if (key === 'bksp') {
                    btn.className += ' dc-kb-key--bksp';
                    btn.textContent = '⌫';
                    btn.setAttribute('aria-label', 'Borrar');
                } else if (key === 'shift') {
                    btn.className += ' dc-kb-key--shift' + (shiftOn ? ' dc-kb-shift-on' : '');
                    btn.textContent = '⇧';
                    btn.setAttribute('aria-label', 'Mayúsculas');
                } else {
                    btn.textContent = letterDisp(key);
                    btn.dataset.ch = key;
                }
                r.appendChild(btn);
            });
            keysRoot.appendChild(r);
        });

        var r4 = document.createElement('div');
        r4.className = 'dc-kb-row';
        var space = document.createElement('button');
        space.type = 'button';
        space.className = 'dc-kb-key dc-kb-key--space';
        space.textContent = 'ESPACIO';
        space.setAttribute('aria-label', 'Espacio');
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dc-kb-key dc-kb-key--narrow';
        dot.textContent = '·';
        dot.dataset.ch = '\u00b7';
        var ok = document.createElement('button');
        ok.type = 'button';
        ok.className = 'dc-kb-key dc-kb-key--ok';
        ok.textContent = 'OK';
        r4.appendChild(space);
        r4.appendChild(dot);
        r4.appendChild(ok);
        keysRoot.appendChild(r4);

        keysRoot.onclick = function (ev) {
            var t = ev.target;
            if (!t || !t.closest) return;
            var btn = t.closest('.dc-kb-key');
            if (!btn || !keysRoot.contains(btn)) return;
            ev.preventDefault();
            if (!activeEl) return;
            if (btn.textContent === 'OK' || btn.classList.contains('dc-kb-key--ok')) {
                close(true);
                return;
            }
            if (btn.getAttribute('aria-label') === 'Borrar' || btn.textContent === '⌫') {
                backspace(activeEl);
                return;
            }
            if (btn.getAttribute('aria-label') === 'Mayúsculas' || btn.textContent === '⇧') {
                shiftOn = !shiftOn;
                renderAlphaKeys();
                return;
            }
            if (btn.getAttribute('aria-label') === 'Espacio') {
                insertText(activeEl, ' ');
                return;
            }
            var ch = btn.dataset.ch;
            if (ch) {
                var out = shiftOn ? ch.toUpperCase() : ch;
                insertText(activeEl, out);
            }
        };
    }

    function renderNumericKeys() {
        keysRoot.innerHTML = '';
        keysRoot.className = 'dc-kb-keys dc-kb-num-grid';

        var layout = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['bksp', '0', 'ok']
        ];

        layout.forEach(function (row) {
            row.forEach(function (key) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'dc-kb-key';
                if (key === 'ok') {
                    btn.className += ' dc-kb-key--ok';
                    btn.textContent = 'OK';
                } else if (key === 'bksp') {
                    btn.className += ' dc-kb-key--bksp';
                    btn.textContent = '⌫';
                    btn.setAttribute('aria-label', 'Borrar');
                } else {
                    btn.textContent = key;
                    btn.dataset.digit = key;
                }
                keysRoot.appendChild(btn);
            });
        });

        keysRoot.onclick = function (ev) {
            var t = ev.target;
            if (!t || !t.closest) return;
            var btn = t.closest('.dc-kb-key');
            if (!btn || !keysRoot.contains(btn)) return;
            ev.preventDefault();
            if (!activeEl) return;
            if (btn.textContent === 'OK') {
                close(true);
                return;
            }
            if (btn.textContent === '⌫') {
                backspace(activeEl);
                return;
            }
            var d = btn.dataset.digit;
            if (d) insertDigit(activeEl, d);
        };
    }

    function renderKeyboard() {
        if (numericMode) renderNumericKeys();
        else renderAlphaKeys();
    }

    function open(el) {
        if (!isTarget(el)) return;
        ensureDom();
        if (activeEl && activeEl !== el) {
            close(false);
        }
        activeEl = el;
        numericMode = isNumericMode(el);
        shiftOn = false;

        try {
            el.setAttribute('readonly', 'readonly');
            el.setAttribute('inputmode', numericMode ? 'numeric' : 'text');
        } catch (e1) {}

        renderKeyboard();

        backdropEl.classList.add('dc-kb-open');
        panelEl.classList.remove('dc-kb-visible');
        cancelAnimationFrame(openRaf);
        openRaf = requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                panelEl.classList.add('dc-kb-visible');
            });
        });
    }

    function close(confirm) {
        if (!activeEl) {
            if (panelEl) panelEl.classList.remove('dc-kb-visible');
            if (backdropEl) backdropEl.classList.remove('dc-kb-open');
            return;
        }
        var el = activeEl;
        if (isNumericMode(el)) {
            clampNumberIfNeeded(el);
        }
        try {
            el.removeAttribute('readonly');
            el.removeAttribute('inputmode');
        } catch (e2) {}
        el.dispatchEvent(new Event('change', { bubbles: true }));
        if (confirm) {
            try {
                el.blur();
            } catch (e3) {}
        }
        activeEl = null;
        if (panelEl) panelEl.classList.remove('dc-kb-visible');
        if (backdropEl) backdropEl.classList.remove('dc-kb-open');
    }

    function onFocusIn(e) {
        var t = e.target;
        if (!isTarget(t)) return;
        open(t);
    }

    function onPointerDown(e) {
        var t = e.target;
        if (!isTarget(t)) return;
        if (t !== activeEl) open(t);
    }

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('pointerdown', onPointerDown, true);

    window.dcKeyboard = {
        close: function () {
            close(true);
        },
        isOpen: function () {
            return !!activeEl;
        }
    };
})();
