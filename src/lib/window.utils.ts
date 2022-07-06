import { windowManager, Window } from "node-window-manager";

export function getWindow(windowName: string): Window | null {
    return windowManager.getWindows().find(w => w.getTitle() == windowName) ?? null;
}