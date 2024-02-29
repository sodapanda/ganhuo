const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 600
    })

    win.loadURL('http://localhost:8000/')
}

app.whenReady().then(() => {
    createWindow()
})