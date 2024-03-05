const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron')
const os = require('os');
const path = require('node:path')
const activeWindow = require('active-win');
const express = require('express');

const badApp = ['com.tencent.xinWeChat', 'com.tdesktop.Telegram', 'com.colliderli.iina', 'com.apple.finder']
const badWebsite = ['bilibili.com', 'twitter.com', 'xiaohongshu.com', 'zhihu.com', 'missav.com', 'twitch.tv']

let mTimerId = 0

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
    ipcMain.handle('startInterval', (event) => {
        mTimerId = setInterval(async () => {
            let sIsWorking = false
            const active = await activeWindow({
                accessibilityPermission: true,
                screenRecordingPermission: true,
            })

            if (!active) {
                sIsWorking = false
            }

            const url = active.url
            if (url) {
                const host = new URL(url).host
                const isBadUrl = badWebsite.some(website => host.includes(website))
                sIsWorking = !isBadUrl
            } else {
                const isBadApp = badApp.some(app => app === active.owner.bundleId)
                sIsWorking = !isBadApp
            }

            const uptimeSeconds = os.uptime();

            event.sender.send('onInterval', { isWorking: sIsWorking, nowUptime: uptimeSeconds })
        }, 3000);
        return true;
    })

    ipcMain.handle('stopInterval', () => {
        clearInterval(mTimerId)
        return true
    })

    ipcMain.handle('uptime', () => {
        const uptimeSeconds = os.uptime();
        return uptimeSeconds
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