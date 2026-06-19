(function() {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function bindMobileMenu() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  function bindHero() {
    var root = $('[data-hero]');
    if (!root) return;
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    if (!slides.length) return;
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
      });
    });
    setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  function bindHeaderSearch() {
    var input = $('#site-search');
    var box = $('#search-results');
    if (!input || !box || !window.MOVIE_INDEX) return;
    function render(items) {
      if (!items.length) {
        box.classList.remove('is-open');
        box.innerHTML = '';
        return;
      }
      box.innerHTML = items.slice(0, 10).map(function(item) {
        return '<a href="' + relativeUrl(item.url) + '"><img src="' + relativeUrl(item.image) + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span></a>';
      }).join('');
      box.classList.add('is-open');
    }
    input.addEventListener('input', function() {
      var q = normalize(input.value);
      if (!q) {
        render([]);
        return;
      }
      var items = window.MOVIE_INDEX.filter(function(item) {
        return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.genre + ' ' + item.category + ' ' + item.tags).indexOf(q) !== -1;
      });
      render(items);
    });
    document.addEventListener('click', function(event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove('is-open');
      }
    });
  }

  function relativeUrl(url) {
    var depth = location.pathname.split('/').filter(Boolean).length - 1;
    var prefix = depth > 0 ? '../'.repeat(depth) : './';
    return prefix + url.replace(/^\.\//, '');
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function(ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function bindPageFilter() {
    var input = $('[data-page-filter]');
    var area = $('[data-filter-area]');
    if (!input || !area) return;
    var cards = $all('[data-filter-card]', area);
    input.addEventListener('input', function() {
      var q = normalize(input.value);
      cards.forEach(function(card) {
        var text = normalize((card.dataset.title || '') + ' ' + (card.dataset.genre || '') + ' ' + (card.dataset.tags || '') + ' ' + (card.dataset.year || ''));
        card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
      });
    });
  }

  window.setupPlayer = function(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !url) return;
    var frame = video.closest('[data-player-frame]');
    var ready = false;
    var hlsInstance = null;
    function load() {
      if (ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    function play() {
      load();
      if (frame) frame.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {});
      }
    }
    button.addEventListener('click', play);
    video.addEventListener('click', function() {
      if (video.paused) play();
    });
    video.addEventListener('play', function() {
      if (frame) frame.classList.add('is-playing');
    });
    video.addEventListener('pause', function() {
      if (video.currentTime === 0 && frame) frame.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function() {
      if (hlsInstance) hlsInstance.destroy();
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    bindMobileMenu();
    bindHero();
    bindHeaderSearch();
    bindPageFilter();
  });
})();
