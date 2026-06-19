(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));

  filterBars.forEach(function (bar) {
    var scopeSelector = bar.getAttribute('data-filter-scope') || 'body';
    var scope = document.querySelector(scopeSelector) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
    var search = bar.querySelector('[data-filter-search]');
    var year = bar.querySelector('[data-filter-year]');
    var region = bar.querySelector('[data-filter-region]');
    var type = bar.querySelector('[data-filter-type]');
    var empty = scope.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-category'));
        var matchText = !q || text.indexOf(q) !== -1;
        var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
        var matchRegion = !r || normalize(card.getAttribute('data-region')) === r;
        var matchType = !t || normalize(card.getAttribute('data-type')) === t;
        var visible = matchText && matchYear && matchRegion && matchType;

        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visibleCount === 0);
      }
    }

    [search, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var qParam = params.get('q');
    if (qParam && search) {
      search.value = qParam;
      applyFilter();
    }
  });
})();
