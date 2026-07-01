/**
 * ui.js
 * Pure view helpers — no game state lives here. Builds DOM nodes and runs
 * the small set of animations the game uses.
 */
(function (PSET) {
  'use strict';

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else {
          node.setAttribute(k, v);
        }
      });
    }
    (children || []).forEach((c) => {
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function maskToBinaryString(mask) {
    return mask.toString(2).padStart(PSET.SYMBOL_COUNT, '0');
  }

  /**
   * Build a card button element. Every card always shows all six symbol
   * slots; absent symbols render as empty placeholders so the fixed
   * six-symbol structure stays visible at a glance.
   */
  function createCardElement(mask, opts) {
    opts = opts || {};
    const card = el('button', {
      class: 'card',
      type: 'button',
      'data-mask': String(mask),
      'aria-pressed': 'false',
    });

    const grid = el('div', { class: 'card-symbols' });
    for (let b = 0; b < PSET.SYMBOL_COUNT; b++) {
      const present = !!(mask & (1 << b));
      const slot = el('div', { class: 'symbol-slot' + (present ? '' : ' is-empty') });
      if (present) slot.innerHTML = PSET.iconSVG(b, { size: 28 });
      grid.appendChild(slot);
    }

    const code = el('div', { class: 'card-code' }, [maskToBinaryString(mask)]);

    card.appendChild(grid);
    card.appendChild(code);

    if (opts.onClick) {
      card.addEventListener('click', () => opts.onClick(mask, card));
    }
    return card;
  }

  function setCardState(cardEl, state) {
    if (!cardEl) return;
    cardEl.classList.remove('is-selected', 'is-correct', 'is-wrong');
    cardEl.setAttribute('aria-pressed', state === 'is-selected' ? 'true' : 'false');
    if (state) cardEl.classList.add(state);
  }

  /**
   * Draw the signature "line" effect: a glowing path connecting the
   * centers of three confirmed cards, evoking the literal projective line
   * those three points form in the underlying vector space.
   */
  function flashLine(boardEl, cardEls) {
    if (cardEls.some((c) => !c)) return;
    const boardRect = boardEl.getBoundingClientRect();
    const pts = cardEls.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2 - boardRect.left, y: r.top + r.height / 2 - boardRect.top };
    });

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'line-overlay');
    svg.setAttribute('width', String(boardRect.width));
    svg.setAttribute('height', String(boardRect.height));

    const path = document.createElementNS(svgNS, 'path');
    const d = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'line-path');
    const len = pts.reduce((sum, p, i) => {
      if (i === 0) return 0;
      const prev = pts[i - 1];
      return sum + Math.hypot(p.x - prev.x, p.y - prev.y);
    }, 0);
    path.style.strokeDasharray = String(Math.max(len, 1));
    path.style.strokeDashoffset = String(Math.max(len, 1));

    svg.appendChild(path);
    boardEl.appendChild(svg);

    requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    });
    setTimeout(() => path.classList.add('fade'), 500);
    setTimeout(() => svg.remove(), 950);
  }

  PSET.UI = { el, createCardElement, setCardState, flashLine, maskToBinaryString };
})(window.PSET = window.PSET || {});
