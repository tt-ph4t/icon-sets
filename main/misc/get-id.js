import {isPrimitive} from '@sindresorhus/is'
import {hash} from 'ohash'

import {ID_SEPARATOR} from './constants'

export const getId = (...values) =>
  values
    .map(value => (isPrimitive(value) ? String : hash)(value))
    .join(ID_SEPARATOR)
