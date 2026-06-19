(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const mobileToggle = $('.mobile-toggle');
  const mobilePanel = $('.mobile-panel');
  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const layer = $('.search-layer');
  const globalInput = $('.global-search');
  const resultsBox = $('.search-results');
  const openButtons = $$('.search-open');
  const closeButton = $('.search-close');
  const movies = Array.isArray(window.SiteMovieList) ? window.SiteMovieList : [];

  function openSearch() {
    if (!layer) return;
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    if (globalInput) {
      globalInput.focus();
      renderSearch(globalInput.value.trim());
    }
  }

  function closeSearch() {
    if (!layer) return;
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
  }

  function renderSearch(query) {
    if (!resultsBox) return;
    const value = query.toLowerCase();
    const list = value
      ? movies.filter(function (item) {
          return [item.t, item.y, item.r, item.g, item.c].join(' ').toLowerCase().includes(value);
        }).slice(0, 16)
      : movies.slice(0, 10);

    resultsBox.innerHTML = list.map(function (item) {
      return '<a class="search-result" href="' + item.u + '">' +
        '<img src="' + item.i + '" alt="' + escapeText(item.t) + ' 封面" loading="lazy">' +
        '<span><strong>' + escapeText(item.t) + '</strong><span>' + escapeText(item.y + ' · ' + item.r + ' · ' + item.g) + '</span></span>' +
        '</a>';
    }).join('');
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  openButtons.forEach(function (button) {
    button.addEventListener('click', openSearch);
  });
  if (closeButton) closeButton.addEventListener('click', closeSearch);
  if (layer) {
    layer.addEventListener('click', function (event) {
      if (event.target === layer) closeSearch();
    });
  }
  if (globalInput) {
    globalInput.addEventListener('input', function () {
      renderSearch(globalInput.value.trim());
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeSearch();
  });

  const stage = $('[data-feature-stage]');
  if (stage) {
    const slides = $$('.feature-slide', stage);
    const dots = $$('[data-feature-dot]', stage);
    const prev = $('[data-feature-prev]', stage);
    const next = $('[data-feature-next]', stage);
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-feature-dot')) || 0);
        restart();
      });
    });
    restart();
  }

  $$('.row-shell').forEach(function (shell) {
    const row = $('[data-row-scroll]', shell);
    const left = $('.row-left', shell);
    const right = $('.row-right', shell);
    if (!row) return;
    if (left) {
      left.addEventListener('click', function () {
        row.scrollBy({ left: -520, behavior: 'smooth' });
      });
    }
    if (right) {
      right.addEventListener('click', function () {
        row.scrollBy({ left: 520, behavior: 'smooth' });
      });
    }
  });

  $$('.page-filter').forEach(function (input) {
    const area = input.closest('main').querySelector('[data-filter-area]');
    if (!area) return;
    const cards = $$('[data-card]', area);
    input.addEventListener('input', function () {
      const value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', value && !text.includes(value));
      });
    });
  });

  $$('.video-shell').forEach(function (shell) {
    const video = $('.movie-video', shell);
    const overlay = $('.video-overlay', shell);
    const play = shell.getAttribute('data-play');
    let ready = false;
    let hls = null;

    function loadVideo() {
      if (!video || !play || ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = play;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(play);
        hls.attachMedia(video);
      } else {
        video.src = play;
      }
    }

    function start() {
      loadVideo();
      shell.classList.add('is-playing');
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (overlay) overlay.addEventListener('click', start);
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) start();
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
      window.addEventListener('pagehide', function () {
        if (hls) hls.destroy();
      });
    }
  });
})();
