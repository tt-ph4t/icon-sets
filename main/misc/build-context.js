import {pick} from 'es-toolkit'
import {
  createContext,
  useContext,
  useContextSelector
} from 'use-context-selector'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {isSyncFunction} from './'
import {EMPTY} from './constants'

export const buildContext = (defaultValue = EMPTY.OBJECT) => {
  const Context = createContext(defaultValue)

  return {
    initial: defaultValue,
    Provider: component(({children, ...value}) => {
      value = useMemo(() => value, [value])

      return <Context.Provider value={value}>{children}</Context.Provider>
    }),
    useSelectValue: (...args) => {
      const [selector] = args
      const isSelector = isSyncFunction(selector)

      return useContextSelector(Context, context =>
        isSelector
          ? selector({
              context
            })
          : pick(context, args)
      )
    },
    useValue: (context = Context) => useContext(context)
  }
}
