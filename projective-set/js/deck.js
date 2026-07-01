/**
 * deck.js
 * A card is represented as an integer bitmask from 1 to 63 (6 bits).
 * Bit b set means the symbol with index b is present on the card.
 * The full deck is every non-empty subset of 6 symbols: 2^6 - 1 = 63 cards,
 * each one appearing exactly once.
 */
(function (PSET) {
  'use strict';

  const SYMBOL_COUNT = 6;
  const DECK_SIZE = (1 << SYMBOL_COUNT) - 1; // 63

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  class Deck {
    constructor() {
      this.reset();
    }

    reset() {
      this.cards = [];
      for (let mask = 1; mask <= DECK_SIZE; mask++) this.cards.push(mask);
      shuffle(this.cards);
    }

    /** Draw up to n cards from the top of the deck. */
    draw(n) {
      return this.cards.splice(0, Math.min(n, this.cards.length));
    }

    get remaining() {
      return this.cards.length;
    }
  }

  /** Returns the list of symbol indices present on a card. */
  function symbolsOf(mask) {
    const out = [];
    for (let b = 0; b < SYMBOL_COUNT; b++) {
      if (mask & (1 << b)) out.push(b);
    }
    return out;
  }

  PSET.SYMBOL_COUNT = SYMBOL_COUNT;
  PSET.DECK_SIZE = DECK_SIZE;
  PSET.Deck = Deck;
  PSET.symbolsOf = symbolsOf;
})(window.PSET = window.PSET || {});
