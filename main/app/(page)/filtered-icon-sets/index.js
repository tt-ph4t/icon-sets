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
import {DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import Filter from './filter'
import useStore from './use-store'

const FilteredIconSets = component(() => {
  const selectedIconSetPrefixes = useStore().useSelectValue(
    ({draft}) => draft.selectedIconSetPrefixes
  )

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: iconSets =>
      Object.values(pick(iconSets, selectedIconSetPrefixes)).flatMap(iconSet =>
        iconSet.icons.map(icon => getId(iconSet.prefix, icon))
      )
  })

  return <IconGrid iconIds={query.data} />
})

export default component(() => {
  const query = useQuery(DEFAULT_QUERY_OPTIONS)

  return (
    <Boundary.Query
      query={query}
      render={() => {
        const init = useStore.useInit()

        return (
          <React.Activity mode={init.isSuccess ? 'visible' : 'hidden'}>
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
          </React.Activity>
        )
      }}
    />
  )
})
