import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import { useUpdate } from 'ahooks'
import { capitalCase } from 'change-case'
import { asyncNoop } from 'es-toolkit'
import React from 'react'

import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { Menu } from '../shared/components/menu'
import { QueryBoundary } from '../shared/components/query-boundary'
import { ToolbarButton } from '../shared/components/toolbar-button'
import { ICON_CACHE, ICON_SETS_URL } from '../shared/constants'
import { component } from '../shared/hocs'
import { useCustomizedIcons } from '../shared/hooks/use-customized-icons'
import { useFavorites } from '../shared/hooks/use-favorites'
import { getQueryOptions } from '../shared/utils'
import IconGroups from './icon-groups'
import IconSets from './icon-sets'

const queryOptions = getQueryOptions({ url: ICON_SETS_URL })

const IconGridWithFormContainer = component(props => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => (
        <VscodeFormContainer>
          <VscodeFormGroup variant='settings-group'>
            <VscodeFormHelper
              style={{ height: 'var(--sidebar-icon-grid-height)' }}>
              <IconGrid {...props} />
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
      )}
    />
  )
})

const CustomizedIcons = component(() => {
  const customizedIcons = useCustomizedIcons()
  const iconIds = useCustomizedIcons.useIconIds()

  return (
    <Collapsible description={iconIds.length} heading='customized icons'>
      <IconGridWithFormContainer iconIds={iconIds} />
      <Menu
        data={{
          label: 'Reset',
          onClick: () => {
            customizedIcons.delete(...iconIds)
          }
        }}
        render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})

const CachedIcons = component(() => {
  const update = useUpdate()
  const iconIds = [...ICON_CACHE.values()].map(icon => icon.id)

  return (
    <Collapsible
      description={`${iconIds.length} / ${ICON_CACHE.max}`}
      heading='cached icons'
      onToggle={event => {
        if (event.detail.open) update()
      }}>
      <IconGridWithFormContainer iconIds={iconIds} />
      <Menu
        data={[
          { label: 'Reload' },
          { separator: true },
          ...['purgeStale', 'pop', 'clear'].map(a => ({
            label: capitalCase(a),
            onClick: () => {
              ICON_CACHE[a]()
            }
          }))
        ].map(({ onClick = asyncNoop, ...rest }) => ({
          onClick: async () => {
            await onClick()

            update()
          },
          ...rest
        }))}
        render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})

const Favorites = component(() => {
  const favorites = useFavorites()

  return (
    <Collapsible description={favorites.current.length} heading='favorites'>
      <IconGridWithFormContainer iconIds={favorites.current} />
      <Menu
        data={{
          label: 'Reset',
          onClick: favorites.reset
        }}
        render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})

export default component(() => (
  <div style={{ '--sidebar-icon-grid-height': 'calc(var(--height) / 2)' }}>
    <React.Activity>
      <IconSets />
      <IconGroups />
    </React.Activity>
    <Favorites />
    <CustomizedIcons />
    <CachedIcons />
  </div>
))
