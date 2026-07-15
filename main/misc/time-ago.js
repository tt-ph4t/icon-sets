import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {flow, mapValues} from 'es-toolkit'

dayjs.extend(relativeTime)

const toRelativeTime = fn => flow(fn, fn => fn.fromNow())

export const timeAgo = Object.assign(
  toRelativeTime(dayjs),
  mapValues(
    {
      unix: dayjs.unix
    },
    toRelativeTime
  )
)
