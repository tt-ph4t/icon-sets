import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import { pick } from 'es-toolkit'
import React from 'react'

import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { ICON_SETS_URL } from '../shared/constants'
import { component } from '../shared/hocs'
import { useCallback } from '../shared/hooks/use-callback'
import { getId, getQueryOptions } from '../shared/utils'
import Filter, { useFilter } from './filter'

const queryOptions = getQueryOptions({
  url: ICON_SETS_URL
})

const IconSets = component(() => {
  const selectedIconSetPrefixes = useFilter().useSelectValue(
    ({ draft }) => draft.selectedIconSetPrefixes
  )

  const query = useQuery({
    ...queryOptions,
    select: useCallback(
      iconSets =>
        Object.values(pick(iconSets, selectedIconSetPrefixes)).flatMap(
          iconSet => iconSet.icons.map(icon => getId(iconSet.prefix, icon))
        ),
      [selectedIconSetPrefixes]
    )
  })

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => <IconGrid iconIds={query.data} />}
    />
  )
})

export default component(() => (
  <div
    style={{
      flexGrow: 1,
      position: 'relative'
    }}>
    <IconSets />
    <VscodeFormContainer
      style={{
        left: 0,
        position: 'absolute',
        top: 0
      }}>
      <VscodeFormGroup variant='settings-group'>
        <VscodeFormHelper>
          <React.Activity>
            <Filter />
          </React.Activity>
        </VscodeFormHelper>
      </VscodeFormGroup>
    </VscodeFormContainer>
  </div>
))
