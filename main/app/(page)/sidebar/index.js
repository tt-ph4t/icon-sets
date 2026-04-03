import {useQuery} from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {useUpdate} from 'ahooks'
import {sentenceCase} from 'change-case'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {Boundary} from '../../components/boundary'
import {Collapsible} from '../../components/collapsible'
import {IconGrid} from '../../components/icon-grid'
import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useFavoritedIcons} from '../../hooks/use-favorited-icons'
import {DEFAULT_QUERY_OPTIONS, ICON_CACHE} from '../../misc/constants'
import IconGroups from './icon-groups'
import IconSets from './icon-sets'

const IconGridWithFormContainer = component(props => {
  const query = useQuery(DEFAULT_QUERY_OPTIONS)

  return (
    <Boundary.Query
      query={query}
      render={() => (
        <VscodeFormContainer>
          <VscodeFormGroup variant='settings-group'>
            <VscodeFormHelper
              style={{height: 'var(--sidebar-icon-grid-height)'}}>
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
          {label: 'Reload'},
          {separator: true},
          ...['purgeStale', 'pop', 'clear'].map(a => ({
            label: sentenceCase(a),
            onClick: () => {
              ICON_CACHE[a]()
            }
          }))
        ].map(({onClick = asyncNoop, ...rest}) => ({
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

const FavoritedIcons = component(() => {
  const favoritedIcons = useFavoritedIcons()
  const iconIds = favoritedIcons.get()

  return (
    <Collapsible description={iconIds.length} heading='favorited icons'>
      <IconGridWithFormContainer iconIds={iconIds} />
      <Menu
        data={{
          label: 'Reset',
          onClick: favoritedIcons.reset
        }}
        render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})

export default component(() => (
  <div style={{'--sidebar-icon-grid-height': 'calc(var(--height) / 2)'}}>
    <React.Activity>
      <IconSets />
      <IconGroups />
    </React.Activity>
    <FavoritedIcons />
    <CustomizedIcons />
    <CachedIcons />
  </div>
))
