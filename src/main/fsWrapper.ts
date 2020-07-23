import { IpcMain } from "electron"
import fs from "fs"

export const register = (ipcMain: IpcMain) => {
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

  ipcMain.handle('readdir', async (e, ...args: Parameters<typeof fs.promises.readdir>) => {
    let result
    try {
      result = await fs.promises.readdir(...args)
    } catch (e) {
      return {
        error: {
          message: e.message,
          code: e.code
        }
      }
    }

    return {
      result
    }
  })

  ipcMain.handle('rmdir', async (e, ...args: Parameters<typeof fs.promises.rmdir>) => {
    try {
      await fs.promises.rmdir(...args)
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
}
