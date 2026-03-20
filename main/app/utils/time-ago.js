import {flow} from 'es-toolkit'

import {dayjs} from './dayjs'

const withFromNow = fn => flow(fn, fn => fn.fromNow())

export const timeAgo = Object.assign(withFromNow(dayjs), {
  unix: withFromNow(dayjs.unix)
})
