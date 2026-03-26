import {isEqual} from '@ver0/deep-equal'
import deepFreeze from 'deep-freeze-es6'
import {flow} from 'es-toolkit'
import {useAtomValue, useSetAtom} from 'jotai'
import {atomWithImmer} from 'jotai-immer'
import {freezeAtom, selectAtom} from 'jotai/utils'

import {useCallback} from '../hooks/use-callback'
import {DELAY_MS, EMPTY_ARRAY, EMPTY_OBJECT} from '../misc/constants'

const create = flow(atomWithImmer, freezeAtom)

export const withImmerAtom = (initialValue = EMPTY_OBJECT) => {
  const atom = create((initialValue = deepFreeze(initialValue)))

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
            fn({draft})
          })
        }),
        useSelectValue: useCallback(
          (fn, {deps = EMPTY_ARRAY, ...options} = EMPTY_OBJECT) =>
            useAtomValue(
              selectAtom(
                atom,
                // https://jotai.org/docs/utilities/select#hold-stable-references
                useCallback(draft => fn({draft}), deps),
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
    {initial: initialValue}
  )
}
