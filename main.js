const electron = require('electron');
const {
  app,
  BrowserWindow,
  ipcMain
} = electron;

process.on('uncaughtException', (error) => {
  console.log(error);
});

const path = require('path');
const url = require('url');

const DEBUG = process.env.DEBUG || 0;

let mainWindow;
let windowHeight = 150;
let windowWidth = 300;
let tray;

const createWindow = function() {
  const { screen } = electron;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  if (DEBUG) {
    windowHeight = 600;
    windowWidth = 800;
  }

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: width - windowWidth,
    y: height - windowHeight,
    frame: false,
    backgroundColor: '#1a1a1a',
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // on linux alwaysOnTop in constructor didn't work for me
    mainWindow.setAlwaysOnTop(true);
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'renderer/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (DEBUG) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function handleClose() {
    mainWindow = null;
  });
};

const toggleWindowVisibility = function () {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();

      // on linux this properties may be eventually dropped
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setSkipTaskbar(true);
    }
  } else {
    createWindow();
  }
};

const changeWindowSize = function (newWidth, newHeight) {
  const { screen } = electron;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  windowWidth = newWidth;
  windowHeight = newHeight;

  if (mainWindow) {
    mainWindow.setSize(windowWidth, windowHeight);
    mainWindow.setPosition(width - windowWidth, height - windowHeight);
  }
};

app.on('ready', () => {
  tray = require('./tray'); // eslint-disable-line

  tray.init(toggleWindowVisibility);

  createWindow();

  const http = require('http');
  const fs = require('fs');

  let fileContent;

  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (fileContent) {
      res.end(fileContent);
    } else {
      fs.readFile('./extension/page-script.js', (error, file) => {
        if (error) {
          console.log(error);
          return;
        }

        fileContent = file;

        res.end(fileContent);
      });
    }
  });

  server.listen(3008, () => {
    console.log('listening 3008');
  });

  const io = require('socket.io')(); // eslint-disable-line
  let mpris;

  let clientSocket;

  const emitSocketEvent = function (event) {
    if (clientSocket) {
      clientSocket.emit(event);
    }
  };

  if (process.platform === 'linux') {
    mpris = require('./mpris');
    mpris.init(emitSocketEvent);
  }

  io.on('connection', (client) => {
    clientSocket = client;

    clientSocket
      .on('status', (status) => {
        mainWindow.webContents.once('dom-ready', () => {
          mainWindow.send('status', status);
        });
        mainWindow.send('status', status);

        if (mpris) {
          mpris.setState(Object.assign({}, status, {
            duration: Math.floor(status.duration * 1000 * 1000)
          }));
        }

        if (status.isPlaying) {
          tray.showPlay();
        } else {
          tray.showPause();
        }
      })
      .on('seeked', (seekedSeconds) => {
        if (mpris) {
          mpris.seeked(Math.floor(seekedSeconds * 1000 * 1000));
        }
      })
  });

  io.set('origins', '*:*');

  io.listen(3007);

  ipcMain
    .on('play', function playFromRenderer() {
      emitSocketEvent('play');
    })
    .on('pause', function pauseFromRenderer() {
      emitSocketEvent('pause');
    })
    .on('prev', () => {
      emitSocketEvent('prev');
    })
    .on('next', () => {
      emitSocketEvent('next');
    })
    .on('switch-view', () => {
      if (windowWidth > 200) {
        changeWindowSize(150, 50);
      } else {
        changeWindowSize(300, 150);
      }
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function handleAllClosed() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    tray.destroy();

    app.quit();
  }
});

app.on('activate', function handleActivate() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
