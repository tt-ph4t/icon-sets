import { isBlob } from '@sindresorhus/is'
import { format } from 'bytes'

// https://github.com/visionmedia/bytes.js/blob/9ddc13b6c66e0cb293616fba246e05db4b6cef4d/index.js#L37
const parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i

export const prettyBytes = (value = 0) =>
  format(isBlob(value) ? value.size : value, {
    decimalPlaces: 1,
    unitSeparator: ' '
  })
