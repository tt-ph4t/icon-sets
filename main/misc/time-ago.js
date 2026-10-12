import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {mapValues} from 'es-toolkit'
import {flow} from 'es-toolkit/fp'

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
