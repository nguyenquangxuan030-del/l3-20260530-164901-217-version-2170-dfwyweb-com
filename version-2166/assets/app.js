(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('active');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('.hero-slide', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initLocalFilters() {
    var filter = document.querySelector('.local-filter');
    var year = document.querySelector('.filter-year');
    var cards = selectAll('.movie-card');
    if (!cards.length || (!filter && !year)) {
      return;
    }

    function apply() {
      var query = filter ? filter.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var cardYear = Number(card.getAttribute('data-year') || '0');
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesYear = true;
        if (yearValue === 'older') {
          matchesYear = cardYear > 0 && cardYear <= 2021;
        } else if (yearValue) {
          matchesYear = String(cardYear) === yearValue;
        }
        card.style.display = matchesText && matchesYear ? '' : 'none';
      });
    }

    if (filter) {
      filter.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function initGlobalSearch() {
    var modal = document.querySelector('[data-search-modal]');
    var input = document.getElementById('globalSearchInput');
    var results = document.getElementById('globalSearchResults');
    var openButtons = selectAll('[data-open-search]');
    var closeButton = document.querySelector('[data-close-search]');
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!modal || !input || !results) {
      return;
    }

    function openSearch() {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      window.setTimeout(function () {
        input.focus();
      }, 30);
    }

    function closeSearch() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }

    function getAssetPrefix() {
      var stylesheet = document.querySelector('link[rel="stylesheet"]');
      if (!stylesheet) {
        return '';
      }
      return stylesheet.getAttribute('href').replace('assets/style.css', '');
    }

    function render(items) {
      var prefix = getAssetPrefix();
      if (!items.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配结果</div>';
        return;
      }
      results.innerHTML = items.slice(0, 30).map(function (item) {
        var itemUrl = prefix + item.url;
        var itemCover = prefix + item.cover;
        return [
          '<a class="search-result-item" href="' + itemUrl + '">',
          '  <img src="' + itemCover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
          '  <span>',
          '    <strong>' + item.title + '</strong>',
          '    <span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>',
          '  </span>',
          '</a>'
        ].join('');
      }).join('');
    }

    function search() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        render(data.slice(0, 12));
        return;
      }
      var tokens = query.split(/\s+/).filter(Boolean);
      var matches = data.filter(function (item) {
        var haystack = item.search.toLowerCase();
        return tokens.every(function (token) {
          return haystack.indexOf(token) !== -1;
        });
      });
      render(matches);
    }

    openButtons.forEach(function (button) {
      button.addEventListener('click', openSearch);
    });
    if (closeButton) {
      closeButton.addEventListener('click', closeSearch);
    }
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        closeSearch();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeSearch();
      }
    });
    input.addEventListener('input', search);
    render(data.slice(0, 12));
  }

  function initPlayer() {
    var button = document.querySelector('[data-play-video]');
    var video = document.getElementById('moviePlayer');
    var message = document.querySelector('[data-player-message]');
    if (!button || !video) {
      return;
    }
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function playVideo() {
      var src = video.getAttribute('data-src');
      if (!src) {
        setMessage('当前影片未提供播放源。');
        return;
      }
      if (!initialized) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = src;
          video.play().catch(function () {});
        }
        initialized = true;
      } else {
        video.play().catch(function () {});
      }
      button.classList.add('hidden');
      setMessage('正在播放：播放器已绑定 m3u8 播放源。');
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('hidden');
      }
    });
  }

  function initImageFallback() {
    selectAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initLocalFilters();
    initGlobalSearch();
    initPlayer();
    initImageFallback();
  });
})();
