import { state } from '../state.js';

export function renderTopbar() {
  return `
    <div class="topbar">
      <div>You are: <strong style="color:${state.playerColor}">${state.playerRole}</strong></div>
      <div>Cards Remaining: ${state.deck.length + state.totalDeck.length}</div>
      <div>Selected: ${state.selected.length}/4</div>
    </div>
  `;
}
