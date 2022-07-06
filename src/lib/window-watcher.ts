import { EventEmitter } from 'events';
import { windowManager, Window } from 'node-window-manager';
import { DebouncedFunc, throttle } from 'lodash';

type WindowWatcherOptions = {
  windowName: string
  pollingInterval?: number
}

interface IWindowWatcherClass {
  on(event: 'window-active-state-changed', listener: (isActive: boolean) => void): this
  on(event: 'window-found', listener: () => void): this
  on(event: 'window-not-found', listener: () => void): this
  off(event: string, listener: any): this
}

class WindowWatcherClass extends EventEmitter implements IWindowWatcherClass {
  windowName: string;
  pollingInterval: number;

  lastWindow: Window | null = null;
  throttledGetWindow: DebouncedFunc<(windowName: string) => Window | null>

  private _watchedWindow: Window | null = null;

  constructor(windowName: string, pollingInterval = 500) {
    super();
    this.windowName = windowName;
    this.pollingInterval = pollingInterval;

    this.throttledGetWindow = throttle(this.getWindow, this.pollingInterval);

    this.startWatch();
  }

  get watchedWindow(): Window | null {
    if (this._watchedWindow) return this._watchedWindow;


    const windowToWatch = this.getWindow(this.windowName);
    if (windowToWatch) {
      this.emit('window-found');
    }

    this.watchedWindow = windowToWatch;

    return this._watchedWindow
  }

  set watchedWindow(window: Window | null) {
    this._watchedWindow = window;
  }

  startWatch() {
    this.lastWindow = windowManager.getActiveWindow();
    this.watchedWindow = this.getWindow(this.windowName);
    if (!this.watchedWindow) {
      this.emit('window-not-found')
    }
    setInterval(async () => {
      const currentActiveWindow = windowManager.getActiveWindow();
      if (!currentActiveWindow || !this.watchedWindow) return;

      if (!this.lastWindow) this.lastWindow = currentActiveWindow;

      if (currentActiveWindow.id !== this.lastWindow.id) {
        if (currentActiveWindow.getTitle() == this.windowName) {
          this.emit('window-active-state-changed', true);
        } else if (this.lastWindow.getTitle() == this.windowName) {
          this.emit('window-active-state-changed', false);
        }
        this.lastWindow = currentActiveWindow;
      }
    }, this.pollingInterval);
  }

  getWindow(windowName: string): Window | null {
    return windowManager.getWindows().find(w => w.getTitle() == windowName) ?? null;
  }

  focusWindow(windowName: string) {
    const window = windowManager.getWindows().find(w => w.getTitle() == windowName);
    if (!window) {
      console.error(`Could not find ${windowName}`);
      return;
    }

    window.bringToTop();
  }
}

const WindowWatcher = {
  watchWindow: (options: WindowWatcherOptions) => new WindowWatcherClass(options.windowName, options.pollingInterval)
}
