import { flow } from 'es-toolkit'

import { dayjs } from './dayjs'

const fromNow = dayjs => dayjs.fromNow()

export const timeAgo = Object.assign(flow(dayjs, fromNow), {
  unix: flow(dayjs.unix, fromNow)
})
