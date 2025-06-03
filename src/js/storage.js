// Версия локального хранилища
const CURRENT_STORAGE_VERSION = 1;

(function initStorageVersioning() {
  const version = parseInt(localStorage.getItem('storageVersion') || '0');

  if (version < 1) {
    if (!localStorage.getItem('coins')) localStorage.setItem('coins', '0');
    if (!localStorage.getItem('purchasedSkins')) localStorage.setItem('purchasedSkins', '[]');
    if (!localStorage.getItem('rewardedLevels')) localStorage.setItem('rewardedLevels', '[]');
    if (!localStorage.getItem('selectedSkin')) localStorage.setItem('selectedSkin', '#27ae60');
    if (!localStorage.getItem('maxLevelUnlocked')) localStorage.setItem('maxLevelUnlocked', '1');
  }

  // Обновляем версию после инициализации
  localStorage.setItem('storageVersion', String(CURRENT_STORAGE_VERSION));
})();

// --- Работа с монетами ---
function getCoins() {
  const value = localStorage.getItem('coins');
  return value !== null ? parseInt(value, 10) : 0;
}

function setCoins(value) {
  localStorage.setItem('coins', String(value));
}

function addCoins(amount) {
  const current = getCoins();
  setCoins(current + amount);
}

window.getCoins = getCoins;
window.setCoins = setCoins;
window.addCoins = addCoins;

// --- Награды за уровень ---
function hasLevelRewarded(level) {
  const data = localStorage.getItem('rewardedLevels');
  if (!data) return false;
  const list = JSON.parse(data);
  return list.includes(level);
}

function markLevelAsRewarded(level) {
  let list = [];
  const data = localStorage.getItem('rewardedLevels');
  if (data) {
    try {
      list = JSON.parse(data);
    } catch (e) {
      list = [];
    }
  }
  if (!list.includes(level)) {
    list.push(level);
    localStorage.setItem('rewardedLevels', JSON.stringify(list));
  }
}

window.hasLevelRewarded = hasLevelRewarded;
window.markLevelAsRewarded = markLevelAsRewarded;

// --- Скины ---
function getPurchasedSkins() {
  const data = localStorage.getItem('purchasedSkins');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function hasPurchasedSkin(color) {
  return getPurchasedSkins().includes(color);
}

function purchaseSkin(color) {
  const current = getPurchasedSkins();
  if (!current.includes(color)) {
    current.push(color);
    localStorage.setItem('purchasedSkins', JSON.stringify(current));
  }
}

function getSelectedSkin() {
  return localStorage.getItem('selectedSkin') || '#27ae60';
}

function setSelectedSkin(color) {
  localStorage.setItem('selectedSkin', color);
}

window.getPurchasedSkins = getPurchasedSkins;
window.purchaseSkin = purchaseSkin;
window.hasPurchasedSkin = hasPurchasedSkin;
window.getSelectedSkin = getSelectedSkin;
window.setSelectedSkin = setSelectedSkin;
