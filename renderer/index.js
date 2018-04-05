const { ipcRenderer } = require('electron');

let playerState = {
  cover: '',
  title: '',
  artist: '',
  isPlaying: false
};

const playButton = document.getElementById('play-pause'); // eslint-disable-line
const prevButton = document.getElementById('prev'); // eslint-disable-line
const nextButton = document.getElementById('next'); // eslint-disable-line
const coverElement = document.getElementById('cover'); // eslint-disable-line
const titleElement = document.getElementById('title'); // eslint-disable-line
const artistElement = document.getElementById('artist'); // eslint-disable-line
const toggleView = document.getElementById('toggle-view'); // eslint-disable-line
const minimizeButton = document.getElementById('minimize-to-tray'); // eslint-disable-line

const setPlaying = function () {
  playButton.classList.remove('pause');
};
const setPaused = function () {
  playButton.classList.add('pause');
};

const toShowOrNotToShowTrack = function (newState) {
  return playerState.title !== newState.title ||
    playerState.artist !== newState.artist ||
    !playerState.isPlaying && newState.isPlaying;
};

const setPlayerState = function (newState) {
  const animate = toShowOrNotToShowTrack(newState);

  playerState = newState;

  titleElement.textContent = playerState.title;
  artistElement.textContent = playerState.artist;
  coverElement.src = `https://${playerState.cover.replace('%%', '50x50')}`;

  if (playerState.isPlaying) {
    setPaused();
  } else {
    setPlaying();
  }

  if (animate) {
    document.body.classList.remove('animate-new-song');
    setTimeout(() => {
      document.body.classList.add('animate-new-song');
    }, 100);
  }
};

playButton.addEventListener('click', function togglePlay() {
  if (playerState.isPlaying) {
    ipcRenderer.send('pause');
  } else {
    ipcRenderer.send('play');
  }
});
prevButton.addEventListener('click', function playPrev() {
  ipcRenderer.send('prev');
});
nextButton.addEventListener('click', function playNext() {
  ipcRenderer.send('next');
});

minimizeButton.addEventListener('click', function minimizeToTray() {
  ipcRenderer.send('hide');
});
toggleView.addEventListener('click', function toggleView() {
  ipcRenderer.send('switch-view');
});

ipcRenderer.on('status', (event, status) => {
  console.log(status);

  setPlayerState(status);
});

setTimeout(() => {
  ipcRenderer.send('compact-view');
}, 1000);
