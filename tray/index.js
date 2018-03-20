const path = require('path');
const {
  Tray,
  Menu,
  nativeImage
} = require('electron');

const musicImage = nativeImage.createFromPath(path.join(__dirname, 'img/logo.png'));
const playImage = nativeImage.createFromPath(path.join(__dirname, 'img/play.png'));
const pauseImage = nativeImage.createFromPath(path.join(__dirname, 'img/pause.png'));

let trayInstance;

const setTrayImage = function (image) {
  if (trayInstance) {
    trayInstance.setImage(image);
  }
};

exports.init = function (onClickCallback) {
  trayInstance = new Tray(musicImage);

  trayInstance.on('click', onClickCallback);
};

exports.showPlay = function () {
  setTrayImage(playImage);
};

exports.showPause = function () {
  setImage(pauseImage);
};

exports.showConnecting = function () {
  setImage(musicImage);
};
