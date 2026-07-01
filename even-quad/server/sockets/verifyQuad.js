export function registerVerifyQuad(
	socket,
	io,
	players,
	deck,
	scores,
	startNewGame
) {
	socket.on('verify-quad', (ids) => {
		const cards = ids.map((id) =>
			deck.tableCards.find((card) => card.id === id)
		);

		if (cards.some((card) => !card)) return;

		if (!deck.isQuad(cards)) {
			console.log('Rejected quad');
			return;
		}

		deck.setTableCards(
			deck.tableCards.filter((card) => !ids.includes(card.id))
		);

		const scoringName = players[socket.id]?.name;

		if (scoringName) {
			scores.addScore(scoringName, 1);
		}

		console.log(`${scoringName} found a quad`);
		io.emit('quad-found', scoringName);

		deck.dealCards(10);

		const currentScores = scores.getScores();

		if (deck.isDeckCleared()) {
			const highScore = Math.max(...Object.values(currentScores));

			const winners = Object.entries(currentScores)
				.filter(([, s]) => s === highScore)
				.map(([name]) => name);

			console.log('Game over! Winners:', winners);

			io.emit('game-over', winners, currentScores);

			setTimeout(() => {
				startNewGame();
				io.emit(
					'game-state',
					deck.tableCards,
					deck.undealtDeck,
					scores.getScores()
				);
			}, 5000);

			return;
		}

		io.emit('game-state', deck.tableCards, deck.undealtDeck, currentScores);
	});
}
