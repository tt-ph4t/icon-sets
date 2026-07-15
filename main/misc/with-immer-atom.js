import {isFunction} from '@sindresorhus/is'
import {useThrottledState} from '@tanstack/react-pacer'
import {isEqual} from '@ver0/deep-equal'
import deepFreeze from 'deep-freeze-es6'
import {flow, noop, pick} from 'es-toolkit'
import {useSetAtom, useStore} from 'jotai'
import {atomWithImmer} from 'jotai-immer'
import {freezeAtom, selectAtom} from 'jotai/utils'

import {useCallback} from '../hooks/use-callback'
import {useEffect} from '../hooks/use-effect'
import {hasValues} from './'
import {DELAY_MS, EMPTY} from './constants'

const create = flow(atomWithImmer, freezeAtom)
const draftKey = 'draft'
const selectDraft = ({[draftKey]: draft}) => draft

const useAtomValueWithDelay =
  // https://github.com/pmndrs/jotai/pull/3264
  (atom, {delay = DELAY_MS, ...options} = EMPTY.OBJECT) => {
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

export const withImmerAtom = (initialValue = EMPTY.OBJECT) => {
  const atom = create((initialValue = deepFreeze(initialValue)))
  const useValue = () => useSelectValue(selectDraft)

  const useSelectValue = (...args) => {
    const [, {deps = EMPTY.ARRAY, ...options} = EMPTY.OBJECT] = args
    const [selector] = args
    const isSelector = isFunction(selector)

    return useAtomValueWithDelay(
      // eslint-disable-next-line react-doctor/jotai-select-atom-in-render-body
      selectAtom(
        atom,
        // https://jotai.org/docs/utilities/select#hold-stable-references
        useCallback(
          draft =>
            isSelector ? selector({[draftKey]: draft}) : pick(draft, args),
          deps
        ),
        isEqual
      ),
      options
    )
  }

  return Object.assign(
    () => {
      const setAtom = useSetAtom(atom)

      return {
        // https://jotai.org/docs/utilities/resettable
        reset: useCallback((...keys) => {
          setAtom(
            hasValues(keys)
              ? draft => {
                  for (const key of keys) draft[key] = initialValue[key]
                }
              : initialValue
          )
        }),
        set: useCallback((fn = noop) => {
          setAtom(draft => {
            fn({[draftKey]: draft})
          })
        }),
        useSelectValue,
        useValue
      }
    },
    {
      initial: initialValue
    }
  )
}
