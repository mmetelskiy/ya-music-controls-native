const { ipcRenderer } = require('electron');

let state = {
  playing: false
};

const playButton = document.getElementById('play-pause');

const setPlaying = function () {
  state.playing = true;
  playButton.classList.remove('pause');
};
const setPaused = function () {
  state.playing = false;
  playButton.classList.add('pause');
};

playButton.addEventListener('click', function () {
  if (state.playing) {
    ipcRenderer.send('pause');
    setPaused();
  } else {
    ipcRenderer.send('play');
    setPlaying();
  }
});
