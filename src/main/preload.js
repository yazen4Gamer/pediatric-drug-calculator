// preload.js
// This file acts as a secure bridge between the renderer and main process.

const { contextBridge, ipcRenderer } = require('electron');

// Expose only safe APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  exitApp: () => ipcRenderer.invoke('exit-app'),
  
  // Auto-launch controls
  enableAutoLaunch: () => ipcRenderer.invoke('enable-auto-launch'),
  disableAutoLaunch: () => ipcRenderer.invoke('disable-auto-launch'),
  getAutoLaunchStatus: () => ipcRenderer.invoke('get-auto-launch-status'),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),

  // Always on top
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('set-always-on-top', enabled),

  // Optional event listeners (e.g. window state)
  onFullscreenChanged: (callback) => ipcRenderer.on('fullscreen-changed', (_, state) => callback(state)),
  onWindowFocused: (callback) => ipcRenderer.on('window-focused', callback),
  onWindowBlurred: (callback) => ipcRenderer.on('window-blurred', callback)
});
