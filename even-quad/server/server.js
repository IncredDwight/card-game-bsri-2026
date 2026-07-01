import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import * as deck from './game/deck.js';
import * as scores from './game/scores.js';
import { registerVerifyQuad } from './sockets/verifyQuad.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const CARD_BACKS = Array.from(
  { length: 65 },
  (_, i) => `/card_backs/${String(i).padStart(2, '0')}.jpg`
);

const players = {};
let playerCounter = 0;

const PLAYER_COLORS = [
  '#f87171',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#f472b6',
  '#38bdf8',
  '#fb923c',
];

function broadcastPlayers() {
  const currentScores = scores.getScores();

  const list = Object.values(players).map((p) => ({
    name: p.name,
    color: p.color,
    score: currentScores[p.name] ?? 0,
  }));

  io.emit('players-update', list);
}

scores.registerScoreUpdater(() => {
  broadcastPlayers();
  io.emit('scores-update', scores.getScores());
});

function startNewGame() {
  deck.initializeDeck();

  const currentScores = scores.getScores();

  Object.keys(currentScores).forEach((name) => {
    scores.setScore(name, 0);
  });

  console.log(
    'New game started. Total cards:',
    deck.undealtDeck.length + deck.tableCards.length
  );
  broadcastPlayers();
}

startNewGame();

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  playerCounter++;

  const playerName = `Player ${playerCounter}`;
  const playerColor = PLAYER_COLORS[(playerCounter - 1) % PLAYER_COLORS.length];

  players[socket.id] = {
    name: playerName,
    color: playerColor,
  };

  scores.setScore(playerName, 0);

  socket.emit(
    'game-state',
    deck.tableCards,
    deck.undealtDeck,
    scores.getScores()
  );

  broadcastPlayers();
  socket.on('set-nickname', (rawName) => {
    const name = String(rawName).trim().slice(0, 20);
    if (!name) return;

    const taken = Object.values(players).some(
      (p) => p.name === name && p !== players[socket.id]
    );
    if (taken) {
      socket.emit('nickname-taken');
      return;
    }

    const oldName = players[socket.id]?.name;
    if (oldName) scores.removeScore(oldName);

    players[socket.id].name = name;
    socket.emit('assign-player', name, playerColor);
    scores.setScore(name, 0);
    socket.emit('nickname-set', name);
    broadcastPlayers();
  });

  registerVerifyQuad(socket, io, players, deck, scores, startNewGame);

  socket.on('end-game', () => {
    console.log('Trigger end game');
    startNewGame();
  });

  socket.on('disconnect', () => {
    const leaving = players[socket.id];

    delete players[socket.id];

    if (leaving) {
      scores.removeScore(leaving.name);
    }

    if (Object.keys(players).length === 0) {
      playerCounter = 0;
      startNewGame();
    }

    broadcastPlayers();

    console.log('Disconnected:', socket.id);
  });
});

const clientDist = path.join(__dirname, '../client/dist');

app.use(express.static(clientDist));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('================================');
  console.log(`Server running on port ${PORT}`);
  console.log('================================');
});
