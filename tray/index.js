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

  trayInstance.setToolTip('Music');

  trayInstance.on('click', onClickCallback);

  // in case click event is not working
  if (process.platform === 'linux') {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'show/hide',
        click: onClickCallback
      }
    ])
    trayInstance.setContextMenu(contextMenu);
  }
};

exports.showPlay = function () {
  setTrayImage(playImage);
};

exports.showPause = function () {
  setTrayImage(pauseImage);
};

exports.showConnecting = function () {
  setTrayImage(musicImage);
};

exports.destroy = function () {
  trayInstance.destroy();
};
