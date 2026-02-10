import { flow, partial } from 'es-toolkit'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithImmer } from 'jotai-immer'
import { freezeAtom, selectAtom } from 'jotai/utils'
import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { progressBar } from './components'
import { useCallback } from './hooks/use-callback'
import { isEqual } from './utils'

export const withImmerAtom = initialValue =>
  partial(atom => {
    const setAtom = useSetAtom(atom)

    return {
      init: atom.init,
      // https://jotai.org/docs/utilities/resettable
      reset: useCallback(() => {
        setAtom(atom.init)
      }),
      set: useCallback(fn => {
        setAtom(draft => {
          fn({ draft })
        })
      }),
      get useIsInit() {
        return useCallback(() =>
          isEqual(
            this.useSelectValue(({ draft }) => draft),
            atom.init
          )
        )
      },
      useSelectValue: useCallback((fn, deps = []) =>
        useAtomValue(
          selectAtom(
            atom,
            // https://jotai.org/docs/utilities/select#hold-stable-references
            useCallback(draft => fn({ draft }), deps),
            isEqual
          ),
          { delay: import.meta.env.VITE_DELAY_MS }
        )
      )
    }
  }, flow(atomWithImmer, freezeAtom)(initialValue))

export const lazy = (load, fallback = progressBar) => {
  const Component = React.lazy(load)

  return component(props => (
    <ErrorBoundary fallback={fallback.error}>
      <React.Suspense fallback={fallback.default}>
        <Component {...props} />
      </React.Suspense>
    </ErrorBoundary>
  ))
}

export const component = Component =>
  React.memo(
    props => (
      <React.Activity>
        <Component {...props} />
      </React.Activity>
    ),
    isEqual
  )
