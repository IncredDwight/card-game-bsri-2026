const scores = {};

export function initializeScores(players) {
  players.forEach((player) => {
    scores[player.id] = 0;
  });

  UpdateScores();
}

export function getScores() {
  return scores;
}

export function setScore(playerId, score) {
  scores[playerId] = score;
  UpdateScores();
}

export function addScore(playerId, amount = 1) {
  if (!(playerId in scores)) {
    scores[playerId] = 0;
  }

  scores[playerId] += amount;
  UpdateScores();
}

export function subtractScore(playerId, amount = 1) {
  if (!(playerId in scores)) {
    scores[playerId] = 0;
  }

  scores[playerId] -= amount;
  UpdateScores();
}

let updateCallback = null;

export function registerScoreUpdater(callback) {
  updateCallback = callback;
}

export function removeScore(playerName) {
  delete scores[playerName];
  UpdateScores();
}

function UpdateScores() {
  if (updateCallback) {
    updateCallback(scores);
  }
}
