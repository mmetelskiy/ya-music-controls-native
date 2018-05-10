const { ipcRenderer } = require('electron');

let playerState = {
  cover: '',
  title: '',
  artist: '',
  isPlaying: false
};
let currentPosition = 0;

const playButton = document.getElementById('play-pause'); // eslint-disable-line
const prevButton = document.getElementById('prev'); // eslint-disable-line
const nextButton = document.getElementById('next'); // eslint-disable-line
const coverElement = document.getElementById('cover'); // eslint-disable-line
const titleElement = document.getElementById('title'); // eslint-disable-line
const artistElement = document.getElementById('artist'); // eslint-disable-line
const toggleView = document.getElementById('toggle-view'); // eslint-disable-line
const minimizeButton = document.getElementById('minimize-to-tray'); // eslint-disable-line
const progressLoaded = document.getElementById('loaded'); // eslint-disable-line
const progressPosition = document.getElementById('progress'); // eslint-disable-line

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

const updateProgress = function (progress) {
  const loaded = progress.loaded || 0;
  const position = progress.position || 0;
  const duration = progress.duration;

  currentPosition = position;

  if (duration) {
    progressLoaded.style.width = `${loaded / duration * 100}%`;
    progressPosition.style.width = `${position / duration * 100}%`;
  } else {
    progressLoaded.style.width = 0;
    progressPosition.style.width = 0;
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
  if (currentPosition < 5) {
    ipcRenderer.send('prev');
  } else {
    ipcRenderer.send('to-beginning');
  }
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

ipcRenderer
  .on('status', (event, status) => {
    setPlayerState(status);
  })
  .on('seeked', (event, progress) => {
    updateProgress(progress);
  });
