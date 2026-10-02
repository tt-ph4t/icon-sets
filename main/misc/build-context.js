import {partial, pick} from 'es-toolkit'
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

  return Object.assign(
    component(({children, ...props}) => (
      <Context.Provider value={useMemo(() => props, [props])}>
        {children}
      </Context.Provider>
    )),
    {
      initial: defaultValue,
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
      useValue: partial(useContext, Context)
    }
  )
}
