import {invariant, mapValues, noop} from 'es-toolkit'

export const trigger = mapValues(
  {
    error: () => {
      invariant(false, String(new Date()))
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
