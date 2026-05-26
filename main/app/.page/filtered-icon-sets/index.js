import {useQuery} from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {pick} from 'es-toolkit'
import React from 'react'

import {Boundary} from '../../components/boundary'
import {Fallback} from '../../components/fallback'
import {IconGrid} from '../../components/icon-grid'
import {component} from '../../hocs'
import {useRemount} from '../../hooks/use-remount'
import {getId} from '../../misc'
import {DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import Filters from './filters'
import {useStore} from './misc'

const InternalIconGrid = component(() => {
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

export default useRemount.with(
  component(({INTERNAL_REMOUNT}) => {
    const query = useQuery(DEFAULT_QUERY_OPTIONS)

    return (
      <Boundary.Query
        query={query}
        render={() => {
          const init = useStore.useInit()

          return init.isError ? (
            <Fallback.Error
              message={init.error.message}
              retryFn={INTERNAL_REMOUNT}
            />
          ) : (
            <div
              style={{
                flexGrow: 1,
                position: 'relative'
              }}>
              <React.Activity>
                <InternalIconGrid />
              </React.Activity>
              <VscodeFormContainer
                style={{
                  left: 0,
                  position: 'absolute',
                  top: 0
                }}>
                <VscodeFormGroup variant='settings-group'>
                  <VscodeFormHelper>
                    <Filters />
                  </VscodeFormHelper>
                </VscodeFormGroup>
              </VscodeFormContainer>
            </div>
          )
        }}
      />
    )
  })
)
