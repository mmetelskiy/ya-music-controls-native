const _ = require('lodash');
const Player = require('mpris-service');

let player;
let state;

exports.init = function (emitSocketEvent) {
  const pause = _.debounce(function () {
    emitSocketEvent('pause');
  }, 200, {
    leading: true,
    trailing: false
  });

  const play = _.debounce(function () {
    emitSocketEvent('play');
  }, 200, {
    leading: true,
    trailing: false
  });

  player = new Player({
    name: 'yandex-music-player',
    supportedInterfaces: ['player']
  });

  player.on('play', () => {
    play();
  });

  player.on('pause', () => {
    pause();
  });

  player.on('playpause', () => {
    if (state && state.isPlaying) {
      pause();
    } else {
      play();
    }
  });

  player.on('previous', () => {
    emitSocketEvent('prev');
  });

  player.on('next', () => {
    emitSocketEvent('next');
  });
};

exports.setState = function (newState) {
  state = newState;

  if (!player) {
    return;
  }

  // console.log('duration', state.duration);

  player.metadata = {
    'mpris:trackid': player.objectPath('track/0'),
    'mpris:artUrl': `https://${state.cover.replace('%%', '300x300')}`,
    'mpris:length': state.duration,
    'xesam:title': state.title,
    'xesam:artist': state.artist
  };

  if (state.isPlaying) {
    player.playbackStatus = 'Playing';
  } else {
    player.playbackStatus = 'Paused';
  }
};

exports.seeked = function (offset) {
  if (player) {
    // issues with node-dbus. Not working properly with datatypes
    // see:
    //    https://github.com/emersion/mpris-service/issues/1
    //    https://github.com/Shouqun/node-dbus/issues/173
    //    https://github.com/Shouqun/node-dbus/issues/143
    // player.seeked(offset);
  }
};
