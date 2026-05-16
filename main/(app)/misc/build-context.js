/* eslint-disable @eslint-react/no-context-provider */

import {noop} from 'es-toolkit'
import {createContext, useContextSelector} from 'use-context-selector'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {EMPTY_OBJECT} from './constants'

export const buildContext = (defaultValues = EMPTY_OBJECT) => {
  const Context = createContext(defaultValues)

  return {
    Provider: component(({children, ...defaultValues}) => {
      const value = useMemo(() => defaultValues, [defaultValues])

      return <Context.Provider value={value}>{children}</Context.Provider>
    }),
    useContext: (selector = noop) => useContextSelector(Context, selector)
  }
}
