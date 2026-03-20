import {stringToIcon, validateIconName} from '@iconify/utils'
import {isPrimitive} from '@sindresorhus/is'
import {downloadZip} from 'client-zip'
import copyToClipboard from 'copy-to-clipboard'
import {omit} from 'es-toolkit'
import FileSaver from 'file-saver'
import hasValues from 'has-values'
import {isWordCharacter} from 'is-word-character'
import jszip from 'jszip'
import {hash} from 'ohash'

import {ID_SEPARATOR} from '../constants'

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

export const has = (...values) => hasValues(values)

export const checkOdd =
  // https://coreui.io/answers/how-to-check-if-a-number-is-odd-in-javascript/
  value => value % 2 !== 0

export const validateIconId = (value = '') =>
  value.includes(ID_SEPARATOR) &&
  isWordCharacter(value) &&
  validateIconName(stringToIcon(value))

export const openObjectURL = (...args) => {
  const url = URL.createObjectURL(...args)

  open(url)
  URL.revokeObjectURL(url)
}

export const copy = (text, options) => {
  if (!copyToClipboard(text, options)) prompt('Copy failed', text)
}
