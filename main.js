const electron = require('electron');
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain
} = electron;

const path = require('path');
const url = require('url');

let mainWindow;

const createWindow = function() {
  const { screen } = electron;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const windowHeight = 150;
  const windowWidth = 300;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: width - windowWidth,
    y: height - windowHeight,
    frame: false,
    backgroundColor: '#eee',
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'renderer/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {

    mainWindow = null
  });
};

const toggleWindowVisibility = function () {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  } else {
    createWindow();
  }
};

const initIpc = function () {
  ipcMain
    .on('play', function playFromRenderer() {
      console.log('sending play to browser');
    })
    .on('pause', function pauseFromRenderer() {
      console.log('sending pause to browser');
    });
};

app.on('ready', () => {
  const tray = require('./tray');

  tray.init(toggleWindowVisibility);

  initIpc();

  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

const io = require('socket.io')();

io.on('connection', (client) => {
  console.log('connection');

  client.on('status', (status) => {
    console.log(status);
  });
});

io.set('origins', '*:*');

io.listen(3007);
