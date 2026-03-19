import { isEqual } from '@ver0/deep-equal'
import { flow } from 'es-toolkit'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithImmer } from 'jotai-immer'
import { freezeAtom, selectAtom } from 'jotai/utils'

import { DELAY_MS } from '../constants'
import { useCallback } from '../hooks/use-callback'

const create = flow(atomWithImmer, freezeAtom)
const defaultValue = {}

export const withImmerAtom = (initialValue = defaultValue) => {
  const atom = create(initialValue)

  return Object.assign(
    () => {
      const setAtom = useSetAtom(atom)

      return {
        // https://jotai.org/docs/utilities/resettable
        reset: useCallback(() => {
          setAtom(initialValue)
        }),
        set: useCallback(fn => {
          setAtom(draft => {
            fn({ draft })
          })
        }),
        get useIsDefault() {
          return useCallback(value =>
            isEqual(
              this.useSelectValue(({ draft }) => value ?? draft),
              initialValue
            )
          )
        },
        useSelectValue: useCallback((fn, { deps = [], ...options } = {}) =>
          useAtomValue(
            selectAtom(
              atom,
              // https://jotai.org/docs/utilities/select#hold-stable-references
              useCallback(draft => fn({ draft }), deps),
              isEqual
            ),
            {
              delay: DELAY_MS,
              ...options
            }
          )
        )
      }
    },
    { initial: initialValue }
  )
}
