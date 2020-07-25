import { Effect, AppAction, AppState } from "./reducers"
import { fixFile } from "./utils"
import { ipcRenderer } from "electron"
import path from "path"
import * as fs from './utils/fs'
import { Dispatch } from "react"

const fixComic = async (
  sourcePath: string,
  dispatch: Dispatch<AppAction>,
  getState: () => AppState
) => {
  console.log(`Unpacking ${sourcePath}`)
  const destPath = sourcePath
  const TMP_FOLDER = `${sourcePath}.tmp`
  const backupDest = `${sourcePath}.backup`

  if (getState().backup) {
    await fs.copyFile(sourcePath, backupDest)
    console.log(`backup created at ${backupDest}`)
  }

  dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 10 })

  await ipcRenderer.invoke('unzip', { source: sourcePath, dir: TMP_FOLDER })

  console.log(`Extracted into ${TMP_FOLDER}`)

  dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 20 })

  const filesToFix: string[] = []
  await fs.walkFileRecursive(TMP_FOLDER, async (file) => {
    console.log(`Found`, file)
    if (file.endsWith('.xhtml')) {
      filesToFix.push(file)
    }
  })

  console.log(`Found ${filesToFix.length} to fix`)
  await Promise.all(filesToFix.map(file => fixFile(TMP_FOLDER, file)))

  dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 50 })

  const appPath = await ipcRenderer.invoke('getAppPath')
  const appleIbookXmlData = await ipcRenderer.invoke('readFile', path.join(appPath, 'src/assets/com.apple.ibooks.display-options.xml'), 'utf8')
  try {
    await fs.mkdir(path.join(TMP_FOLDER, 'META-INF'))
  } catch (e) {
    if (e.code !== 'EEXIST') throw e
  }
  try {
    await fs.writeFile(path.join(TMP_FOLDER, 'META-INF/com.apple.ibooks.display-options.xml'), appleIbookXmlData, { flag: 'wx' })
  } catch (e) {
    if (e.code === 'EEXIST') {
      console.log('com.apple.ibooks.display-options.xml already exist. Skipped !')
    } else {
      throw e
    }
  }

  dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 80 })

  console.log('repacking fixed epub into original file')
  await ipcRenderer.invoke('zip', { src: TMP_FOLDER, dest: destPath })
  await fs.rmdir(TMP_FOLDER, { recursive: true })

  console.log(`Your fixed file has been created at ${destPath}`)
}

export const fixComics: Effect = async (action, dispatch, getState) => {
  if (action?.type === 'FIX_START') {
    const state = getState()
    console.log('RUN fixComics', action, state)
    console.log('will work on', state.files)

    dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 0 })

    try {
      await Promise.all(state.files.map(file => fixComic(file, dispatch, getState)))
    } catch (e) {
      console.error(e)
      dispatch({ type: 'FIX_FAILED', payload: e })
      new Notification('FixMyComic', {
        body: 'An error happened during the process'
      })
      return
    }

    dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 100 })
    console.log('finshed working on', state.files)

    new Notification('FixMyComic', {
      body: 'Your comics have been fixed'
    })

    dispatch({ type: 'FIX_SUCCESS' })
  }
}