import { state } from '../state.js';
import { renderCard } from '../game/card.js';

export function renderBoard() {
  return `
    <div class="board">
      ${state.deck.map(renderCard).join('')}
    </div>
  `;
}
