import './style.css';

import { state } from './state.js';
import { setupSocketListeners } from './socket.js';
import { toggleCard, updateSelectionUI } from './game/selection.js';
import { toggleFlip } from './game/flip.js';
import { findQuad } from './game/game.js';
import { renderTopbar } from './render/topbar.js';
import { renderScoreboard } from './render/scoreboard.js';
import { renderBoard } from './render/board.js';
import { renderGameOver } from './render/gameOver.js';

// ─── Render ──────────────────────────────────────────────────────────────────

function render() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <h1>Even Quad</h1>
    ${renderTopbar()}
    ${renderScoreboard()}
    ${renderGameOver()}
    ${renderBoard()}
  `;

  document.querySelectorAll('.card').forEach((element) => {
    element.addEventListener('click', () => {
      const card = state.deck.find((c) => c.id === element.dataset.id);
      if (card) toggleCard(card);
    });

    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const card = state.deck.find((c) => c.id === element.dataset.id);
      if (card) toggleFlip(card.id);
    });

    // Long press on touch devices (1.5s)
    let longPressTimer;
    let longPressTriggered = false;

    element.addEventListener('touchstart', () => {
      longPressTriggered = false;

      longPressTimer = setTimeout(() => {
        const card = state.deck.find((c) => c.id === element.dataset.id);
        if (card) {
          longPressTriggered = true;
          toggleFlip(card.id);
        }
      }, 1500);
    });

    element.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    });

    element.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    });

    element.addEventListener('touchcancel', () => {
      clearTimeout(longPressTimer);
    });
  });
}

// ─── Keyboard shortcut ───────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 't') return;

  const quad = findQuad(state.deck);
  if (!quad) {
    console.log('No quad found');
    return;
  }

  state.selected = [...quad];
  updateSelectionUI();
  console.log(
    'Quad found:',
    quad.map((c) => c.id)
  );
});

// ─── Bootstrap ───────────────────────────────────────────────────────────────

setupSocketListeners(render);
render();
