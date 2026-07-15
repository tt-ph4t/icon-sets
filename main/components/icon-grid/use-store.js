import {isString} from '@sindresorhus/is'
import {useBatchedCallback} from '@tanstack/react-pacer'
import {last} from 'es-toolkit'
import ms from 'ms'

import {isWordChar} from '../../misc'
import {withImmerAtom} from '../../misc/with-immer-atom'

const searchTerm = {
  batcherOptions: {
    wait: ms('.2s')
  },
  default: '',
  isDefault: value => value === searchTerm.default,
  parse: value =>
    isString(value)
      ? searchTerm.isDefault(value) || isWordChar(value)
        ? value
        : searchTerm.parse(value.slice(1))
      : searchTerm.default
}

const useStore = withImmerAtom({
  searchTerm: searchTerm.default
})

export default () => {
  const store = useStore()

  return {
    ...store,
    searchTerm: {
      ...searchTerm,
      set: useBatchedCallback(items => {
        store.set(({draft}) => {
          draft.searchTerm = searchTerm.parse(last(items))
        })
      }, searchTerm.batcherOptions)
    }
  }
}
