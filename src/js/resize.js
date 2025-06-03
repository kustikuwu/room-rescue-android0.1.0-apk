function resizeCanvasToFit() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  const baseWidth = 800;
  const baseHeight = 600;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const scale = Math.min(
    screenWidth / baseWidth,
    screenHeight / baseHeight
  );

  canvas.style.width = baseWidth * scale + 'px';
  canvas.style.height = baseHeight * scale + 'px';
  canvas.style.position = 'absolute';
  canvas.style.left = ((screenWidth - baseWidth * scale) / 2) + 'px';
  canvas.style.top = ((screenHeight - baseHeight * scale) / 2) + 'px';
}

window.addEventListener('resize', resizeCanvasToFit);
window.addEventListener('orientationchange', resizeCanvasToFit);
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvasToFit();

  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.width = 800;
    canvas.height = 600;
  }
});
