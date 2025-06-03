// Категории уровней и список уровней в каждой
const levelCategories = {
  tutorial: {
    name: '🧠 Обучение',
    levels: [1, 2, 3]
  },
  classic: {
    name: '🧹 Классика',
    levels: [4, 5, 6, 7, 8, 9, 10]
  },
  challenge: {
    name: '⚡ Челленджи',
    levels: [11, 12, 13, 14, 15, 16, 17, 18]
  }
};

function loadLevelCategories() {
  const container = document.getElementById('categoryButtons');
  if (!container) return;

  container.innerHTML = '';
  for (const key in levelCategories) {
    const btn = document.createElement('button');
    btn.textContent = levelCategories[key].name;
    btn.addEventListener('click', () => {
      showScreen('levelSelect');
      requestAnimationFrame(() => {
        loadLevelButtons(key);
      });
    });
    container.appendChild(btn);
  }
}

function loadLevelButtons(categoryKey) {
  const category = levelCategories[categoryKey];
  const container = document.getElementById('levelButtons');
  if (!container || !category) return;

  container.innerHTML = '';
  const maxUnlocked = parseInt(localStorage.getItem('maxLevelUnlocked') || '1');

  category.levels.forEach(level => {
    const btn = document.createElement('button');
    btn.textContent = `Уровень ${level}`;
    btn.disabled = level > maxUnlocked;
    btn.addEventListener('click', () => startLevel(level));
    container.appendChild(btn);
  });
}

function startLevel(level) {
  showScreen('gameScreen');
  setTimeout(() => {
    if (typeof window.loadLevel === 'function') {
      window.loadLevel(level);
    }
  }, 150);
}

document.addEventListener('DOMContentLoaded', () => {
  const backFromGame = document.getElementById('backFromGame');
  if (backFromGame) {
    backFromGame.addEventListener('click', () => {
      if (window.stopGame) window.stopGame();
      const msg = document.getElementById('levelCompleteMessage');
      if (msg) msg.style.display = 'none';
      showScreen('levelSelect');
    });
  }

  const backFromLevels = document.getElementById('backFromLevels');
  if (backFromLevels) {
    backFromLevels.addEventListener('click', () => {
      showScreen('levelCategorySelect');
    });
  }

  const backFromCategory = document.getElementById('backFromCategory');
  if (backFromCategory) {
    backFromCategory.addEventListener('click', () => {
      showScreen('mainMenu');
    });
  }

  const continueButton = document.getElementById('continueButton');
  if (continueButton) {
    continueButton.addEventListener('click', () => {
      const msg = document.getElementById('levelCompleteMessage');
      if (msg) msg.style.display = 'none';
      if (window.stopGame) window.stopGame();
      showScreen('levelSelect');
    });
  }
});
