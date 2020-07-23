import { Effect, AppAction } from "./reducers"
import { walkFileRecursive, fixFile } from "./utils"
import { ipcRenderer } from "electron"
import path from "path"
import * as fs from './utils/fs'
import { Dispatch } from "react"

const fixComic = async (sourcePath: string, dispatch: Dispatch<AppAction>) => {
  console.log(`Unpacking ${sourcePath}`)
  const destPath = sourcePath
  const TMP_FOLDER = `${sourcePath}.tmp`

  await ipcRenderer.invoke('unzip', { source: sourcePath, dir: TMP_FOLDER })

  console.log(`Extracted into ${TMP_FOLDER}`)

  dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 20 })

  const filesToFix: string[] = []
  await walkFileRecursive(TMP_FOLDER, async (file) => {
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

  console.log('repacking fixed epub into original file')
  await ipcRenderer.invoke('zip', { src: TMP_FOLDER, dest: destPath })
  // fs.rmdirSync(TMP_FOLDER, { recursive: true });

  console.log(`Your fixed file has been created at ${destPath}`)
}

export const fixComics: Effect = async (action, dispatch, getState) => {
  if (action?.type === 'FIX_START') {
    const state = getState()
    console.log('RUN fixComics', action, state)
    console.log('will work on', state.files)

    dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 0 })

    try {
      await Promise.all(state.files.map(file => fixComic(file, dispatch)))
    } catch (e) {
      console.error(e)
    }

    dispatch({ type: 'FIXING_UPDATE_PROGRESS', payload: 100 })
    console.log('finshed working on', state.files)

    new Notification('Fix My Comic', {
      body: 'Your comics have been fixed'
    })

    dispatch({ type: 'FIX_SUCCESS' })
  }
}