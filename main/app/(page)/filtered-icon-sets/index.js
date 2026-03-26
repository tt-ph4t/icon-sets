import {useQuery} from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {pick} from 'es-toolkit'
import React from 'react'

import {Boundary} from '../../components/boundary'
import {IconGrid} from '../../components/icon-grid'
import {component} from '../../hocs'
import {getId} from '../../misc'
import {ICON_SETS_URL} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import Filter from './filter'
import useStore from './use-store'

const queryOptions = getQueryOptions({
  url: ICON_SETS_URL
})

const FilteredIconSets = component(() => {
  const selectedIconSetPrefixes = useStore().useSelectValue(
    ({draft}) => draft.selectedIconSetPrefixes
  )

  const query = useQuery({
    ...queryOptions,
    select: iconSets =>
      Object.values(pick(iconSets, selectedIconSetPrefixes)).flatMap(iconSet =>
        iconSet.icons.map(icon => getId(iconSet.prefix, icon))
      )
  })

  return <IconGrid iconIds={query.data} />
})

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <Boundary.Query
      query={query}
      queryOptions={queryOptions}
      render={() => {
        useStore.useInit()

        return (
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
        )
      }}
    />
  )
})
