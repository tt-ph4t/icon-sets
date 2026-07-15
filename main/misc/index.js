import {validateIconName} from '@iconify/utils'
import {
  isBigint,
  isNull,
  isSafeInteger,
  isString,
  isUndefined
} from '@sindresorhus/is'
import {downloadZip} from 'client-zip'
import copyToClipboard from 'copy-to-clipboard'
import {omit} from 'es-toolkit'
import FileSaver from 'file-saver'
import has from 'has-values'
import {isWordCharacter} from 'is-word-character'
import jszip from 'jszip'

import {ICON_CACHE, ID_SEPARATOR} from '../misc/constants'
import {cache} from './cache'
import {parseIconName} from './parse-icon-name'

export const open = Object.assign(
  (...args) => {
    const value = window.open(...args)

    if (isNull(value)) prompt(undefined, args[0])

    return value
  },
  {
    objectURL: (...args) => {
      const url = URL.createObjectURL(...args)

      open(url)
      URL.revokeObjectURL(url)
    }
  }
)

export const isWordChar = value => isString(value) && isWordCharacter(value)

export const fileSaver = async (data, fileName) => {
  // jszip
  if ('generateAsync' in data) data = await data.generateAsync({type: 'blob'})

  // client-zip
  if ('blob' in data) data = await data.blob()

  FileSaver(data, fileName)
}

export const Zip = Object.assign(jszip, {
  download: async (files, fileName) => {
    try {
      const response = downloadZip(files)

      if (response.ok) await fileSaver(response, `${fileName}.zip`)
    } catch (error) {
      prompt(
        'Error',
        error.message // ?
      )
    }
  },
  support: omit(jszip.support, ['nodebuffer', 'nodestream'])
})

export const hasValues = (...values) => has(values)

export const isOdd =
  // https://coreui.io/answers/how-to-check-if-a-number-is-odd-in-javascript/
  value => value % 2 !== 0

export const validateIconId = iconId =>
  isWordChar(iconId) &&
  iconId.includes(ID_SEPARATOR) &&
  validateIconName(parseIconName(iconId).icon)

export const copy = async (value, options) => ({
  isCopied: await copyToClipboard(value, {
    fallbackToPrompt: true,
    ...options
  })
})

export const getIconFilePaths = cache(
  (icon, extension) => {
    const fileName = `${icon.name}.${extension}`

    return {
      default: fileName,
      fullPath: `${icon.setName}/${fileName}`,
      labeled: `[${icon.setName}] ${fileName}`
    }
  },
  {
    max: ICON_CACHE.max
  }
)

export const isReactKey = (value, allowNullish = true) =>
  (allowNullish && (isNull(value) || isUndefined(value))) ||
  isString(value) ||
  isSafeInteger(value) ||
  isBigint(value)
