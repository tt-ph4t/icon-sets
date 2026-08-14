import {noop} from 'es-toolkit'
import {
  createContext,
  useContext,
  useContextSelector
} from 'use-context-selector'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {EMPTY} from './constants'

export const buildContext = (defaultValue = EMPTY.OBJECT) => {
  const Context = createContext(defaultValue)

  return {
    initial: defaultValue,
    Provider: component(({children, ...value}) => {
      value = useMemo(() => value, [value])

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
