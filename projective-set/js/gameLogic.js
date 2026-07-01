/**
 * gameLogic.js
 * Rule: three cards form a valid "line" when every symbol appears an even
 * number of times across them (0 or 2 times, since there are only 3 cards).
 * Per symbol bit, even-count <=> XOR of the three bits is 0, so the whole
 * rule reduces to: mask_a ^ mask_b ^ mask_c === 0.
 */
(function (PSET) {
  'use strict';

  function isValidTriple(a, b, c) {
    return (a ^ b ^ c) === 0;
  }

  /**
   * Search a board of masks for one valid triple.
   * Uses the fact that for any two cards a, b the only mask that could
   * complete a line is a ^ b, so a single pass with a lookup map finds a
   * line in O(n^2) instead of O(n^3).
   * @param {number[]} boardMasks
   * @returns {[number, number, number] | null} board indices, or null
   */
  function findTriple(boardMasks) {
    const indexByMask = new Map();
    boardMasks.forEach((m, i) => indexByMask.set(m, i));

    for (let i = 0; i < boardMasks.length; i++) {
      for (let j = i + 1; j < boardMasks.length; j++) {
        const need = boardMasks[i] ^ boardMasks[j];
        if (need === 0) continue; // would mean a duplicate card; can't happen
        if (indexByMask.has(need)) {
          const k = indexByMask.get(need);
          if (k !== i && k !== j) return [i, j, k];
        }
      }
    }
    return null;
  }

  /** Counts every valid triple on the board (useful for stats/debugging). */
  function countTriples(boardMasks) {
    let count = 0;
    const n = boardMasks.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          if (isValidTriple(boardMasks[i], boardMasks[j], boardMasks[k])) count++;
        }
      }
    }
    return count;
  }

  PSET.isValidTriple = isValidTriple;
  PSET.findTriple = findTriple;
  PSET.countTriples = countTriples;
})(window.PSET = window.PSET || {});
