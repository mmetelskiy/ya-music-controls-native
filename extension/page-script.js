(function () {
  const api = window.externalAPI;

  const getStatus = function () {
    const track = api.getCurrentTrack();
    const isPlaying = api.isPlaying();

    let status;

    if (track) {
      status = {
        cover: track.cover,
        title: track.title,
        isPlaying: isPlaying,
        duration: track.duration,
        artist: [].map.call(track.artists, (artist) => artist.title).join(', ')
      };
    } else {
      status = {
        cover: '',
        title: '',
        isPlaying: isPlaying,
        duration: 0,
        artist: ''
      };
    }

    return status;
  };

  let lastTimeProgressSent;
  const progressThrottleTime = 1000;

  const sendProgress = function () {
    if (!lastTimeProgressSent || Date.now() - lastTimeProgressSent > progressThrottleTime) {
      const progress = api.getProgress();

      window.dispatchEvent(new CustomEvent('music:seeked', {
        detail: {
          position: progress.position,
          loaded: progress.loaded,
          duration: progress.duration
        }
      }));

      lastTimeProgressSent = Date.now();
    }
  };

  const sendPlayerStatus = function () {
    const status = getStatus();

    window.dispatchEvent(new CustomEvent('music:status', {
      detail: status
    }));
  };

  const sendFullStatus = function () {
    sendPlayerStatus();
    sendProgress();
  };

  window.addEventListener('music:getStatus', sendFullStatus);

  api.on(api.EVENT_STATE, sendPlayerStatus);
  api.on(api.EVENT_TRACK, sendPlayerStatus);
  api.on(api.EVENT_PROGRESS, sendProgress);

  window.addEventListener('music:play', () => {
    const isPlaying = api.isPlaying();

    if (!isPlaying) {
      api.togglePause();
    }
  });

  window.addEventListener('music:pause', () => {
    const isPlaying = api.isPlaying();

    if (isPlaying) {
      api.togglePause();
    }
  });

  window.addEventListener('music:prev', () => {
    api.prev();
  });

  window.addEventListener('music:to-beginning', () => {
    api.setPosition(0);
  });

  window.addEventListener('music:next', () => {
    api.next();
  });
})();
