(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var searchInput = filterForm.querySelector('[data-local-search]');
    var yearFilter = filterForm.querySelector('[data-year-filter]');
    var categoryFilter = filterForm.querySelector('[data-category-filter]');
    var typeFilter = filterForm.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function matches(card, term, year, category, type) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-category') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      var termOk = !term || haystack.indexOf(term) !== -1;
      var yearOk = !year || (card.getAttribute('data-year') || '') === year;
      var categoryOk = !category || (card.getAttribute('data-category') || '') === category;
      var typeOk = !type || (card.getAttribute('data-type') || '') === type;

      return termOk && yearOk && categoryOk && typeOk;
    }

    function applyFilters() {
      var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var category = categoryFilter ? categoryFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var show = matches(card, term, year, category, type);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    }

    filterForm.addEventListener('input', applyFilters);
    filterForm.addEventListener('change', applyFilters);
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });

    applyFilters();
  }
})();
