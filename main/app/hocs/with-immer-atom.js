import {useThrottledState} from '@tanstack/react-pacer'
import {isEqual} from '@ver0/deep-equal'
import deepFreeze from 'deep-freeze-es6'
import {flow} from 'es-toolkit'
import {useSetAtom, useStore} from 'jotai'
import {atomWithImmer} from 'jotai-immer'
import {freezeAtom, selectAtom} from 'jotai/utils'

import {useCallback} from '../hooks/use-callback'
import {useEffect} from '../hooks/use-effect'
import {DELAY_MS, EMPTY_ARRAY, EMPTY_OBJECT} from '../misc/constants'

const create = flow(atomWithImmer, freezeAtom)

const useAtomValueWithDelay =
  // https://github.com/pmndrs/jotai/pull/3264
  (atom, {delay = DELAY_MS, ...options} = EMPTY_OBJECT) => {
    const store = useStore(options)

    const [state, setState] = useThrottledState(() => store.get(atom), {
      wait: delay
    })

    useEffect(
      () =>
        store.sub(atom, () => {
          setState(store.get(atom))
        }),
      [store, atom]
    )

    return state
  }

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
            useAtomValueWithDelay(
              selectAtom(
                atom,
                // https://jotai.org/docs/utilities/select#hold-stable-references
                useCallback(draft => fn({draft}), deps),
                isEqual
              ),
              options
            )
        ),
        useValue: useCallback(function () {
          return this.useSelectValue(({draft}) => draft)
        })
      }
    },
    {
      initial: initialValue
    }
  )
}
