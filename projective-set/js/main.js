/**
 * main.js
 * Owns game state and wires DOM events to the model (deck.js, gameLogic.js)
 * and the view (ui.js).
 */
(function (PSET) {
  'use strict';

  const BOARD_TARGET = 9; // initial deal, and the size we top back up to
  const DEAL_STEP = 3;
  const RESOLVE_DELAY = 650;

  const state = {
    deck: null,
    board: [],     // masks currently on the board
    selected: [],  // up to 3 masks currently selected
    setsFound: 0,
    locked: false, // true while a selection is being resolved/animated
  };

  let boardEl, deckCountEl, setsCountEl, boardCountEl, messageEl;
  let dealBtn, hintBtn, newGameBtn;

  function init() {
    boardEl = document.getElementById('board');
    deckCountEl = document.getElementById('deck-count');
    setsCountEl = document.getElementById('sets-count');
    boardCountEl = document.getElementById('board-count');
    messageEl = document.getElementById('message');
    dealBtn = document.getElementById('deal-btn');
    hintBtn = document.getElementById('hint-btn');
    newGameBtn = document.getElementById('new-game-btn');

    dealBtn.addEventListener('click', dealMore);
    hintBtn.addEventListener('click', showHint);
    newGameBtn.addEventListener('click', startNewGame);

    startNewGame();
  }

  function startNewGame() {
    state.deck = new PSET.Deck();
    state.board = state.deck.draw(BOARD_TARGET);
    state.selected = [];
    state.setsFound = 0;
    state.locked = false;
    renderBoard();
    refreshStatus();
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    state.board.forEach((mask) => {
      const cardEl = PSET.UI.createCardElement(mask, { onClick: onCardClick });
      if (state.selected.includes(mask)) PSET.UI.setCardState(cardEl, 'is-selected');
      boardEl.appendChild(cardEl);
    });
    deckCountEl.textContent = String(state.deck.remaining);
    setsCountEl.textContent = String(state.setsFound);
    boardCountEl.textContent = String(state.board.length);
    dealBtn.disabled = state.deck.remaining < DEAL_STEP;
  }

  function onCardClick(mask, cardEl) {
    if (state.locked) return;

    if (state.selected.includes(mask)) {
      state.selected = state.selected.filter((m) => m !== mask);
      PSET.UI.setCardState(cardEl, null);
      return;
    }
    if (state.selected.length >= 3) return;

    state.selected.push(mask);
    PSET.UI.setCardState(cardEl, 'is-selected');

    if (state.selected.length === 3) evaluateSelection();
  }

  function evaluateSelection() {
    state.locked = true;
    const [a, b, c] = state.selected;
    const valid = PSET.isValidTriple(a, b, c);
    const cardEls = state.selected.map((m) => boardEl.querySelector(`[data-mask="${m}"]`));

    if (valid) {
      cardEls.forEach((el) => PSET.UI.setCardState(el, 'is-correct'));
      PSET.UI.flashLine(boardEl, cardEls);
      setMessage('Line confirmed — every symbol appears an even number of times.', 'success');
      const removed = state.selected.slice();
      setTimeout(() => resolveValidLine(removed), RESOLVE_DELAY);
    } else {
      cardEls.forEach((el) => PSET.UI.setCardState(el, 'is-wrong'));
      setMessage('Not a line — some symbol appears an odd number of times.', 'error');
      setTimeout(() => {
        cardEls.forEach((el) => PSET.UI.setCardState(el, null));
        state.selected = [];
        state.locked = false;
        refreshStatus();
      }, RESOLVE_DELAY);
    }
  }

  function resolveValidLine(removedMasks) {
    state.setsFound++;
    state.board = state.board.filter((m) => !removedMasks.includes(m));
    state.selected = [];

    const target = Math.max(BOARD_TARGET, state.board.length);
    while (state.board.length < target && state.deck.remaining > 0) {
      state.board.push(...state.deck.draw(1));
    }

    state.locked = false;
    renderBoard();
    refreshStatus();
  }

  function dealMore() {
    if (state.locked || state.deck.remaining <= 0) return;
    state.board.push(...state.deck.draw(DEAL_STEP));
    renderBoard();
    refreshStatus();
  }

  function showHint() {
    if (state.locked) return;
    const found = PSET.findTriple(state.board);
    if (!found) {
      setMessage('No line on the board right now — try dealing more cards.', 'warning');
      return;
    }
    const cardEls = found.map((i) => boardEl.children[i]);
    cardEls.forEach((el) => el.classList.add('is-hint'));
    setMessage('Hint: the three glowing cards form a line.', 'info');
    setTimeout(() => cardEls.forEach((el) => el.classList.remove('is-hint')), 1600);
  }

  function refreshStatus() {
    if (state.board.length === 0 && state.deck.remaining === 0) {
      const noun = state.setsFound === 1 ? 'line' : 'lines';
      setMessage(`Deck cleared in ${state.setsFound} ${noun}. Nicely played.`, 'success');
      return;
    }
    const found = PSET.findTriple(state.board);
    if (!found) {
      if (state.deck.remaining === 0) {
        const noun = state.board.length === 1 ? 'card remains' : 'cards remain';
        setMessage(`No more lines possible — ${state.board.length} ${noun}. Start a new game to try again.`, 'error');
      } else {
        setMessage('No line on the board yet — deal more cards or take a hint.', 'warning');
      }
      return;
    }
    setMessage('Find three cards where every symbol appears an even number of times.', 'info');
  }

  function setMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = 'message message-' + (kind || 'info');
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.PSET);
