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

  player.metadata = {
    'mpris:trackid': player.objectPath('track/0'),
    'mpris:artUrl': `https://${state.cover.replace('%%', '300x300')}`,
    'xesam:title': state.title,
    'xesam:artist': state.artist
  };

  if (state.isPlaying) {
    player.playbackStatus = 'Playing';
  } else {
    player.playbackStatus = 'Paused';
  }
};
