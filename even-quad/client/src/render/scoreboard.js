import { state } from '../state.js';

export function renderScoreboard() {
  if (state.connectedPlayers.length === 0) return '';

  return `
    <div class="scoreboard">
      ${state.connectedPlayers
        .map(
          (p) => `
        <div class="score-entry${p.name === state.playerRole ? ' you' : ''}" style="--player-color:${p.color}">
          <span class="score-dot"></span>
          <span class="score-name">${p.name}</span>
          <strong class="score-val">${p.score}</strong>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}
