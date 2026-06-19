(function () {
    'use strict';

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function setupLocalFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var list = scope.parentElement.querySelector('[data-card-list]');
            if (!list) {
                list = document.querySelector('[data-card-list]');
            }
            if (!list) {
                return;
            }
            var cards = selectAll('[data-card]', list);
            var input = scope.querySelector('[data-filter-input]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var count = scope.querySelector('[data-filter-count]');

            function update() {
                var query = normalize(input && input.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    card.classList.toggle('is-filtered-out', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 条，共 ' + cards.length + ' 条';
                }
            }

            [input, yearSelect, typeSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', update);
                    element.addEventListener('change', update);
                }
            });
            update();
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card" data-card>' +
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-mask"></span>' +
                    '<span class="score-pill">' + escapeHtml(movie.score) + '</span>' +
                    '<span class="play-pill">播放</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-meta">' +
                        '<span>' + escapeHtml(movie.year) + '</span>' +
                        '<span>' + escapeHtml(movie.region) + '</span>' +
                        '<span>' + escapeHtml(movie.type) + '</span>' +
                    '</div>' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.one_line) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var form = document.querySelector('[data-search-page-form]');
        if (!results || !summary || !form) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = form.querySelector('input[name="q"]');
        var select = form.querySelector('select[name="category"]');
        input.value = params.get('q') || '';
        select.value = params.get('category') || '';
        var movies = [];

        function render() {
            var query = normalize(input.value);
            var category = normalize(select.value);
            var filtered = movies.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.one_line,
                    (movie.tags || []).join(' ')
                ].join(' '));
                if (query && text.indexOf(query) === -1) {
                    return false;
                }
                if (category && normalize(movie.category) !== category) {
                    return false;
                }
                return true;
            }).slice(0, 300);

            summary.textContent = '找到 ' + filtered.length + ' 条匹配内容。为保证页面速度，搜索页最多展示前 300 条结果。';
            results.innerHTML = filtered.map(movieCard).join('');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var next = new URLSearchParams();
            if (input.value.trim()) {
                next.set('q', input.value.trim());
            }
            if (select.value) {
                next.set('category', select.value);
            }
            history.replaceState(null, '', 'search.html' + (next.toString() ? '?' + next.toString() : ''));
            render();
        });

        input.addEventListener('input', render);
        select.addEventListener('change', render);

        fetch('data/movies.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                movies = data.movies || [];
                render();
            })
            .catch(function () {
                summary.textContent = '片库读取失败，请从分类页或热播榜继续浏览。';
            });
    }

    function setupPlayers() {
        selectAll('[data-player]').forEach(function (box) {
            var video = box.querySelector('video');
            var trigger = box.querySelector('[data-player-trigger]');
            var note = box.querySelector('[data-player-note]');
            var src = box.getAttribute('data-src');
            var hls = null;
            if (!video || !trigger || !src) {
                return;
            }

            function loadAndPlay() {
                trigger.classList.add('is-hidden');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }

                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (note) {
                            note.textContent = '播放源已加载，请再次点击播放器开始播放。';
                        }
                    });
                }
                if (note) {
                    note.textContent = '播放加载中，可使用播放器控制栏暂停、音量和全屏。';
                }
            }

            trigger.addEventListener('click', loadAndPlay);
            video.addEventListener('play', function () {
                trigger.classList.add('is-hidden');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
