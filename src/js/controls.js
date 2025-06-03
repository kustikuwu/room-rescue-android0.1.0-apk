// Используем глобальный объект keys
window.keys = window.keys || {
  left: false,
  right: false,
  up: false,
  down: false,
  a: false,
  b: false
};

function setupMobileControls() {
  const controlsContainer = document.getElementById('mobile-controls');
  
  // Единый обработчик для всех кнопок
  controlsContainer.addEventListener('touchstart', handleButtonEvent);
  controlsContainer.addEventListener('touchend', handleButtonEvent);
  controlsContainer.addEventListener('touchcancel', handleButtonEvent);
  controlsContainer.addEventListener('mousedown', handleButtonEvent);
  controlsContainer.addEventListener('mouseup', handleButtonEvent);
  controlsContainer.addEventListener('mouseleave', handleButtonEvent);
}

function handleButtonEvent(e) {
  const btn = e.target.closest('.btn-control, .btn-action');
  if (!btn) return;
  
  const isActive = e.type === 'touchstart' || e.type === 'mousedown';
  const isTouch = e.type.startsWith('touch');
  
  if (isTouch) e.preventDefault();
  
  if (btn.classList.contains('btn-control')) {
    window.keys[btn.dataset.dir] = isActive;
  } else if (btn.classList.contains('btn-action')) {
    window.keys[btn.dataset.action] = isActive;
  }
}

window.addEventListener('load', setupMobileControls);

function setupSwipeControls() {
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  });

  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) simulateKey('right');
      else if (dx < -30) simulateKey('left');
    } else {
      if (dy > 30) simulateKey('down');
      else if (dy < -30) simulateKey('up');
    }
  });
}

function simulateKey(dir) {
  window.keys[dir] = true;
  setTimeout(() => window.keys[dir] = false, 200); // удержание 200 мс
}

window.addEventListener('load', () => {
  setupMobileControls();
  setupSwipeControls(); // ← добавляем свайпы
});
