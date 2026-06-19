import { H as Hls } from './hls-vendor.js';

var video = document.getElementById('movie-video');
var playButton = document.querySelector('[data-play]');
var hlsInstance = null;
var isReady = false;

function attachStream() {
  if (!video || isReady) {
    return;
  }

  var streamUrl = video.getAttribute('data-src');

  if (!streamUrl) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
    video.load();
    isReady = true;
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      isReady = true;
      video.play().catch(function () {});
    });
    hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
      if (!data || !data.fatal || !hlsInstance) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hlsInstance.recoverMediaError();
      } else {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }
}

function startPlayback() {
  if (!video) {
    return;
  }

  attachStream();
  video.controls = true;

  if (playButton) {
    playButton.classList.add('is-hidden');
  }

  video.play().catch(function () {});
}

if (playButton) {
  playButton.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', function () {
    if (!isReady) {
      startPlayback();
      return;
    }

    if (video.paused) {
      video.play().catch(function () {});
    } else {
      video.pause();
    }
  });
}

window.addEventListener('pagehide', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});
