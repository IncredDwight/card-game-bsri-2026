import { io } from 'socket.io-client';
import { state } from './state.js';
import { setupQuadFoundPopUp } from './render/quadFoundPopUp.js';
import { showNicknameModal } from './game/nicknameModal.js';
import { setupGameOverSound } from './audioEffects/gameOverSoundEffect.js';

export const socket = io();

export function setupSocketListeners(render) {
  socket.on('connect', () => {
    showNicknameModal(socket, () => render());
  });
  socket.on('assign-player', (name, color) => {
    state.playerRole = name;
    state.playerColor = color;
    render();
  });

  socket.on('players-update', (list) => {
    state.connectedPlayers = list;
    render();
  });

  socket.on('game-over', (winners, finalScores) => {
    state.gameOver = { winners, scores: finalScores };
    render();
  });

  socket.on('game-state', (tableDeck, serverDeck, serverScores) => {
    state.deck = tableDeck;
    state.totalDeck = serverDeck;
    state.scores = serverScores ?? state.scores;
    state.gameOver = null;
    state.selected = [];
    state.flippedCards.clear();
    Object.values(state.flipTimers).forEach(clearTimeout);
    state.flipTimers = {};
    state.flipTimestamps = {};
    render();
  });
  setupQuadFoundPopUp(socket);
  setupGameOverSound(socket);
}
