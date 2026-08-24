import {isBoolean} from '@sindresorhus/is'
import {isEqual} from '@ver0/deep-equal'
import {deepFreeze, flow, noop, pick} from 'es-toolkit'
import {useAtomValue, useSetAtom} from 'jotai'
import {atomWithImmer} from 'jotai-immer'
import {freezeAtom, selectAtom} from 'jotai/utils'

import {useCallback} from '../hooks/use-callback'
import {hasValues, isSyncFunction} from './'
import {EMPTY} from './constants'

const create = flow(atomWithImmer, freezeAtom)
const selectValue = ({draft}) => draft

// https://immerjs.github.io/immer/update-patterns
export const withImmerAtom = (initialValue = EMPTY.OBJECT) => {
  const atom = create((initialValue = deepFreeze(initialValue)))
  const useValue = () => useSelectValue(selectValue)

  const useSelectValue = (...args) => {
    const [, {deps = EMPTY.ARRAY, ...options} = EMPTY.OBJECT] = args
    const [selector] = args
    const isSelector = isSyncFunction(selector)

    return useAtomValue(
      // eslint-disable-next-line react-doctor/jotai-select-atom-in-render-body
      selectAtom(
        atom,
        // https://jotai.org/docs/utilities/select#hold-stable-references
        useCallback(
          (draft, prevSlice) =>
            isSelector
              ? selector({
                  draft,
                  prevSlice
                })
              : pick(draft, args),
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
                  for (const key of keys)
                    if (key in initialValue) draft[key] = initialValue[key]
                }
              : initialValue
          )
        }),
        set: useCallback((fn = noop) => {
          if (isSyncFunction(fn))
            setAtom(draft => {
              fn({
                draft
              })
            })
        }),
        toggle: useCallback((...keys) => {
          setAtom(draft => {
            for (const key of keys) {
              const value = draft[key]

              if (isBoolean(value)) draft[key] = !value
            }
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
