import {isBigint} from '@sindresorhus/is'
import {identity, size} from 'es-toolkit/compat'
import irregularPlurals from 'irregular-plurals'
import is_number from 'is-number'
import pluralizeEsm from 'pluralize-esm'

for (const irregularPlural of irregularPlurals.entries())
  pluralizeEsm.addIrregularRule(...irregularPlural)

export const pluralize = (count, word, inclusive = true) =>
  pluralizeEsm(
    word,
    Number((is_number(count) || isBigint(count) ? identity : size)(count)),
    inclusive
  )
