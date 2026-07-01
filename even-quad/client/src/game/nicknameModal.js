export function showNicknameModal(socket, onConfirmed) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  overlay.innerHTML = `
    <div id="modal-inner" style="
      background: #1e1e2e;
      border-radius: 16px;
      padding: 40px 48px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      min-width: 320px;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    ">
      <h2 style="margin:0; color:#fff; font-size:1.6rem;">Enter your nickname</h2>
      <input id="nickname-input" maxlength="20" placeholder="Your name..." style="
        padding: 10px 16px;
        border-radius: 8px;
        border: 2px solid #444;
        background: #2a2a3e;
        color: #fff;
        font-size: 1.1rem;
        width: 100%;
        outline: none;
        box-sizing: border-box;
      "/>
      <p id="nickname-error" style="color:#f87171; margin:0; min-height:1.2em; font-size:0.9rem;"></p>
      <button id="nickname-submit" style="
        padding: 10px 32px;
        border-radius: 8px;
        border: none;
        background: #60a5fa;
        color: #fff;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
      ">Join Game</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const inner = overlay.querySelector('#modal-inner');
  const input = overlay.querySelector('#nickname-input');
  const submitBtn = overlay.querySelector('#nickname-submit');
  const errorMsg = overlay.querySelector('#nickname-error');

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    inner.style.transform = 'scale(1)';
  });

  input.focus();

  function submit() {
    const name = input.value.trim();
    if (!name) {
      errorMsg.textContent = 'Please enter a nickname.';
      return;
    }
    submitBtn.disabled = true;
    socket.emit('set-nickname', name);
  }

  submitBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  socket.on('nickname-taken', () => {
    errorMsg.textContent = 'That name is taken, try another.';
    submitBtn.disabled = false;
    input.select();
  });

  socket.on('nickname-set', (name) => {
    overlay.style.opacity = '0';
    inner.style.transform = 'scale(0.9)';
    setTimeout(() => {
      overlay.remove();
      onConfirmed(name); // callback — no async needed
    }, 300);
  });
}
