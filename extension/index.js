const socket = io('http://localhost:3007', { // eslint-disable-line
  transports: ['polling'],
  timeout: 30000
});
const api = window.wrappedJSObject.externalAPI; // eslint-disable-line

const getStatus = function () {
  const track = api.getCurrentTrack();
  const isPlaying = api.isPlaying();

  let status;

  if (track) {
    status = {
      cover: track.cover,
      title: track.title,
      isPlaying: isPlaying,
      artist: [].map.call(track.artists, (artist) => artist.title).join(', ')
    };
  } else {
    status = {
      cover: '',
      title: '',
      isPlaying: isPlaying,
      artist: ''
    };
  }

  return status;
};

const sendStatus = function () {
  const status = getStatus();

  socket.emit('status', status);
};

const subscribeForTrackChanges = function () {
  const observer = new MutationObserver((mutations) => {
    if (mutations[0].attributeName === 'data-unity-state') {
      sendStatus();
    }
  });

  observer.observe(document.body, {
    attributes: true
  });
};

socket
  .once('connect', () => {
    subscribeForTrackChanges();
  })
  .on('connect', () => {
    sendStatus();
  })
  .on('play', () => {
    const isPlaying = api.isPlaying();

    if (!isPlaying) {
      api.togglePause();
    }
  })
  .on('pause', () => {
    const isPlaying = api.isPlaying();

    if (isPlaying) {
      api.togglePause();
    }
  })
  .on('prev', () => {
    api.prev();
  })
  .on('next', () => {
    api.next();
  });
