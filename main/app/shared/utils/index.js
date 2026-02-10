import { stringToIcon, validateIconName } from '@iconify/utils'
import { isPlainObject } from '@sindresorhus/is'
import { queryOptions } from '@tanstack/react-query'
import { decode } from '@toon-format/toon'
import axios from 'axios'
import { downloadZip } from 'client-zip'
import copyToClipboard from 'copy-to-clipboard'
import { delay, identity, noop, omit } from 'es-toolkit'
import { castArray } from 'es-toolkit/compat'
import FileSaver from 'file-saver'
import hasValues from 'has-values'
import { isWordCharacter } from 'is-word-character'
import jszip from 'jszip'
import isEqual1 from 'react-fast-compare'

export const fileSaver = async (data, fileName) => {
  // jszip
  if ('generateAsync' in data) data = await data.generateAsync({ type: 'blob' })

  // client-zip
  if ('blob' in data) data = await data.blob()

  FileSaver(data, fileName)
}

export const Zip = Object.assign(jszip, {
  download: async (files, fileName) => {
    const response = downloadZip(files)

    if (response.ok) await fileSaver(response, `${fileName}.zip`)
  },
  support: omit(jszip.support, ['nodebuffer', 'nodestream'])
})

export const getQueryOptions =
  // https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations
  ({
    delayMs = import.meta.env.VITE_DELAY_MS,
    networkMode = 'offlineFirst',
    queryFn,
    queryKey,
    refetchOnReconnect = false,
    refetchOnWindowFocus = false,
    retry = 1,
    select = noop,
    staleTime = Infinity,
    structuralSharing = (a, b) => (isEqual(a, b) ? a : b),
    toonFormat = true,
    url,
    ...rest
  }) =>
    queryOptions({
      networkMode,
      queryFn:
        queryFn ??
        (async () => {
          await delay(delayMs)

          return (toonFormat ? decode : identity)((await axios.get(url)).data)
        }),
      queryKey: castArray(queryKey ?? url),
      refetchOnReconnect,
      refetchOnWindowFocus,
      retry,
      select,
      staleTime,
      structuralSharing,
      ...rest
    })

export const getId = (...values) =>
  values
    .map(value => (isPlainObject(value) ? JSON.stringify : String)(value))
    .join(import.meta.env.VITE_ID_SEPARATOR)

export const isEqual = (...[b, ...a]) => a.every(a => isEqual1(a, b))
export const has = (...values) => hasValues(values)

export const checkOdd =
  // https://coreui.io/answers/how-to-check-if-a-number-is-odd-in-javascript/
  value => value % 2 !== 0

export const validateIconId = (value = '') =>
  value.includes(import.meta.env.VITE_ID_SEPARATOR) &&
  isWordCharacter(value) &&
  validateIconName(stringToIcon(value))

export const openObjectURL = async (...args) => {
  const url = URL.createObjectURL(...args)

  if (open(url)) {
    await delay(import.meta.env.VITE_DELAY_MS)

    URL.revokeObjectURL(url)
  }
}

export const copy = (text, options) => {
  if (!copyToClipboard(text, options)) prompt('Copy failed', text)
}
