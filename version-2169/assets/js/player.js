(function () {
  function readConfig() {
    var node = document.getElementById('play-config');
    if (!node) {
      return null;
    }

    try {
      return JSON.parse(node.textContent || '{}');
    } catch (error) {
      return null;
    }
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + url + '"]');

      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function startPlayback(video, streamUrl) {
    if (!video || !streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== streamUrl) {
        video.src = streamUrl;
      }
      video.play().catch(function () {});
      return;
    }

    function attachHls() {
      if (!window.Hls || !window.Hls.isSupported()) {
        return;
      }

      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    }

    if (window.Hls) {
      attachHls();
    } else {
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js').then(attachHls).catch(function () {});
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var config = readConfig();
    var video = document.getElementById('movie-video');
    var button = document.getElementById('play-button');

    if (!config || !video || !button) {
      return;
    }

    var streamUrl = config.stream;

    button.addEventListener('click', function () {
      button.classList.add('hidden');
      startPlayback(video, streamUrl);
    });

    video.addEventListener('play', function () {
      button.classList.add('hidden');
    });
  });
})();
