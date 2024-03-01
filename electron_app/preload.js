const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('app', {
    uptime: () => ipcRenderer.invoke('uptime'),
    onLockScreen: (callback) => { ipcRenderer.on('lockscreen', (_event, value) => { callback(value) }) }
})