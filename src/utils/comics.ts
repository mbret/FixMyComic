import { AppState } from "../reducers"
import { ipcRenderer } from "electron"
import path from "path"
import * as fs from './fs'
import cheerio from 'cheerio'
import { imageSize } from 'image-size'

/**
 * Set `page-progression-direction` with the `rtl` value
 */
export const fixRTL = async (extractedEpubPath: string, getState: () => AppState) => {
  const container = await fs.readFile(path.join(extractedEpubPath, 'META-INF', 'container.xml'), 'utf8')
  const $container = cheerio.load(container, { xmlMode: true })

  const opfPath = $container('rootfile').attr('full-path')
  const fullOpfPath = path.join(extractedEpubPath, opfPath)

  const opf = await fs.readFile(fullOpfPath, 'utf8')
  const $opf = cheerio.load(opf, { xmlMode: true })

  if (getState().rtl) {
    $opf('spine').attr('page-progression-direction', 'rtl')
  } else {
    $opf('spine').removeAttr('page-progression-direction')
  }

  await ipcRenderer.invoke('writeFile', fullOpfPath, $opf.html(), 'utf8')
}

/**
 * Set a `width` and `height` attribute to every pages that contains an image
 */
export const fixFixedLayout = async (extractedEpubPath: string, getState: () => AppState) => {
  const filesToFix: string[] = []
  await fs.walkFileRecursive(extractedEpubPath, async (file) => {
    console.log(`Found`, file)
    if (file.endsWith('.xhtml')) {
      filesToFix.push(file)
    }
  })

  console.log(`Found ${filesToFix.length} to fix`)
  await Promise.all(filesToFix.map(async (file) => {
    console.log(`Fixing file ${file}`)
    const dirPath = path.dirname(file)
    const data = await fs.readFile(file, 'utf8')
    const $ = cheerio.load(data, { xmlMode: true })

    let imgSrc
    let $img
    if ($('image').length > 0) {
      const $img2 = $('image')
      imgSrc = $img2.attr('xlink:href')
    } else {
      $img = $('img')
      imgSrc = $img.attr('src')
    }

    if (imgSrc) {
      const imgPath = path.resolve(dirPath, imgSrc)
      const dimensions = imageSize(imgPath);
      const ratio = dimensions.width / dimensions.height
      const maxHeight = dimensions.height
      const [width, height] = [Math.floor(maxHeight * ratio), maxHeight]
      
      if ($img) {
        $img.attr('width', width.toString())
        $img.attr('height', height.toString())
      }
      if ($('head').find('meta[name="viewport"]').length > 0) {
        $('head meta[name="viewport"]')
          .attr('content', `width=${width}, height=${height}`)
      } else {
        $('head').append(`<meta name="viewport" content="width=${width}, height=${height}"></meta>`)
      }
    }

    await ipcRenderer.invoke('writeFile', file, $.html(), 'utf8')
  }))
}

/**
 * Write the `com.apple.ibooks.display-options.xml` with a fixed layout if 
 * it does not exist 
 */
export const fixAppleFixedLayout = async (extractedEpubPath: string) => {
  const appPath = await ipcRenderer.invoke('getAppPath')
  const appleIbookXmlData = await fs.readFile(path.join(appPath, 'src/assets/com.apple.ibooks.display-options.xml'), 'utf8')
  try {
    await fs.mkdir(path.join(extractedEpubPath, 'META-INF'))
  } catch (e) {
    if (e.code !== 'EEXIST') throw e
  }
  try {
    await fs.writeFile(path.join(extractedEpubPath, 'META-INF/com.apple.ibooks.display-options.xml'), appleIbookXmlData, { flag: 'wx' })
  } catch (e) {
    if (e.code === 'EEXIST') {
      console.log('com.apple.ibooks.display-options.xml already exist. Skipped !')
    } else {
      throw e
    }
  }
}