import { ipcRenderer } from "electron"
import nativeFs from 'fs'

const handleIpcResult = ({ result, error }: { result: any; error: any }) => {
  if (error) {
    const e: any = new Error(error.message)
    e.code = error.code
    throw e
  }

  return result
}

export const mkdir = async (...args: Parameters<typeof nativeFs.promises.mkdir>) =>
  handleIpcResult(await ipcRenderer.invoke('mkdir', ...args))

export const writeFile = async (...args: Parameters<typeof nativeFs.promises.writeFile>) =>
  handleIpcResult(await ipcRenderer.invoke('writeFile', ...args))

export const rmdir = async (...args: Parameters<typeof nativeFs.promises.rmdir>) =>
  handleIpcResult(await ipcRenderer.invoke('rmdir', ...args))

export const readdir = async (...args: Parameters<typeof nativeFs.promises.readdir>) =>
  handleIpcResult(await ipcRenderer.invoke('readdir', ...args))

export const readFileSync = nativeFs.readFileSync
