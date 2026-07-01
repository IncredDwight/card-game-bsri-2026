export async function setupQuadFoundPopUp(socket) {
    const toast = document.createElement('div');

    // Audio setup
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let quadBuffer = null;

    fetch('/sounds/quadFound.wav')
        .then((res) => res.arrayBuffer())
        .then((data) => audioCtx.decodeAudioData(data))
        .then((buffer) => {
            quadBuffer = buffer;
        })
        .catch((err) => {
            console.error('Failed to load quad sound:', err);
        });

    const unlockAudio = async () => {
        if (audioCtx.state === 'suspended') {
            try {
                await audioCtx.resume();
            } catch (err) {
                console.error(err);
            }
        }

        document.removeEventListener('pointerdown', unlockAudio);
    };

    document.addEventListener('pointerdown', unlockAudio);

    function playQuadSound() {
        if (!quadBuffer) return;

        try {
            const source = audioCtx.createBufferSource();
            source.buffer = quadBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        } catch (err) {
            console.error('Failed to play quad sound:', err);
        }
    }

    toast.id = 'quad-toast';

    Object.assign(toast.style, {
        position: 'fixed',
        top: '75%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.8)',
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '24px 48px',
        borderRadius: '16px',
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: '9999',
    });

    document.body.appendChild(toast);

    let toastTimer = null;

    socket.on('quad-found', (name) => {
        playQuadSound();

        toast.textContent = name
            ? `🎉 ${name} found a Quad!`
            : '🎉 Quad found!';

        clearTimeout(toastTimer);

        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -50%) scale(0.8)';

        void toast.offsetWidth;

        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, -50%) scale(1)';

        toastTimer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -50%) scale(0.8)';
        }, 2500);
    });
}
