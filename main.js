const { app, BrowserWindow } = require('electron');
const path = require('path');
require('./backend/server'); // lance express

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);