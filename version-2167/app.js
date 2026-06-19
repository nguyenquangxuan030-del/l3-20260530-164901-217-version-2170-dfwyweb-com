
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const menuToggle = $('[data-menu-toggle]');
  const siteNav = $('[data-site-nav]');
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      siteNav.classList.toggle('open');
    });
  }

  function bindFilters(root = document) {
    const input = $('[data-filter-input]', root);
    const reset = $('[data-filter-reset]', root);
    const grid = $('[data-filter-grid]', root);
    if (!input || !grid) return;
    const cards = $$('[data-title]', grid);
    const apply = () => {
      const q = (input.value || '').trim().toLowerCase();
      cards.forEach(card => {
        const hay = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.year]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        card.style.display = !q || hay.includes(q) ? '' : 'none';
      });
    };
    input.addEventListener('input', apply);
    if (reset) reset.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
  }

  bindFilters();

  // Hero carousel
  const hero = document.querySelector('.hero-shell');
  if (hero) {
    const slides = $$('[data-slide]', hero);
    const dots = $$('[data-slide-to]', hero);
    let idx = 0;
    const show = (next) => {
      idx = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === idx));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    };
    dots.forEach((dot) => dot.addEventListener('click', () => show(Number(dot.dataset.slideTo || 0))));
    if (slides.length > 1) {
      setInterval(() => show(idx + 1), 5000);
    }
  }

  function loadHlsLib() {
    if (window.Hls) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  function initPlayer() {
    const shell = document.querySelector('[data-player-shell]');
    if (!shell) return;
    const video = $('[data-movie-video]', shell);
    const button = $('[data-play-button]', shell);
    const url = shell.dataset.streamUrl;
    if (!video || !button || !url) return;

    let loaded = false;
    let hls = null;

    const loadSource = () => {
      if (loaded) return;
      loaded = true;
      const nativeHls = video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl');
      if (nativeHls) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    };

    const startPlay = () => {
      loadSource();
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
      button.classList.add('is-playing');
      button.textContent = '正在播放';
    };

    button.addEventListener('click', startPlay);
    video.addEventListener('click', startPlay);
    video.addEventListener('play', () => {
      button.classList.add('is-playing');
      button.textContent = '正在播放';
    });
    loadSource();
  }

  loadHlsLib().finally(() => initPlayer());
})();
