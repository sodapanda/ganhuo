const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron')
const os = require('os');
const path = require('node:path')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    powerMonitor.on('lock-screen', () => {
        console.log('lock-screen')

        win.webContents.send('lockscreen', 1)
    })

    powerMonitor.on('unlock-screen', () => {
        console.log('unlock-screen')
    })

    win.loadURL('http://localhost:8000/ganhuo')
    win.webContents.openDevTools()
}

app.whenReady().then(() => {
    ipcMain.handle('uptime', () => {
        const uptimeSeconds = os.uptime();
        return uptimeSeconds
    })
    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})