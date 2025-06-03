// === МАГАЗИН ===

const COMMON_COLORS = [
  '#27ae60', '#2980b9', '#c0392b', '#8e44ad',
  '#f39c12', '#1abc9c', '#34495e', '#e67e22',
  '#9b59b6', '#16a085', '#bdc3c7', '#7f8c8d'
];

const RARE_COLORS = [
  '#f1c40f', '#e74c3c', '#d35400', '#2ecc71',
  '#ff00ff', '#00f0ff', '#a8ff00',
  'linear-blue-pink', 'linear-green-yellow', 'rainbow-skin'
];

const SKIN_COLORS = [...COMMON_COLORS, ...RARE_COLORS];

function getRandomColorWithRarity() {
  return Math.random() < 0.2
    ? RARE_COLORS[Math.floor(Math.random() * RARE_COLORS.length)]
    : COMMON_COLORS[Math.floor(Math.random() * COMMON_COLORS.length)];
}

document.addEventListener('DOMContentLoaded', () => {
  // Вкладки магазина
  document.querySelectorAll('.shop-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.shop-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`.shop-tab[data-tab="${tab}"]`).classList.add('active');
    });
  });

  document.getElementById('shopButton')?.addEventListener('click', () => {
    showScreen('shopScreen');
    renderColorShop();
  });

  document.getElementById('backFromShop')?.addEventListener('click', () => {
    showScreen('mainMenu');
  });

  function renderColorShop() {
    const container = document.getElementById('colorShop');
    container.innerHTML = '';

    const selected = getSelectedSkin();
    const purchased = getPurchasedSkins();
    const coins = getCoins();

    // === Обычные цвета ===
    const commonWrapper = document.createElement('div');
    commonWrapper.className = 'color-category';
    container.appendChild(commonWrapper);

    const commonTitle = document.createElement('h3');
    commonTitle.textContent = '🎨 Обычные цвета';
    commonWrapper.appendChild(commonTitle);

    const commonGrid = document.createElement('div');
    commonGrid.className = 'shop-grid';
    commonWrapper.appendChild(commonGrid);

    COMMON_COLORS.forEach(color => {
      const item = document.createElement('div');
      item.className = 'shop-item';

      const preview = document.createElement('div');
      preview.className = 'shop-color-preview';
      preview.style.background = color;

      const button = document.createElement('button');

      if (color === selected) {
        button.textContent = 'ВЫБРАНО';
        button.classList.add('selected');
        button.disabled = true;
      } else if (purchased.includes(color)) {
        button.textContent = 'ВЫБРАТЬ';
        button.addEventListener('click', () => {
          setSelectedSkin(color);
          renderColorShop();
        });
      } else {
        button.textContent = 'КУПИТЬ (15)';
        button.disabled = coins < 15;
        button.addEventListener('click', () => {
          if (getCoins() >= 15) {
            addCoins(-15);
            purchaseSkin(color);
            setSelectedSkin(color);
            updateCoinDisplay();
            renderColorShop();
          }
        });
      }

      item.appendChild(preview);
      item.appendChild(button);
      commonGrid.appendChild(item);
    });

    // === Редкие цвета ===
    const rareWrapper = document.createElement('div');
    rareWrapper.className = 'color-category';
    container.appendChild(rareWrapper);

    const rareTitle = document.createElement('h3');
    rareTitle.textContent = '💎 Редкие цвета';
    rareWrapper.appendChild(rareTitle);

    const rareGrid = document.createElement('div');
    rareGrid.className = 'shop-grid';
    rareWrapper.appendChild(rareGrid);

    RARE_COLORS.forEach(color => {
      const item = document.createElement('div');
      item.className = 'shop-item';

      const preview = document.createElement('div');
      preview.className = 'shop-color-preview';

      // --- отображение фона для редких скинов ---
      if (color === 'linear-blue-pink') {
        preview.style.background = 'linear-gradient(135deg, #2980b9, #ff00ff)';
      } else if (color === 'linear-green-yellow') {
        preview.style.background = 'linear-gradient(135deg, #2ecc71, #f1c40f)';
      } else if (color === 'rainbow-skin') {
        preview.style.background = 'linear-gradient(45deg, red, orange, yellow, green, cyan, blue, violet)';
      } else {
        preview.style.background = color;
      }

      const button = document.createElement('button');

      if (!purchased.includes(color)) {
        button.textContent = '🎲 Только из рулетки';
        button.disabled = true;
      } else if (color === selected) {
        button.textContent = 'ВЫБРАНО';
        button.classList.add('selected');
        button.disabled = true;
      } else {
        button.textContent = 'ВЫБРАТЬ';
        button.addEventListener('click', () => {
          setSelectedSkin(color);
          renderColorShop();
        });
      }

      item.appendChild(preview);
      item.appendChild(button);
      rareGrid.appendChild(item);
    });
  }

  function setSlotBackground(slot, color) {
    if (color === 'linear-blue-pink') {
      slot.style.background = 'linear-gradient(135deg, #2980b9, #ff00ff)';
    } else if (color === 'linear-green-yellow') {
      slot.style.background = 'linear-gradient(135deg, #2ecc71, #f1c40f)';
    } else if (color === 'rainbow-skin') {
      slot.style.background = 'linear-gradient(45deg, red, orange, yellow, green, cyan, blue, violet)';
    } else {
      slot.style.background = color;
    }
  }

  // === Рулетка ===
  const spinButton = document.getElementById('spinWheelButton');
  const resultDiv = document.getElementById('rouletteResult');
  const slotLeft = document.getElementById('slot-left');
  const slotCenter = document.getElementById('slot-center');
  const slotRight = document.getElementById('slot-right');

  if (spinButton && slotLeft && slotCenter && slotRight) {
    spinButton.addEventListener('click', () => {
      if (getCoins() < 25) {
        resultDiv.textContent = 'Недостаточно монет!';
        return;
      }

      spinButton.disabled = true;
      resultDiv.textContent = '';
      addCoins(-25);
      updateCoinDisplay();

      let currentSpeed = 100;
      let totalDuration = 0;
      const minSpeed = 400;

      const spinLoop = () => {
        const leftColor = getRandomColorWithRarity();
        const centerColor = getRandomColorWithRarity();
        const rightColor = getRandomColorWithRarity();

        setSlotBackground(slotLeft, leftColor);
        setSlotBackground(slotCenter, centerColor);
        setSlotBackground(slotRight, rightColor);

        [slotLeft, slotCenter, slotRight].forEach(slot => {
          slot.classList.remove('rare', 'rare-temp');
        });

        if (RARE_COLORS.includes(leftColor)) slotLeft.classList.add('rare-temp');
        if (RARE_COLORS.includes(centerColor)) slotCenter.classList.add('rare-temp');
        if (RARE_COLORS.includes(rightColor)) slotRight.classList.add('rare-temp');

        totalDuration += currentSpeed;

        if (totalDuration < 8000) {
          currentSpeed = Math.min(currentSpeed + 30, minSpeed);
          setTimeout(spinLoop, currentSpeed);
        } else {
          if (hasPurchasedSkin(centerColor)) {
            resultDiv.innerHTML = `🎲 Выпал цвет <span style="color:${centerColor}">${centerColor}</span> — уже куплен.`;
          } else {
            purchaseSkin(centerColor);
            resultDiv.innerHTML = `🎉 Получен новый цвет: <span style="color:${centerColor}">${centerColor}</span>!`;
          }
          renderColorShop();
          spinButton.disabled = false;
        }
      };

      spinLoop();
    });
  }
});
