import {isEqual} from '@ver0/deep-equal'
import deepFreeze from 'deep-freeze-es6'
import {flow, noop, pick} from 'es-toolkit'
import {useAtomValue, useSetAtom} from 'jotai'
import {atomWithImmer} from 'jotai-immer'
import {freezeAtom, selectAtom} from 'jotai/utils'

import {useCallback} from '../hooks/use-callback'
import {hasValues, isSyncFunction} from './'
import {EMPTY} from './constants'

const create = flow(atomWithImmer, freezeAtom)
const draftKey = 'draft'
const selectDraft = ({[draftKey]: draft}) => draft

// https://immerjs.github.io/immer/update-patterns
export const withImmerAtom = (initialValue = EMPTY.OBJECT) => {
  const atom = create((initialValue = deepFreeze(initialValue)))
  const useValue = () => useSelectValue(selectDraft)

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
