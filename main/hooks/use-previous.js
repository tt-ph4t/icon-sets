import {isEqual} from '@ver0/deep-equal'
import {usePrevious as _usePrevious} from 'ahooks'
import {negate} from 'es-toolkit'

const shouldUpdate = negate(isEqual)

export const usePrevious = state => _usePrevious(state, shouldUpdate)
