const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron')
const os = require('os');
const path = require('node:path')
const activeWindow = require('active-win');
const express = require('express');

const badApp = ['com.tencent.xinWeChat', 'com.tdesktop.Telegram', 'com.colliderli.iina', 'com.apple.finder']
const badWebsite = ['youtube.com', 'bilibili.com', 'twitter.com', 'xiaohongshu.com', 'zhihu.com', 'missav.com']

const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 500,
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

    win.loadURL('http://localhost:6363/ganhuo')
    // win.webContents.openDevTools()
}

app.whenReady().then(() => {
    ipcMain.handle('uptime', () => {
        const uptimeSeconds = os.uptime();
        return uptimeSeconds
    })

    ipcMain.handle('isWorking', async () => {
        const active = await activeWindow({
            accessibilityPermission: true,
            screenRecordingPermission: true,
        })

        if (!active) {
            return false
        }

        const url = active.url
        if (url) {
            const host = new URL(url).host
            const isBadUrl = badWebsite.some(website => host.includes(website))
            return !isBadUrl
        } else {
            const isBadApp = badApp.some(app => app === active.owner.bundleId)
            return !isBadApp
        }
    })

    const server = express();

    server.use(express.static(path.join(__dirname, 'public')));

    server.listen(6363, () => {
        console.log('Server running at http://localhost:6363/');
    });

    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})