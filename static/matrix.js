/* Original offline Canvas animation inspired by digital-rain sketches.
   Each column has its own position and speed; glyphs are chosen anew as it falls. */
(() => {
  const canvas = document.querySelector('#matrix-rain');
  const identity = document.querySelector('#matrix-identity');
  const context = canvas.getContext('2d');
  const glyphs = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let columns = [];
  let width = 0;
  let height = 0;
  let fontSize = 19;
  let frame = 0;
  let active = false;
  let lastDraw = 0;
  let cycleStart = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = '#020a08';
    context.fillRect(0, 0, width, height);
    fontSize = Math.max(15, Math.min(22, Math.round(width / 95)));
    columns = Array.from({length: Math.ceil(width / fontSize)}, () => ({
      y: -Math.random() * height,
      speed: 0.75 + Math.random() * 1.75,
      brightness: 0.35 + Math.random() * 0.55,
    }));
  }

  function draw(now) {
    if (!active) return;
    frame = requestAnimationFrame(draw);
    if (now - lastDraw < 42) return;
    lastDraw = now;
    context.fillStyle = 'rgba(2, 10, 8, 0.13)';
    context.fillRect(0, 0, width, height);
    context.font = `bold ${fontSize}px ui-monospace, Menlo, Consolas, monospace`;
    context.textBaseline = 'top';
    columns.forEach((column, index) => {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      context.fillStyle = `rgba(105, 238, 160, ${column.brightness})`;
      context.fillText(glyph, index * fontSize, column.y);
      if (Math.random() < 0.2) {
        context.fillStyle = 'rgba(205, 255, 223, 0.9)';
        context.fillText(glyph, index * fontSize, column.y);
      }
      column.y += fontSize * column.speed;
      if (column.y > height + fontSize * 5) {
        column.y = -Math.random() * height * 0.5 - fontSize;
        column.speed = 0.75 + Math.random() * 1.75;
      }
    });
    // Five seconds of rain, five seconds with the readable name, repeat.
    identity.classList.toggle('visible', Math.floor((now - cycleStart) / 5000) % 2 === 1);
  }

  function start() {
    if (active) return;
    active = true;
    resize();
    cycleStart = performance.now();
    if (reduceMotion.matches || !context) {
      identity.classList.add('visible');
      active = false;
      return;
    }
    frame = requestAnimationFrame(draw);
  }

  function stop() {
    active = false;
    cancelAnimationFrame(frame);
    identity.classList.remove('visible');
  }

  window.addEventListener('resize', () => { if (active) resize(); });
  window.MatrixIntro = {start, stop};
})();
