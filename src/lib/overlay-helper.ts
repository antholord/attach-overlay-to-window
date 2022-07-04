import { BrowserWindow } from 'electron';
import { windowManager } from "node-window-manager";
import { IWindowWatcherClass, WindowWatcher, WindowWatcherOptions } from "./window-watcher";
type AttachOptions = WindowWatcherOptions & { overlayWindow: BrowserWindow }

let activeWindowChangedHandler: (isActive: boolean) => void = () => { };
let activeWindowWatcher: IWindowWatcherClass | null = null;

const attach = ({ overlayWindow, ...options }: AttachOptions) => {

  const activeWindowWatcher = WindowWatcher.watchWindow(options);
  activeWindowChangedHandler = (isActive: boolean) => {
    if (isActive) {
      overlayWindow.show();
    } else {
      overlayWindow.hide();
    }
  }
  activeWindowWatcher.on('active-window-changed', activeWindowChangedHandler);
};

const detach = () => {
  activeWindowWatcher?.off('active-window-changed', activeWindowChangedHandler);
}

const setOverlayAsChildWindow = (overlayWindowTitle: string, parentWindowTitle: string) => {
  const windows = windowManager.getWindows();
  const overlayWindow = windows.find(w => w.getTitle() == overlayWindowTitle)
  const parentWindow = windows.find(w => w.getTitle() == parentWindowTitle)
  if (parentWindow && overlayWindow) {
    overlayWindow.setOwner(parentWindow);
  } else {
    console.error(`Could not find ${parentWindowTitle}` + ` or ${overlayWindowTitle}`);
  }
}

export default {
  attachOverlayToWindow: setOverlayAsChildWindow
}