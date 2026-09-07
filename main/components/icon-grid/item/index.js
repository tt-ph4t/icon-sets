import {identity} from 'es-toolkit'
import {AccessibleIcon} from 'radix-ui'
import React from 'react'

import {component} from '../../../hocs'
import {useCustomizedIcons} from '../../../hooks/use-customized-icons'
import {useIconQuery} from '../../../hooks/use-icon-query'
import withMenuAndBadgeActions from './with-menu-and-badge-actions'
import withQueryBoundary from './with-query-boundary'

const width = 'calc(var(--SPACING) * 12)'

export default withQueryBoundary(
  withMenuAndBadgeActions(
    component(({iconId, ...props}) => {
      const {global: globalIconCustomisations} = useCustomizedIcons
        .useStore()
        .useSelectValue('global')

      const iconQuery = useIconQuery(iconId, {
        select: identity
      })

      return (
        <AccessibleIcon.Root label={iconQuery.data.id}>
          {React.cloneElement(iconQuery.data.more.to.reactElement, {
            height: globalIconCustomisations.square ? width : '100%',
            width,
            ...props
          })}
        </AccessibleIcon.Root>
      )
    })
  )
)
