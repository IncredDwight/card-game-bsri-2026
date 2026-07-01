export function setupGameOverSound(socket) {
    const audio = new Audio('/sounds/winquad.wav');

    audio.preload = 'auto';
    audio.load();

    const unlockAudio = () => {
        audio.muted = true;

        audio
            .play()
            .then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;

                document.removeEventListener('pointerdown', unlockAudio);
            })
            .catch(() => {});
    };

    document.addEventListener('pointerdown', unlockAudio);

    socket.on('game-over', () => {
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;

            audio.play().catch((err) => {
                console.error('Failed to play game over sound:', err);
            });
        }, 2000);
    });
}
