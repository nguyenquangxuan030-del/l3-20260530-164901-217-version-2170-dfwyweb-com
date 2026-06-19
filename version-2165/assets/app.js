(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      button.setAttribute("aria-expanded", panel.classList.contains("open") ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var input = root.querySelector("[data-page-search]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-search-item]"));
    var empty = root.querySelector("[data-empty-state]");
    var chips = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
    var activeFilter = "all";

    function apply() {
      var query = normalize(input ? input.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var type = normalize(card.getAttribute("data-type"));
        var region = normalize(card.getAttribute("data-region"));
        var category = normalize(card.getAttribute("data-category"));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || type === activeFilter || region === activeFilter || category === activeFilter;
        var show = matchesQuery && matchesFilter;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = normalize(chip.getAttribute("data-filter-value"));
        apply();
      });
    });

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", apply);
    }
    apply();
  }

  var hlsLoading = false;
  var hlsCallbacks = [];

  function withHls(callback, failure) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    script.async = true;
    script.onload = function () {
      hlsLoading = false;
      var callbacks = hlsCallbacks.slice();
      hlsCallbacks = [];
      callbacks.forEach(function (item) {
        item(window.Hls);
      });
    };
    script.onerror = function () {
      hlsLoading = false;
      hlsCallbacks = [];
      if (failure) {
        failure();
      }
    };
    document.head.appendChild(script);
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var status = box.querySelector("[data-player-status]");
      var muteButton = box.querySelector("[data-mute-button]");
      var fullButton = box.querySelector("[data-fullscreen-button]");
      var src = box.getAttribute("data-src");
      var initialized = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function attachSource() {
        if (initialized || !video || !src) {
          return;
        }
        initialized = true;
        setStatus("视频加载中");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          setStatus("点击播放");
          return;
        }
        withHls(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              setStatus("点击播放");
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus("视频加载失败，请稍后重试");
              }
            });
          } else {
            setStatus("当前浏览器暂不支持播放");
          }
        }, function () {
          setStatus("播放器组件加载失败");
        });
      }

      function togglePlay() {
        attachSource();
        if (!video) {
          return;
        }
        var action = video.paused ? video.play() : (video.pause(), null);
        if (action && action.catch) {
          action.catch(function () {
            setStatus("请再次点击播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          togglePlay();
        });
      }

      box.addEventListener("click", function (event) {
        if (event.target.closest("button")) {
          return;
        }
        togglePlay();
      });

      if (video) {
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
          setStatus("正在播放");
        });
        video.addEventListener("pause", function () {
          box.classList.remove("is-playing");
          setStatus("已暂停");
        });
        video.addEventListener("ended", function () {
          box.classList.remove("is-playing");
          setStatus("播放结束");
        });
      }

      if (muteButton && video) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      if (fullButton) {
        fullButton.addEventListener("click", function () {
          var target = box;
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (target.requestFullscreen) {
            target.requestFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initImages();
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
