import { OverlayHelper } from './../lib';
import { app, BrowserWindow } from 'electron';

app.disableHardwareAcceleration();

let demoWindow: BrowserWindow;
let overlayWindow: BrowserWindow;

function createDemoOverlay() {
  overlayWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    skipTaskbar: true,
    frame: false,
    show: true,
    resizable: true,
    transparent: true
  });

  overlayWindow.setAlwaysOnTop(true, "pop-up-menu");
  overlayWindow.setTitle('demo-overlay');
  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.loadURL(`data:text/html;charset=utf-8,
    <body style="padding: 0; margin: 0;">
      <div style="position: absolute; width: 100%; height: 100%; border: 4px solid red; background: rgba(255,255,255,0.1); box-sizing: border-box; pointer-events: none;"></div>
      <div style="padding-top: 50vh; text-align: center;">
        <div style="padding: 16px; border-radius: 8px; background: rgb(255,255,0); border: 4px solid red; display: inline-block;">
          <span>Overlay Window</span>
          <span id="text1"></span>
        </div>
      </div>
      <script type="module">
        const electron = require('electron');
      </script>
    </body>
  `)

  overlayWindow.webContents.openDevTools({ mode: 'detach', activate: false })
}

function createDemoWindow() {
  demoWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    skipTaskbar: false,
    frame: true,
    show: true,
    resizable: true
  });

  demoWindow.setTitle('demo-window')

  demoWindow.loadURL(`data:text/html;charset=utf-8,
    <head>
      <title>demo-window</title>
    </head>
    <body style="padding: 0; margin: 0;">
      <div style="position: absolute; width: 100%; height: 100%; border: 4px solid blue; background: rgba(255,255,255,0.1); box-sizing: border-box; pointer-events: none;"></div>
      <div style="padding-top: 50vh; text-align: center;">
        <div style="padding: 16px; border-radius: 8px; background: rgb(255,255,255); border: 4px solid red; display: inline-block;">
          <span>Demo Window</span>
          <span id="text1"></span>
          <input type="text" id="text2" value="Hello World" />
        </div>
      </div>
    </body>
  `)
}

app.on('ready', () => {
  createDemoWindow();
  createDemoOverlay();
  OverlayHelper.attachOverlayToWindow({ overlayWindow, parentWindowTitle: 'demo-window', notifyWhenWindowStateChanges: true });
})