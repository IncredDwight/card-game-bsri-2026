# Projective Set

A solitaire card game played on a 63-card deck. No build step, no dependencies — open `index.html` in a browser and play.

## Rules

Every card carries some combination of six symbols:

`blue square` `green circle` `red heart` `purple triangle` `yellow star` `orange moon`

No two cards carry the same combination, and the empty combination isn't a card — that gives exactly **2⁶ − 1 = 63** cards, one per non-empty subset of the six symbols.

Tap three cards to test them as a **line**. They're valid when every symbol appears an *even* number of times across the three of them (0 or 2 times — never 1 or 3). A confirmed line is removed from the board and replaced from the deck. The game is won when the deck and board are both empty.

If you're stuck:
- **Hint** highlights a valid line currently on the board, if one exists.
- **Deal 3 more** adds cards without using a line, for when none are available.

### Why "even" is the rule

Think of each card as a 6-bit binary number — one bit per symbol. Adding three numbers bit-by-bit *without carrying* is the same as taking their XOR, and a bit only comes out 0 if it started out 1 in an even number of the inputs. So "every symbol appears an even number of times" is exactly the condition `cardA ^ cardB ^ cardC === 0`. That's also why each card's binary code is printed under its symbols — a quick way to sanity-check a line by eye if you'd rather work with bits than icons.

(This is the same idea as the real card game *Projective Set*, which uses three states per symbol over GF(3) instead of present/absent over GF(2). This version is the binary, six-symbol case.)

## Files

```
index.html        Page shell and game layout
css/style.css      All styling
js/symbols.js      Symbol definitions + inline SVG icon rendering
js/deck.js         Card representation, deck generation, shuffling
js/gameLogic.js    Line validation and line-finding (for hints)
js/ui.js           DOM rendering helpers and the line-draw animation
js/main.js         Game state and event wiring (the controller)
```

Everything is loaded as plain `<script>` tags (no module bundler needed), sharing a single `window.PSET` namespace.
