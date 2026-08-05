import {noop} from 'es-toolkit'
import {
  createContext,
  useContext,
  useContextSelector
} from 'use-context-selector'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {EMPTY} from './constants'

export const buildContext = (defaultValues = EMPTY.OBJECT) => {
  const Context = createContext(defaultValues)

  return {
    Provider: component(({children, ...defaultValues}) => {
      const value = useMemo(() => defaultValues, [defaultValues])

      return <Context.Provider value={value}>{children}</Context.Provider>
    }),
    useSelectValue: (selector = noop) =>
      useContextSelector(Context, context =>
        selector({
          context
        })
      ),
    useValue: (context = Context) => useContext(context)
  }
}
