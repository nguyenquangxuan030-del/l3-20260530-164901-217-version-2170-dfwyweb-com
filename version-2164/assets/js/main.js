(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var filterInput = document.querySelector('[data-filter-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var filterList = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');
    var activeCategory = 'all';

    var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    var applyFilters = function () {
        if (!filterList) {
            return;
        }
        var query = normalize(filterInput ? filterInput.value : '');
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var category = card.getAttribute('data-category') || '';
            var categoryMatch = activeCategory === 'all' || category === activeCategory;
            var queryMatch = !query || text.indexOf(query) !== -1;
            var shouldShow = categoryMatch && queryMatch;

            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    };

    if (filterInput) {
        filterInput.value = initialQuery;
        filterInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeCategory = button.getAttribute('data-filter-value') || 'all';
            filterButtons.forEach(function (candidate) {
                candidate.classList.toggle('is-active', candidate === button);
            });
            applyFilters();
        });
    });

    applyFilters();

    var startPlayer = function (player) {
        if (!player) {
            return;
        }

        var video = player.querySelector('video');
        var status = player.querySelector('[data-player-status]');
        var stream = player.getAttribute('data-stream');
        var poster = player.getAttribute('data-poster');

        if (!video || !stream) {
            if (status) {
                status.textContent = '播放暂不可用，请稍后重试';
            }
            return;
        }

        if (poster && !video.getAttribute('poster')) {
            video.setAttribute('poster', poster);
        }

        var playVideo = function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (status) {
                        status.textContent = '点击播放';
                    }
                });
            }
        };

        if (player.getAttribute('data-ready') === '1') {
            playVideo();
            return;
        }

        player.setAttribute('data-ready', '1');
        player.classList.add('is-playing');
        if (status) {
            status.textContent = '正在缓冲...';
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && status) {
                    status.textContent = '播放暂不可用，请稍后重试';
                    player.classList.remove('is-playing');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
        } else {
            video.src = stream;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
        }
    };

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var shell = player.querySelector('.video-shell');
        var button = player.querySelector('.play-button');

        if (shell) {
            shell.addEventListener('click', function () {
                startPlayer(player);
            });
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer(player);
            });
        }
    });
})();
