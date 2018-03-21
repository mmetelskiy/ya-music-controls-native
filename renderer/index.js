const { ipcRenderer } = require('electron');

let state = {
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

const setPlaying = function () {
  playButton.classList.remove('pause');
};
const setPaused = function () {
  playButton.classList.add('pause');
};

const setState = function (newState) {
  state = newState;

  titleElement.textContent = state.title;
  artistElement.textContent = state.artist;
  coverElement.src = `https://${state.cover.replace('%%', '50x50')}`;

  if (state.isPlaying) {
    setPaused();
  } else {
    setPlaying();
  }
};

playButton.addEventListener('click', function togglePlay() {
  if (state.isPlaying) {
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

ipcRenderer.on('status', (event, status) => {
  console.log(status);

  setState(status);
});
