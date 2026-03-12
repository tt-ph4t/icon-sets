import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import { pick } from 'es-toolkit'
import React from 'react'

import { IconGrid } from '../../components/icon-grid'
import { QueryBoundary } from '../../components/query-boundary'
import { ICON_SETS_URL } from '../../constants'
import { component } from '../../hocs'
import { getId, getQueryOptions } from '../../utils'
import Filter from './filter'
import { useStore } from './hooks'

const FilteredIconSets = component(() => {
  const selectedIconSetPrefixes = useStore().useSelectValue(
    ({ draft }) => draft.selectedIconSetPrefixes
  )

  const queryOptions = getQueryOptions({
    select: iconSets =>
      Object.values(pick(iconSets, selectedIconSetPrefixes)).flatMap(iconSet =>
        iconSet.icons.map(icon => getId(iconSet.prefix, icon))
      ),
    url: ICON_SETS_URL
  })

  const query = useQuery(queryOptions)

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
    <React.Activity>
      <FilteredIconSets />
    </React.Activity>
    <VscodeFormContainer
      style={{
        left: 0,
        position: 'absolute',
        top: 0
      }}>
      <VscodeFormGroup variant='settings-group'>
        <VscodeFormHelper>
          <Filter />
        </VscodeFormHelper>
      </VscodeFormGroup>
    </VscodeFormContainer>
  </div>
))
