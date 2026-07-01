import { state } from '../state.js';

export function renderGameOver() {
  if (!state.gameOver) return '';

  const { winners, scores } = state.gameOver;
  const title =
    winners.length === 1
      ? `🏆 ${winners[0]} wins!`
      : `🏆 Tie: ${winners.join(' & ')}!`;

  const scoreRows = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([name, score]) => {
      const player = state.connectedPlayers.find((p) => p.name === name);
      const color = player?.color ?? '#aaa';
      return `
        <div class="final-score-row" style="--player-color:${color}">
          <span class="score-dot"></span>
          <span>${name}</span>
          <strong>${score} quad${score !== 1 ? 's' : ''}</strong>
        </div>
      `;
    })
    .join('');

  return `
    <div class="game-over">
      <div class="game-over-box">
        <h2>${title}</h2>
        <div class="final-scores">${scoreRows}</div>
        <p class="restart-note">New game starting in 5 seconds…</p>
      </div>
    </div>
  `;
}
