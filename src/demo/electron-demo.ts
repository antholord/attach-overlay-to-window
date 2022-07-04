import { app, BrowserWindow, globalShortcut } from 'electron';
import overlayHelper from "../lib/overlay-helper";
import { WindowWatcher } from "../lib/window-watcher";

app.disableHardwareAcceleration();

let demoWindow: BrowserWindow;
let overlay: BrowserWindow;

function createDemoOverlay() {
  overlay = new BrowserWindow({
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

  overlay.setAlwaysOnTop(true, "pop-up-menu");
  overlay.setTitle('demo-overlay');
  overlay.setIgnoreMouseEvents(true);
  overlay.loadURL(`data:text/html;charset=utf-8,
    <body style="padding: 0; margin: 0;">
      <div style="position: absolute; width: 100%; height: 100%; border: 4px solid red; background: rgba(255,255,255,0.1); box-sizing: border-box; pointer-events: none;"></div>
      <div style="padding-top: 50vh; text-align: center;">
        <div style="padding: 16px; border-radius: 8px; background: rgb(255,255,0); border: 4px solid red; display: inline-block;">
          <span>Overlay Window</span>
          <span id="text1"></span>
          <br><span><b>CmdOrCtrl + Q</b> to toggle setIgnoreMouseEvents</span>
          <br><span><b>CmdOrCtrl + H</b> to "hide" overlay using CSS</span>
        </div>
      </div>
      <script type="module">
        const electron = require('electron');
        electron.ipcRenderer.on('focus-change', (e, state) => {
          document.getElementById('text1').textContent = (state) ? ' (overlay is clickable) ' : 'clicks go through overlay'
        });
        electron.ipcRenderer.on('visibility-change', (e, state) => {
          if (document.body.style.display) {
            document.body.style.display = null
          } else {
            document.body.style.display = 'none'
          }
        });
      </script>
    </body>
  `)

  overlay.webContents.openDevTools({ mode: 'detach', activate: false })
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
  overlayHelper.setOverlayAsChildWindow('demo-overlay', 'demo-window');
})