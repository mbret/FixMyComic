import { ipcRenderer } from "electron"
import nativeFs, { Dirent } from 'fs'
import path from 'path'

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

export const copyFile = async (...args: Parameters<typeof nativeFs.promises.copyFile>) =>
  handleIpcResult(await ipcRenderer.invoke('copyFile', ...args))

export const readFileSync = nativeFs.readFileSync

export const readFile = async (...args: Parameters<typeof nativeFs.promises.readFile>) =>
  handleIpcResult(await ipcRenderer.invoke('readFile', ...args))

export const walkFileRecursive = async (dir: string, callback: (path: string) => void) => {
  const files: Dirent[] = await readdir(dir, { encoding: 'utf-8', withFileTypes: true })
  console.log(files)
  await Promise.all(
    files.map(async (file) => {
      const subPath = path.join(dir, file.name);
      const isDirectory = await ipcRenderer.invoke('isDirectory', subPath)
      if (isDirectory) {
        await walkFileRecursive(subPath, callback);
      } else {
        await callback(subPath)
      }
    })
  )
}