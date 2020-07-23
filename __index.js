#!/usr/bin/env node

var AdmZip = require('adm-zip');
var fs = require('fs');
var path = require('path');
const cheerio = require('cheerio')
var sizeOf = require('image-size');
const { argv } = require('yargs')

let MAX_HEIGHT = 1024;

const walkFileRecursiveSync = (dir, callback) => {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const subPath = path.join(dir, file);
    const stat = fs.statSync(subPath)
    if (stat) {
      if (stat.isDirectory()) {
        walkFileRecursiveSync(subPath, callback);
      } else {
        callback(subPath)
      }
    }
  })
}

const fixFile = (tmpFolder, filePath) => {
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
    console.log('filePath', filePath)
    console.log('imsrc', imgSrc)

    // const imgPath = path.join(tmpFolder, imgSrc)
    const imgPath = path.resolve(dirPath, imgSrc)
    console.log(imgPath)
    var dimensions = sizeOf(imgPath);
    const ratio = dimensions.width / dimensions.height

    // tmp
    MAX_HEIGHT = dimensions.height

    const [width, height] = [Math.floor(MAX_HEIGHT * ratio), MAX_HEIGHT]
    console.log(`viewport of ${width}x${height} applied from ${dimensions.width}x${dimensions.height} based on max height of ${MAX_HEIGHT} and a ratio of ${ratio} from ${imgSrc}`)
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

  fs.writeFileSync(filePath, $.html(), 'utf8')
}

const fixComic = async (sourcePath) => {
  const destPath = sourcePath
  const TMP_FOLDER = `${sourcePath.split('.').slice(0, -1).join('.')} tmp`

  var zip = new AdmZip(sourcePath);
  zip.extractAllTo(TMP_FOLDER, /*overwrite*/true)

  var zip = new AdmZip();

  const filesToFix = []
  walkFileRecursiveSync(TMP_FOLDER, (file) => {
    if (file.endsWith('.xhtml')) {
      filesToFix.push(file)
    }
  })

  await Promise.all(filesToFix.map(file => fixFile(TMP_FOLDER, file)))

  const appleIbookXmlData = fs.readFileSync(path.join(__dirname, 'com.apple.ibooks.display-options.xml'), 'utf8')
  try {
    fs.writeFileSync(path.join(TMP_FOLDER, 'META-INF/com.apple.ibooks.display-options.xml'), appleIbookXmlData, { flag: 'wx' })
  } catch (e) {
    if (e.code === 'EEXIST') {
      console.log('com.apple.ibooks.display-options.xml already exist. Skipped !')
    } else {
      throw e
    }
  }

  zip.addLocalFolder(TMP_FOLDER)
  zip.writeZip(destPath);
  // fs.rmdirSync(TMP_FOLDER, { recursive: true });

  console.log(`Your fixed file has been created at ${destPath}`)
}

const run = async () => {
  const sourcePath = argv.source ? path.join(process.cwd(), argv.source) : process.cwd()

  console.log(`Using ${sourcePath} as lookup path `)

  const epubPaths = []

  const walk = (dir) => {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const subPath = path.join(dir, file);
      const stat = fs.statSync(subPath)
      if (stat) {
        if (stat.isDirectory()) {
          walk(subPath);
        } else {
          if (subPath.endsWith('.epub')) {
            epubPaths.push(subPath)
          }
        }
      }
    })
  }

  walk(sourcePath)

  return Promise.all(epubPaths.map(fixComic))
}

(async () => {
  try {
    await run()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  console.log('done')
})()