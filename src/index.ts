import { app, BrowserWindow, ipcMain } from 'electron';
import crypto from 'crypto';
// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
import http from "http";
import fs from "fs";
import windowStateKeeper from "electron-window-state";
import * as path from "path";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit()
}
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}
const createLocalServer = (filePath: string) => {
    const id = crypto.randomUUID()
    http.createServer(async function (req, res) {
        if (req.url !== `/${id}.epub`) {
            return;
        }
        const filename = filePath;
        const readStream = fs.createReadStream(filename);
        const stat = await fs.promises.stat(filename);
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, range",
            'Content-Type': "application/epub+zip",
            'Content-Length': stat.size
        })
        readStream.pipe(res)
    }).listen(10002);
    return id;
}
if (process.env.NODE_ENV !== "production") {
    const hasTestEpub = fs.existsSync(path.join(process.cwd(), "test.epub"));
    if (hasTestEpub) {
        const id = createLocalServer(path.join(process.cwd(), "test.epub"));
        ipcMain.handle("loadBook", () => {
            return `http://localhost:10002/${id}.epub`
        });
    }
} else {
    app.on('open-file', async function (event, filePath) {
        event.preventDefault();
        const id = createLocalServer(filePath);
        ipcMain.handle("loadBook", () => {
            return `http://localhost:10002/${id}.epub`
        });
    });
}
const createWindow = async () => {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800,
    });
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        'x': mainWindowState.x,
        'y': mainWindowState.y,
        'width': mainWindowState.width,
        'height': mainWindowState.height,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true,
        },
    });
    mainWindowState.manage(mainWindow);
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
