import dayjs from 'dayjs'
import {invariant, mapValues, noop} from 'es-toolkit'

export const trigger = mapValues(
  {
    error: () => {
      invariant(false, dayjs().format('ddd MMM DD YYYY HH:mm:ss'))
    },
    suspense: () => {
      throw new Promise(noop)
    }
  },
  fn =>
    (enabled = true) => {
      if (import.meta.env.DEV && enabled) return fn()
    }
)
