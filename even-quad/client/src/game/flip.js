import { state } from '../state.js';

const FLIP_DURATION_MS = 10_000;

export function toggleFlip(cardId) {
  const cardEl = () => document.querySelector(`.card[data-id="${cardId}"]`);

  if (state.flippedCards.has(cardId)) {
    // Unflip manually
    state.flippedCards.delete(cardId);
    delete state.flipTimestamps[cardId];
    cardEl()?.classList.remove('flipped');
    clearTimeout(state.flipTimers[cardId]);
    delete state.flipTimers[cardId];
  } else {
    // Flip and start auto-reset timer
    state.flippedCards.add(cardId);
    state.flipTimestamps[cardId] = Date.now();
    cardEl()?.classList.add('flipped');
    clearTimeout(state.flipTimers[cardId]);
    state.flipTimers[cardId] = setTimeout(() => {
      state.flippedCards.delete(cardId);
      delete state.flipTimestamps[cardId];
      cardEl()?.classList.remove('flipped');
      delete state.flipTimers[cardId];
    }, FLIP_DURATION_MS);
  }
}
