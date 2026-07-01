import { state } from '../state.js';
import { isQuad } from './game.js';
import { socket } from '../socket.js';

export function toggleCard(card) {
  if (state.flippedCards.has(card.id)) return;

  const alreadySelected = state.selected.find((c) => c.id === card.id);
  if (alreadySelected) {
    state.selected = state.selected.filter((c) => c.id !== card.id);
  } else {
    state.selected.push(card);
  }

  if (state.selected.length === 4) {
    if (isQuad(state.selected)) {
      socket.emit(
        'verify-quad',
        state.selected.map((c) => c.id)
      );
    }
    state.selected = [];
  }

  updateSelectionUI();
}

export function updateSelectionUI() {
  document.querySelectorAll('.card').forEach((cardEl) => {
    cardEl.classList.toggle(
      'selected',
      state.selected.some((c) => c.id === cardEl.dataset.id)
    );
  });
  document.querySelector('.topbar div:last-child').innerHTML =
    `Selected: ${state.selected.length}/4`;
}
