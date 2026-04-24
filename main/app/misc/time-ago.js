import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {flow} from 'es-toolkit'

dayjs.extend(relativeTime)

const withFromNow = fn => flow(fn, fn => fn.fromNow())

export const timeAgo = Object.assign(withFromNow(dayjs), {
  unix: withFromNow(dayjs.unix)
})
