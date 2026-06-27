import {flow, xor} from 'es-toolkit'

import {hasValues} from '../../misc'
import {EMPTY} from '../../misc/constants'
import {withImmerAtom} from '../../misc/with-immer-atom'

export const isFiltered = flow(xor, hasValues)

export const useStore = withImmerAtom({
  selectedIconSetPrefixes: EMPTY.ARRAY
})
