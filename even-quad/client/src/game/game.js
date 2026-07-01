export function isQuad(cards) {
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

/**
 * Brute-force search through the deck for the first valid quad.
 * Returns an array of four cards, or null if none exists.
 */
export function findQuad(deck) {
  for (let i = 0; i < deck.length - 3; i++)
    for (let j = i + 1; j < deck.length - 2; j++)
      for (let k = j + 1; k < deck.length - 1; k++)
        for (let l = k + 1; l < deck.length; l++) {
          const cards = [deck[i], deck[j], deck[k], deck[l]];
          if (isQuad(cards)) return cards;
        }
  return null;
}
