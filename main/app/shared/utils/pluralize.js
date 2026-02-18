import irregularPlurals from 'irregular-plurals'
import pluralizeEsm from 'pluralize-esm'

for (const irregularPlural of irregularPlurals.entries())
  pluralizeEsm.addIrregularRule(...irregularPlural)

export const pluralize = (count, word, inclusive = true) =>
  pluralizeEsm(word, count, inclusive)
