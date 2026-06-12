import ms from 'ms'
import {createParser, throttle, useQueryState} from 'nuqs'

import {isWordCharacter} from '../../misc'

const parse = value =>
  isDefault(value) || isWordCharacter(value) ? value : parse(value.slice(1))

const defaultSearchQueryState = ''

const options = createParser({
  parse,
  serialize: parse
})
  .withDefault(defaultSearchQueryState)
  .withOptions({
    limitUrlUpdates: throttle(ms('1s'))
  })

const isDefault = value => value === defaultSearchQueryState

export default Object.assign(() => useQueryState('search', options), {
  isDefault
})
