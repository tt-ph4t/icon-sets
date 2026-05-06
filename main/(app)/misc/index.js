import {validateIconName} from '@iconify/utils'
import {
  isBigint,
  isNull,
  isNumber,
  isPrimitive,
  isString,
  isUndefined
} from '@sindresorhus/is'
import {downloadZip} from 'client-zip'
import internalCopy from 'copy-to-clipboard'
import {mapValues, noop, omit} from 'es-toolkit'
import FileSaver from 'file-saver'
import has from 'has-values'
import {isWordCharacter} from 'is-word-character'
import jszip from 'jszip'
import {hash} from 'ohash'

import {ID_SEPARATOR} from '../misc/constants'
import {parseIconName} from './parse-icon-name'

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

export const getId = (...values) =>
  values
    .map(value => (isPrimitive(value) ? String : hash)(value))
    .join(ID_SEPARATOR)

export const hasValues = (...values) => has(values)

export const isOdd =
  // https://coreui.io/answers/how-to-check-if-a-number-is-odd-in-javascript/
  value => value % 2 !== 0

export const trigger = mapValues(
  {
    error: () => {
      throw new Error(crypto.randomUUID())
    },
    suspense: () => {
      throw new Promise(noop)
    }
  },
  fn =>
    (enabled = true) => {
      if (enabled) return fn()
    }
)

export const validateIconId = iconId =>
  isString(iconId) &&
  isWordCharacter(iconId) &&
  iconId.includes(ID_SEPARATOR) &&
  validateIconName(parseIconName(iconId).icon)

export const openObjectURL = (...args) => {
  const url = URL.createObjectURL(...args)

  open(url)
  URL.revokeObjectURL(url)
}

export const copy = async (value, options) => ({
  isCopied: await internalCopy(value, {
    fallbackToPrompt: true,
    ...options
  })
})

export const getIconFilePaths = (icon, extension) => ({
  default: `${icon.name}.${extension}`,
  get fullPath() {
    return `${icon.setName}/${this.default}`
  },
  get labeled() {
    return `[${icon.setName}] ${this.default}`
  }
})

export const isReactKey = (value, allowNullish = true) =>
  (allowNullish && (isNull(value) || isUndefined(value))) ||
  isString(value) ||
  isNumber(value) ||
  isBigint(value)
