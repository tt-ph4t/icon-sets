import {isBigint} from '@sindresorhus/is'
import {identity, size} from 'es-toolkit/compat'
import irregularPlurals from 'irregular-plurals'
import is_number from 'is-number'
import pluralizeEsm from 'pluralize-esm'
import prettyNum from 'pretty-num'

for (const irregularPlural of irregularPlurals.entries())
  pluralizeEsm.addIrregularRule(...irregularPlural)

export const pluralize = (count, word, inclusive = true) => {
  count = Number((is_number(count) || isBigint(count) ? identity : size)(count))
  word = pluralizeEsm(word, count)

  return inclusive
    ? `${prettyNum(count, {
        thousandsSeparator: ' '
      })} ${word}`
    : word
}
