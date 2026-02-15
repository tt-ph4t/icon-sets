import uFuzzy from '@leeoniya/ufuzzy'
import { castArray } from 'es-toolkit/compat'
import { isWordCharacter } from 'is-word-character'
import React from 'react'

import { withImmerAtom } from '../../hocs'
import { useMemo } from '../../hooks/use-memo'
import { validateIconId } from '../../utils'

const uf = new uFuzzy()

export const useSearchTerm = withImmerAtom({ current: '' })

export const useFilteredIconIds = (searchTerm, iconIds) => {
  iconIds = useMemo(() => castArray(iconIds).filter(validateIconId), [iconIds])

  const deferredSearchTerm = React.useDeferredValue(searchTerm)

  const isInitialSearchTerm =
    useSearchTerm().init.current === deferredSearchTerm

  return useMemo(
    () =>
      isInitialSearchTerm
        ? iconIds
        : isWordCharacter(deferredSearchTerm)
          ? uf
              .search(iconIds, deferredSearchTerm)[0]
              .map(index => iconIds[index])
          : [],
    [isInitialSearchTerm, iconIds, deferredSearchTerm]
  )
}
