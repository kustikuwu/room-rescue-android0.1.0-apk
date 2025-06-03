// Используем существующий объект keys
window.keys = window.keys || {
  left: false,
  right: false,
  up: false,
  down: false,
  a: false,
  b: false
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Глобальные игровые переменные
let player = { 
  x: 0, 
  y: 0, 
  width: 16, 
  height: 16, 
  speed: 1.5,
  vx: 0,
  vy: 0
};
let playerColor = getSelectedSkin();
let trashList = [];
let walls = [];
let rooms = [];
let collected = 0;
let totalTrash = 0;
let animationId;
let currentLevel = 1;
let levelCompleted = false;
let levelCompleteTime = 0;
let lastTimestamp = 0;

// Пространственное разбиение для оптимизации коллизий
const spatialGrid = [];
const CELL_SIZE = 100;

function initSpatialGrid() {
  const cols = Math.ceil(canvas.width / CELL_SIZE);
  const rows = Math.ceil(canvas.height / CELL_SIZE);
  
  for (let y = 0; y < rows; y++) {
    spatialGrid[y] = [];
    for (let x = 0; x < cols; x++) {
      spatialGrid[y][x] = [];
    }
  }
  
  // Распределяем стены по ячейкам
  for (const wall of walls) {
    const startX = Math.floor(wall.x / CELL_SIZE);
    const endX = Math.floor((wall.x + wall.width) / CELL_SIZE);
    const startY = Math.floor(wall.y / CELL_SIZE);
    const endY = Math.floor((wall.y + wall.height) / CELL_SIZE);
    
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (spatialGrid[y] && spatialGrid[y][x]) {
          spatialGrid[y][x].push(wall);
        }
      }
    }
  }
}

function updateCoinDisplay() {
  const el = document.getElementById('coinCount');
  if (el && window.getCoins) el.textContent = getCoins();
}


function getNearbyWalls(x, y, width, height) {
  const startX = Math.floor(x / CELL_SIZE);
  const endX = Math.floor((x + width) / CELL_SIZE);
  const startY = Math.floor(y / CELL_SIZE);
  const endY = Math.floor((y + height) / CELL_SIZE);
  
  const nearbyWalls = [];
  
  for (let yIdx = startY; yIdx <= endY; yIdx++) {
    for (let xIdx = startX; xIdx <= endX; xIdx++) {
      if (spatialGrid[yIdx] && spatialGrid[yIdx][xIdx]) {
        for (const wall of spatialGrid[yIdx][xIdx]) {
          if (!nearbyWalls.includes(wall)) {
            nearbyWalls.push(wall);
          }
        }
      }
    }
  }
  
  return nearbyWalls;
}

function handleInput() {
  if (levelCompleted) return;
  
  player.vx = 0;
  player.vy = 0;
  
  if (window.keys['ArrowLeft'] || window.keys['left']) player.vx = -player.speed;
  if (window.keys['ArrowRight'] || window.keys['right']) player.vx = player.speed;
  if (window.keys['ArrowUp'] || window.keys['up']) player.vy = -player.speed;
  if (window.keys['ArrowDown'] || window.keys['down']) player.vy = player.speed;
}

// Кэш для загруженных уровней
const levelCache = {};

function loadLevel(level) {
  currentLevel = level;
  collected = 0;
  trashList = [];
  walls = [];
  rooms = [];
  levelCompleted = false;
  player.vx = 0;
  player.vy = 0;
  
  // Сброс сообщения о завершении уровня
  const message = document.getElementById('levelCompleteMessage');
  if (message) message.style.display = 'none';
  
  // Проверяем кэш
  if (levelCache[level]) {
    applyLevelData(levelCache[level]);
    return;
  }
  
  fetch(`assets/levels/level${level}.json`)
    .then(res => res.json())
    .then(data => {
      levelCache[level] = data;
      applyLevelData(data);
    })
    .catch(err => {
      console.error('Ошибка загрузки уровня:', err);
      createTestLevel();
      updateCoinDisplay();
      startGameLoop();
    });
}

function applyLevelData(data) {
  canvas.width = data.canvasWidth || 800;
  canvas.height = data.canvasHeight || 600;
  
  player.x = data.player.x;
  player.y = data.player.y;
  
  trashList = data.trash.map(t => ({
    x: t.x,
    y: t.y,
    width: 16,
    height: 16,
    collected: false,
    type: t.type || 'trash'
  }));
  
  totalTrash = trashList.length;
  
  if (data.walls) {
    walls = data.walls.map(w => ({
      x: w.x,
      y: w.y,
      width: w.width,
      height: w.height
    }));
  }
  
  if (data.rooms) {
    rooms = data.rooms.map(r => ({
      name: r.name,
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      color: r.color || '#2a2a2a'
    }));
  }
  
  const progressBar = document.getElementById('trashProgress');
  progressBar.max = totalTrash;
  progressBar.value = collected;
  
  // Инициализируем пространственное разбиение
  initSpatialGrid();
  
  playerColor = getSelectedSkin();
  startGameLoop();
}

// Остальной код createTestLevel() без изменений...

function update() {
  if (levelCompleted) {
    player.vx = 0;
    player.vy = 0;
    return;
  }

  if (window.keys['b']) {
    window.keys['b'] = false;
    stopGame();
    showScreen('levelSelect');
    return;
  }

  handleInput();

  const oldX = player.x;
  const oldY = player.y;

  player.x += player.vx;
  player.y += player.vy;

  // Проверка коллизий со стенами
  const nearbyWalls = getNearbyWalls(player.x, player.y, player.width, player.height);
  let collided = false;

  for (const wall of nearbyWalls) {
    if (isColliding(player, wall)) {
      collided = true;
      break;
    }
  }

  if (collided) {
    player.x = oldX;
    player.y = oldY;
  }

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  // Сбор мусора
  for (const trash of trashList) {
    if (!trash.collected && isColliding(player, trash)) {
      trash.collected = true;
      collected++;
      document.getElementById('trashProgress').value = collected;

      if (window.playCollectSound) window.playCollectSound();
    }
  }

  // Проверка завершения уровня
  if (collected === totalTrash && totalTrash > 0 && !levelCompleted) {
    levelCompleted = true;

    // Начисление монет — только один раз за уровень
    if (window.hasLevelRewarded && window.markLevelAsRewarded && window.addCoins) {
      if (!hasLevelRewarded(currentLevel)) {
        addCoins(5);
        markLevelAsRewarded(currentLevel);
        console.log(`[монеты] +5 монет за уровень ${currentLevel}`);
      } else {
        console.log(`[монеты] уровень ${currentLevel} уже был учтён`);
      }
      updateCoinDisplay();
    }

    levelCompleteTime = Date.now();

    const currentUnlocked = parseInt(localStorage.getItem('maxLevelUnlocked')) || 1;
    if (currentLevel >= currentUnlocked) {
      localStorage.setItem('maxLevelUnlocked', String(currentLevel + 1));
    }

    if (window.playLevelCompleteSound) window.playLevelCompleteSound();

    const message = document.getElementById('levelCompleteMessage');
    const levelNumber = document.getElementById('completedLevelNumber');
    if (message && levelNumber) {
      levelNumber.textContent = currentLevel;
      message.style.display = 'block';
    }
  }
}

function getPlayerFillStyle(ctx, x, y, width, height, selected) {
  if (selected === 'rainbow-skin' || selected === 'rainbow') {
    const grad = ctx.createLinearGradient(x, y, x + width, y + height);
    grad.addColorStop(0, 'red');
    grad.addColorStop(0.2, 'orange');
    grad.addColorStop(0.4, 'yellow');
    grad.addColorStop(0.6, 'green');
    grad.addColorStop(0.8, 'blue');
    grad.addColorStop(1, 'purple');
    return grad;
  } else if (selected === 'linear-blue-pink' || selected === 'gradient1') {
    const grad = ctx.createLinearGradient(x, y, x + width, y);
    grad.addColorStop(0, '#2980b9');
    grad.addColorStop(1, '#ff00ff');
    return grad;
  } else if (selected === 'linear-green-yellow' || selected === 'gradient2') {
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, '#2ecc71');
    grad.addColorStop(1, '#f1c40f');
    return grad;
  } else if (selected === 'gradient3') {
    const grad = ctx.createLinearGradient(x, y, x + width, y + height);
    grad.addColorStop(0, '#fff700');
    grad.addColorStop(1, '#ff00ff');
    return grad;
  } else if (selected === 'glowwhite') {
    return '#ffffff';
  }

  return selected; // обычный hex-цвет
}




function draw() {
  // Очищаем только изменяющиеся области
  ctx.clearRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
  
  // Рисуем комнаты
  for (const room of rooms) {
    ctx.fillStyle = room.color;
    ctx.fillRect(room.x, room.y, room.width, room.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    const step = 8;
    for (let x = room.x; x < room.x + room.width; x += step) {
      for (let y = room.y; y < room.y + room.height; y += step) {
        if ((Math.floor((x - room.x) / step) + Math.floor((y - room.y) / step)) % 2 === 0) {
          ctx.fillRect(x, y, step / 2, step / 2);
        }
      }
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Press Start 2P", Arial';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, room.x + room.width / 2, room.y + 48);
  }
  
  // Рисуем стены
  ctx.fillStyle = '#8B4513';
  for (const wall of walls) {
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    
    ctx.fillStyle = '#A0522D';
    const brickSize = 8;
    for (let x = wall.x; x < wall.x + wall.width; x += brickSize) {
      for (let y = wall.y; y < wall.y + wall.height; y += brickSize) {
        if ((Math.floor((x - wall.x) / brickSize) + Math.floor((y - wall.y) / brickSize)) % 2 === 0) {
          ctx.fillRect(x, y, brickSize - 1, brickSize - 1);
        }
      }
    }
    ctx.fillStyle = '#8B4513';
  }
  
  // Рисуем только не собранный мусор
  for (const trash of trashList) {
    if (!trash.collected) {
      ctx.fillStyle = trash.type === 'paper' ? '#3498db' : 
                      trash.type === 'plastic' ? '#e74c3c' : 
                      trash.type === 'glass' ? '#2ecc71' : 
                      'gray';
      ctx.fillRect(trash.x, trash.y, trash.width, trash.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(trash.x + 4, trash.y + 4, 2, 2);
      ctx.fillRect(trash.x + 10, trash.y + 10, 2, 2);
      
      if (trash.type === 'paper') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(trash.x + 3, trash.y + 6 + i * 3, 10, 1);
        }
      }
    }
  }
  
  // Рисуем игрока
  // Рисуем игрока
  ctx.fillStyle = getPlayerFillStyle(ctx, player.x, player.y, player.width, player.height, playerColor || '#27ae60');
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  ctx.fillStyle = /^#/.test(playerColor) ? darkenColor(playerColor) : 'rgba(0,0,0,0.2)';
  ctx.fillRect(player.x, player.y, player.width, 2);
  ctx.fillRect(player.x, player.y, 2, player.height);
  
  ctx.fillStyle = '#000';
  ctx.fillRect(player.x + 3, player.y + 4, 3, 3);
  ctx.fillRect(player.x + 10, player.y + 4, 3, 3);
  
  ctx.fillRect(player.x + 4, player.y + 10, 8, 1);
  ctx.fillRect(player.x + 5, player.y + 11, 6, 1);
}

function darkenColor(hex, amount = 40) {
  const num = parseInt(hex.slice(1), 16);
  let r = Math.max(0, (num >> 16) - amount);
  let g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  let b = Math.max(0, (num & 0x0000FF) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}


function gameLoop(timestamp) {
  // Ограничение FPS до 60
  if (timestamp - lastTimestamp < 16) {
    animationId = requestAnimationFrame(gameLoop);
    return;
  }
  
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  update();
  draw();
  
  animationId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
  cancelAnimationFrame(animationId);
  lastTimestamp = 0;
  animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
  cancelAnimationFrame(animationId);
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

window.addEventListener('keydown', e => {
  window.keys[e.key] = true;
});

window.addEventListener('keyup', e => {
  window.keys[e.key] = false;
});

window.loadLevel = loadLevel;
window.playerColor = playerColor;
window.stopGame = stopGame;