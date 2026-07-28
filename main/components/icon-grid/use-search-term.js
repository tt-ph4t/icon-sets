import {isString} from '@sindresorhus/is'
import {useBatchedCallback} from '@tanstack/react-pacer'
import {last} from 'es-toolkit'
import ms from 'ms'

import {useCallback} from '../../hooks/use-callback'
import {isWordChar} from '../../misc'
import {withImmerAtom} from '../../misc/with-immer-atom'

const context = {
  batcherOptions: {
    wait: ms('.2s')
  },
  default: '',
  isDefault: value => value === context.default,
  parse: value =>
    isString(value)
      ? context.isDefault(value) || isWordChar(value)
        ? value
        : context.parse(value.slice(1))
      : context.default
}

const useStore = withImmerAtom({
  current: context.default
})

export default () => {
  const store = useStore()

  return {
    ...context,
    set: useBatchedCallback(items => {
      store.set(({draft}) => {
        draft.current = context.parse(last(items))
      })
    }, context.batcherOptions),
    useValue: useCallback(() => store.useSelectValue('current').current)
  }
}
