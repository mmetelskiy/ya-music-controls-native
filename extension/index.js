const socket = io('http://localhost:3007', {
  transports: ['polling'],
  timeout: 30000
});

const getStatus = function () {
  const api = window.wrappedJSObject.externalAPI;
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

socket.on('connect', () => {
  const status = getStatus();

  socket.emit('status', status);
});
