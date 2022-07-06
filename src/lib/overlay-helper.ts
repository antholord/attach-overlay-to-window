import { BrowserWindow } from "electron";
import { EventEmitter } from 'events';
import { windowManager, Window } from 'node-window-manager';
import { getWindow } from "./window.utils";

export type WindowEventEmitterOptions = {
  windowName: string;
}

export declare interface OverlayHelper {
  on(event: 'window-found', listener: (window: Window) => void): this
  on(event: 'window-closed', listener: (window: Window) => void): this
}

export type AttachOverlayToWindowOptions = {
  overlayWindow: BrowserWindow;
  parentWindowTitle: string;
  notifyWhenWindowStateChanges?: boolean;
}

export class OverlayHelper extends EventEmitter {

  private lookForWindow(windowName: string, pollingInterval = 2000): void {
    const intervalFn = setInterval(() => {
      const window = getWindow(windowName);
      if (window) {
        this.emit('window-found', window);
        clearInterval(intervalFn);
      }
    }, pollingInterval)
  }

  attachOverlayToWindow = ({ overlayWindow, parentWindowTitle, notifyWhenWindowStateChanges }: AttachOverlayToWindowOptions) => {
    const windows = windowManager.getWindows();
    const overlayDesktopWindow = windows.find(w => w.getTitle() == overlayWindow.getTitle());
    const parentWindow = windows.find(w => w.getTitle() == parentWindowTitle);

    if (parentWindow && overlayDesktopWindow) {
      if (overlayDesktopWindow.getOwner() !== parentWindow) {
        overlayDesktopWindow.setOwner(parentWindow);
        if (parentWindow.id === windowManager.getActiveWindow().id) {
          overlayDesktopWindow.show();
        } else {
          overlayDesktopWindow.minimize()
        }
      }
    } else {
      console.error(`Could not find ${parentWindowTitle} or ${overlayDesktopWindow?.getTitle()}`);
    }

    const scanWindowsInterval = setInterval(() => {
      console.log(parentWindow?.getTitle())
      // const windows = windowManager.getWindows();
      // const parentWindow = windows.find(w => w.getTitle() == parentWindowTitle);
      // if (!parentWindow) {
      //   overlayWindow.hide();
      // }

    }, 500);

    if (notifyWhenWindowStateChanges) {
      overlayWindow.on('close', (event: Electron.Event) => {
        setTimeout(() => {
          const parentWindow = getWindow(parentWindowTitle);
          if (!parentWindow) {
            this.emit('window-closed', parentWindow);
            this.lookForWindow(parentWindowTitle);
          }
        }, 5000)
      });
    }
  }
}