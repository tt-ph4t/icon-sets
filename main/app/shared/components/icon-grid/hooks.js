import uFuzzy from '@leeoniya/ufuzzy'
import { castArray } from 'es-toolkit/compat'
import { isWordCharacter } from 'is-word-character'
import React from 'react'

import { withImmerAtom } from '../../hocs'
import { useMemo } from '../../hooks/use-memo'
import { validateIconId } from '../../utils'

const uf = new uFuzzy()

export const useSearchTerm = withImmerAtom({ current: '' })

export const useFilteredIconIds = iconIds => {
  iconIds = useMemo(() => castArray(iconIds).filter(validateIconId), [iconIds])

  const searchTerm = useSearchTerm()
  const isInitSearchTerm = searchTerm.useIsInit()

  const deferredSearchTermCurrent = React.useDeferredValue(
    searchTerm.useSelectValue(({ draft }) => draft.current)
  )

  return useMemo(
    () =>
      isInitSearchTerm
        ? iconIds
        : isWordCharacter(deferredSearchTermCurrent)
          ? uf
              .search(iconIds, deferredSearchTermCurrent)[0]
              .map(index => iconIds[index])
          : [],
    [isInitSearchTerm, iconIds, deferredSearchTermCurrent]
  )
}
