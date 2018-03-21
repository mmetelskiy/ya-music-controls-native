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

const DEBUG = false;

let mainWindow;
let tray;

const createWindow = function() {
  const { screen } = electron;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  let windowHeight = 150;
  let windowWidth = 300;

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
  console.log('click');
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

app.on('ready', () => {
  tray = require('./tray'); // eslint-disable-line

  tray.init(toggleWindowVisibility);

  createWindow();

  const io = require('socket.io')(); // eslint-disable-line
  let clientSocket;

  io.on('connection', (client) => {
    // console.log('connection'); // eslint-disable-line

    clientSocket = client;

    clientSocket.on('status', (status) => {
      mainWindow.webContents.once('dom-ready', () => {
        mainWindow.send('status', status);
      });
      mainWindow.send('status', status);

      if (status.isPlaying) {
        tray.showPlay();
      } else {
        tray.showPause();
      }

      // console.log(status); // eslint-disable-line
    });
  });

  io.set('origins', '*:*');

  io.listen(3007);

  ipcMain
    .on('play', function playFromRenderer() {
      if (clientSocket) {
        clientSocket.emit('play');
      }
    })
    .on('pause', function pauseFromRenderer() {
      if (clientSocket) {
        clientSocket.emit('pause');
      }
    })
    .on('prev', () => {
      if (clientSocket) {
        clientSocket.emit('prev');
      }
    })
    .on('next', () => {
      if (clientSocket) {
        clientSocket.emit('next');
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
