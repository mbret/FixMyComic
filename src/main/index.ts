import { app, BrowserWindow, ipcMain } from 'electron'
import extractZip from 'extract-zip'
import fs from 'fs'
import archiver from 'archiver'
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      // will accept require()
      nodeIntegration: true
    },
    height: 800,
    width: 1200,
  });

  mainWindow.removeMenu()
  
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'right' });
  }
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

ipcMain.handle('getAppPath', () => app.getAppPath())

ipcMain.handle('unzip', async (e, payload: { source: string; dir: string }) => {
  console.log('ipcMain.handle.unzip', payload)
  const res = await extractZip(payload.source, { dir: payload.dir })

  return res
})

/**
 * @see https://github.com/archiverjs/node-archiver
 */
ipcMain.handle('zip', async (e, payload) => {
  const output = fs.createWriteStream(payload.dest);
  const archive = archiver('zip')

  return new Promise((resolve, reject) => {
    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
      console.log('ipcMain.handle.zip', archive.pointer() + ' total bytes');
      console.log('ipcMain.handle.zip', 'archiver has been finalized and the output file descriptor has closed.')
      resolve()
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err: Error) {
      reject(err)
    });

    archive.on('warning', function(err: Error) {
      console.warn('ipcMain.handle.zip', err)
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.directory(payload.src, false)

    archive.finalize()
  })

})

ipcMain.handle('readdir', (e, payload) => fs.promises.readdir(payload))
ipcMain.handle('writeFile', async (e, ...args: Parameters<typeof fs.promises.writeFile>) => {
  try {
    await fs.promises.writeFile(...args)
  } catch (e) {
    return {
      error: {
        message: e.message,
        code: e.code
      }
    }
  }

  return {}
})
ipcMain.handle('mkdir', async (e, ...args: Parameters<typeof fs.promises.mkdir>) => {
  try {
    await fs.promises.mkdir(...args)
  } catch (e) {
    return {
      error: {
        message: e.message,
        code: e.code
      }
    }
  }

  return {}
})
ipcMain.handle('readFile', (e, ...args: Parameters<typeof fs.promises.readFile>) => fs.promises.readFile(...args))

ipcMain.handle('isDirectory', async (e, payload) => {
  const stat = await fs.promises.stat(payload)

  if (stat && stat.isDirectory()) return true

  return false
})