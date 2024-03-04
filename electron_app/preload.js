const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('app', {
    uptime: () => ipcRenderer.invoke('uptime'),
    isWorking: ()=> ipcRenderer.invoke('isWorking'),
    onLockScreen: (callback) => { ipcRenderer.on('lockscreen', (_event, value) => { callback(value) }) },
    startInterval:()=>ipcRenderer.invoke('startInterval'),
    stopInterval:()=>ipcRenderer.invoke('stopInterval'),
    onInterval:(callback)=>{ipcRenderer.on('onInterval',(_event,value)=>{callback(value)})},
})