/**
 * symbols.js
 * Defines the six symbols used on cards and renders them as inline SVG.
 * Bit position in a card's mask <-> index in SYMBOLS.
 */
(function (PSET) {
  'use strict';

  const SYMBOLS = [
    { id: 0, key: 'square',   label: 'Blue square',    color: '#3B82F6' },
    { id: 1, key: 'circle',   label: 'Green circle',   color: '#22C55E' },
    { id: 2, key: 'heart',    label: 'Red heart',      color: '#EF4444' },
    { id: 3, key: 'triangle', label: 'Purple triangle', color: '#A855F7' },
    { id: 4, key: 'star',     label: 'Yellow star',    color: '#EAB308' },
    { id: 5, key: 'moon',     label: 'Orange moon',    color: '#F97316' },
  ];

  function starPoints(cx, cy, rOuter, rInner) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(
        (cx + r * Math.cos(angle)).toFixed(2) + ',' + (cy - r * Math.sin(angle)).toFixed(2)
      );
    }
    return pts.join(' ');
  }

  function shapeMarkup(key, color) {
    switch (key) {
      case 'square':
        return `<rect x="6" y="6" width="20" height="20" rx="3.5" fill="${color}"/>`;
      case 'circle':
        return `<circle cx="16" cy="16" r="11" fill="${color}"/>`;
      case 'heart':
        return `<path d="M16 27.5 C 3.5 18.5, 1.5 9, 8.8 6.2 C 13 4.6, 16 7.4, 16 10.6
                 C 16 7.4, 19 4.6, 23.2 6.2 C 30.5 9, 28.5 18.5, 16 27.5 Z" fill="${color}"/>`;
      case 'triangle':
        return `<polygon points="16,5 28.5,27 3.5,27" fill="${color}"/>`;
      case 'star':
        return `<polygon points="${starPoints(16, 16, 12, 5)}" fill="${color}"/>`;
      case 'moon':
        return `<path d="M21 4.5 A12 12 0 1 0 21 27.5 A9.2 9.2 0 1 1 21 4.5 Z" fill="${color}"/>`;
      default:
        return '';
    }
  }

  /**
   * Render a symbol as an inline SVG string.
   * @param {number} symbolId - index 0..5 into SYMBOLS
   * @param {{size?: number}} [opts]
   */
  function iconSVG(symbolId, opts) {
    opts = opts || {};
    const sym = SYMBOLS[symbolId];
    if (!sym) return '';
    const size = opts.size || 32;
    return (
      `<svg class="symbol-icon" viewBox="0 0 32 32" width="${size}" height="${size}" ` +
      `role="img" aria-label="${sym.label}">${shapeMarkup(sym.key, sym.color)}</svg>`
    );
  }

  PSET.SYMBOLS = SYMBOLS;
  PSET.iconSVG = iconSVG;
})(window.PSET = window.PSET || {});
