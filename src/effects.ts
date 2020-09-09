import { Effect, AppAction, AppState } from "./reducers"
import { ipcRenderer } from "electron"
import * as fs from './utils/fs'
import { Dispatch } from "react"
import { fixFixedLayout, fixRTL, fixAppleFixedLayout, getOpfContent } from "./utils/comics"

const fixComic = async (
  sourcePath: string,
  dispatch: Dispatch<AppAction>,
  getState: () => AppState
) => {
  const destPath = sourcePath
  const TMP_FOLDER = `${sourcePath}.tmp`
  const backupDest = `${sourcePath}.backup`

  dispatch({ type: 'ADD_FIXING_PROGRESS_TASK', payload: `${sourcePath}:backup` })
  dispatch({ type: 'ADD_FIXING_PROGRESS_TASK', payload: `${sourcePath}:unzip` })
  dispatch({ type: 'ADD_FIXING_PROGRESS_TASK', payload: `${sourcePath}:rezip` })
  dispatch({ type: 'ADD_FIXING_PROGRESS_TASK', payload: `${sourcePath}:cleanup` })
  dispatch({ type: 'ADD_FIXING_PROGRESS_TASK', payload: `${sourcePath}:fix-rtl` })
  dispatch({ type: 'ADD_FIXING_PROGRESS_TASK', payload: `${sourcePath}:fix-fixed-layout` })
  dispatch({ type: 'ADD_FIXING_PROGRESS_TASK', payload: `${sourcePath}:fix-apple-fixed-layout` })

  if (getState().backup) {
    await fs.copyFile(sourcePath, backupDest)
    console.log(`backup created at ${backupDest}`)
    dispatch({ type: 'UPDATE_FIXING_PROGRESS', payload: { key: `${sourcePath}:backup`, progress: 100 } })
  }

  await ipcRenderer.invoke('unzip', { source: sourcePath, dir: TMP_FOLDER })
  dispatch({ type: 'UPDATE_FIXING_PROGRESS', payload: { key: `${sourcePath}:unzip`, progress: 100 } })

  const $opf = await getOpfContent(TMP_FOLDER)
  const version = $opf('package').attr('version')
  if (version !== '2.0') {
    throw new Error(`Unsupported ${version} epub version`)
  }

  const tasks = [
    fixRTL(TMP_FOLDER, getState)
      .then(async () => {
        dispatch({ type: 'UPDATE_FIXING_PROGRESS', payload: { key: `${sourcePath}:fix-rtl`, progress: 100 } })
      }),
  ]

  if (getState().fixedLayout) {
    tasks.push(
      fixFixedLayout(TMP_FOLDER, getState)
        .then(async () => {
          dispatch({ type: 'UPDATE_FIXING_PROGRESS', payload: { key: `${sourcePath}:fix-fixed-layout`, progress: 100 } })
        }),
    )
    tasks.push(
      fixAppleFixedLayout(TMP_FOLDER)
        .then(async () => {
          dispatch({ type: 'UPDATE_FIXING_PROGRESS', payload: { key: `${sourcePath}:fix-apple-fixed-layout`, progress: 100 } })
        }),
    )
  }

  await Promise.all(tasks)

  console.log('repacking fixed epub into original file')

  await ipcRenderer.invoke('zip', { src: TMP_FOLDER, dest: destPath })
  dispatch({ type: 'UPDATE_FIXING_PROGRESS', payload: { key: `${sourcePath}:rezip`, progress: 100 } })

  await fs.rmdir(TMP_FOLDER, { recursive: true })
  dispatch({ type: 'UPDATE_FIXING_PROGRESS', payload: { key: `${sourcePath}:cleanup`, progress: 100 } })

  console.log(`Your fixed file has been created at ${destPath}`)
}

export const fixComics: Effect = async (action, dispatch, getState) => {
  if (action?.type === 'FIX_START') {
    const state = getState()
    console.log('RUN fixComics', action, state)
    console.log('will work on', state.files)

    try {
      await Promise.all(state.files.map(file => fixComic(file, dispatch, getState)))
    } catch (e) {
      console.error(e)
      dispatch({ type: 'FIX_FAILED', payload: e })
      new Notification('FixMyComic', {
        body: `An error happened during the process (${e.message})`
      })
      return
    }

    console.log('finshed working on', state.files)

    new Notification('FixMyComic', {
      body: 'Your comics have been fixed'
    })

    dispatch({ type: 'FIX_SUCCESS' })
  }
}