import { isBlob } from '@sindresorhus/is'
import bytes from 'bytes'

const parseRegExp =
  // https://github.com/visionmedia/bytes.js/blob/9ddc13b6c66e0cb293616fba246e05db4b6cef4d/index.js#L37
  /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i

export const prettyBytes = (value = 0) =>
  bytes.format(isBlob(value) ? value.size : value, {
    decimalPlaces: 1,
    unitSeparator: ' '
  })
