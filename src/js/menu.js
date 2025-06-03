document.addEventListener('DOMContentLoaded', () => {
  // Переключение экранов
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');

    if (window.updateCoinDisplay) updateCoinDisplay();
  }
  
  window.showScreen = showScreen;


  // Кнопки меню
  const playBtn = document.getElementById('playButton');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      showScreen('levelCategorySelect');
      setTimeout(() => {
        if (typeof loadLevelCategories === 'function') loadLevelCategories();
      }, 100);
    });
  }

  const settingsBtn = document.getElementById('settingsButton');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showScreen('settingsMenu');
    });
  }

  const exitBtn = document.getElementById('exitButton');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      alert('Спасибо за игру! Чтобы выйти — закройте вкладку.');
    });
  }

  const backFromSettings = document.getElementById('backFromSettings');
  if (backFromSettings) {
    backFromSettings.addEventListener('click', () => {
      showScreen('mainMenu');
    });
  }

  showScreen('mainMenu');
  if (window.updateCoinDisplay) updateCoinDisplay();
});


