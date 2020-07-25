// @ts-ignore
import React from 'react'
import AdmZip from 'adm-zip'
import path from 'path'
// @ts-ignore
import cheerio from 'cheerio'
import sizeOf from 'image-size'
// import yauzl from 'yauzl'
import { remote, ipcRenderer } from 'electron'
import * as fs from './utils/fs'
import { Reducer, Dispatch, ReducerState, ReducerAction, useReducer, useState, useRef, useCallback, useEffect, createContext } from 'react'
import { Dirent } from 'fs'

let MAX_HEIGHT = 1024;

export const fixFile = async (tmpFolder: string, filePath: string) => {
  console.log(`Fixing file ${filePath}`)
  const dirPath = path.dirname(filePath)
  const data = fs.readFileSync(filePath, 'utf8')
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
    // console.log('filePath', filePath)
    // console.log('imsrc', imgSrc)

    // const imgPath = path.join(tmpFolder, imgSrc)
    const imgPath = path.resolve(dirPath, imgSrc)
    // console.log(imgPath)
    // @ts-ignore
    var dimensions = sizeOf(imgPath);
    const ratio = dimensions.width / dimensions.height

    // tmp
    MAX_HEIGHT = dimensions.height

    const [width, height] = [Math.floor(MAX_HEIGHT * ratio), MAX_HEIGHT]
    // console.log(`viewport of ${width}x${height} applied from ${dimensions.width}x${dimensions.height} based on max height of ${MAX_HEIGHT} and a ratio of ${ratio} from ${imgSrc}`)
    if ($img) {
      $img.attr('width', width)
      $img.attr('height', height)
      // $img.attr('style', `height:${height}px; width:${width}px;`)
    }
    if ($('head').find('meta[name="viewport"]').length > 0) {
      $('head meta[name="viewport"]')
        .attr('content', `width=${width}, height=${height}`)
    } else {
      $('head').append(`<meta name="viewport" content="width=${width}, height=${height}"></meta>`)
    }
    // console.log(`Injected ${imgPath} meta into ${filePath}`)
  }

  await ipcRenderer.invoke('writeFile', filePath, $.html(), 'utf8')
}
