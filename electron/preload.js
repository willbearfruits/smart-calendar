// Preload script for Electron security
// This runs in a sandboxed context before the web page loads

const { contextBridge } = require('electron');

// Expose safe APIs to the renderer process if needed
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  isElectron: true
});
