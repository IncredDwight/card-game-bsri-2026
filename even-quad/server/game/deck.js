const CARD_BACKS = Array.from(
  { length: 65 },
  (_, i) => `/card_backs/${String(i).padStart(2, '0')}.jpg`
);

export let undealtDeck = [];
export let tableCards = [];

export function initializeDeck() {
  undealtDeck = generateDeck();
  tableCards = [];
  dealCards(10);
}

export function isDeckCleared() {
  return (
    (tableCards.length === 0 && undealtDeck.length === 0) ||
    findQuad(tableCards) == null
  );
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateDeck() {
  const deck = [];
  let imageIndex = 0;

  for (let color = 0; color < 4; color++) {
    for (let shape = 0; shape < 4; shape++) {
      for (let count = 0; count < 4; count++) {
        console.log(CARD_BACKS[imageIndex]);
        deck.push({
          id: `${color}-${shape}-${count}`,
          color,
          shape,
          count,
          backImage: CARD_BACKS[imageIndex++],
        });
      }
    }
  }
  shuffle(deck);

  return deck;
}

export function dealCards(targetCount = 10) {
  while (tableCards.length < targetCount && undealtDeck.length > 0) {
    tableCards.push(undealtDeck.pop());
  }
}

function findQuad(deck = null) {
  if (deck == null) deck = tableCards;

  for (let i = 0; i < deck.length - 3; i++) {
    for (let j = i + 1; j < deck.length - 2; j++) {
      for (let k = j + 1; k < deck.length - 1; k++) {
        for (let l = k + 1; l < deck.length; l++) {
          const cards = [deck[i], deck[j], deck[k], deck[l]];

          if (isQuad(cards)) {
            return cards;
          }
        }
      }
    }
  }
  return null;
}

export function isQuad(cards) {
  if (!cards || cards.length !== 4) return false;
  let colorXor = 0,
    shapeXor = 0,
    countXor = 0;
  for (const card of cards) {
    colorXor ^= card.color;
    shapeXor ^= card.shape;
    countXor ^= card.count;
  }
  return colorXor === 0 && shapeXor === 0 && countXor === 0;
}

export function setTableCards(newCards) {
  tableCards = newCards;
}

export function setUndealtDeck(newDeck) {
  undealtDeck = newDeck;
}
