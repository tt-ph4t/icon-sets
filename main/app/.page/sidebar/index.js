import {useQuery} from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {useUpdate} from 'ahooks'
import {sentenceCase} from 'change-case'
import React from 'react'

import {Boundary} from '../../components/boundary'
import {Collapsible} from '../../components/collapsible'
import {IconGrid} from '../../components/icon-grid'
import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useFavoritedIcons} from '../../hooks/use-favorited-icons'
import {hasValues} from '../../misc'
import {DEFAULT_QUERY_OPTIONS, ICON_CACHE} from '../../misc/constants'
import IconGroups from './icon-groups'
import IconSets from './icon-sets'

const InternalIconGrid = component(({menu, ...props}) => {
  const query = useQuery(DEFAULT_QUERY_OPTIONS)

  return (
    <Boundary.Query
      query={query}
      render={() => (
        <>
          <VscodeFormContainer>
            <VscodeFormGroup variant='settings-group'>
              <VscodeFormHelper
                style={{
                  height: 'var(--sidebar-icon-grid-height)'
                }}>
                <IconGrid {...props} />
              </VscodeFormHelper>
            </VscodeFormGroup>
          </VscodeFormContainer>
          {hasValues(menu) && (
            <Menu
              data={menu}
              render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
            />
          )}
        </>
      )}
    />
  )
})

const CustomizedIcons = component(() => {
  const customizedIcons = useCustomizedIcons()

  const iconIds = customizedIcons.store.useSelectValue(({draft}) =>
    Object.keys(draft.current)
  )

  return (
    <Collapsible description={iconIds.length} heading='customized icons'>
      <InternalIconGrid
        iconIds={iconIds}
        menu={{
          label: 'Reset',
          onClick: () => {
            customizedIcons.delete(...iconIds)
          }
        }}
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
      <InternalIconGrid
        iconIds={iconIds}
        menu={[
          {
            label: 'Update',
            onClick: update
          },
          {
            separator: true
          },
          ...['purgeStale', 'pop', 'clear'].map(a => ({
            label: sentenceCase(a),
            onClick: () => {
              ICON_CACHE[a]()
              update()
            }
          }))
        ]}
      />
    </Collapsible>
  )
})

const FavoritedIcons = component(() => {
  const favoritedIcons = useFavoritedIcons()
  const iconIds = favoritedIcons.get()

  return (
    <Collapsible description={iconIds.length} heading='favorited icons'>
      <InternalIconGrid
        iconIds={iconIds}
        menu={{
          label: 'Reset',
          onClick: favoritedIcons.reset
        }}
      />
    </Collapsible>
  )
})

export default component(() => (
  <div
    style={{
      '--sidebar-icon-grid-height': 'calc(var(--height) / 2)'
    }}>
    <React.Activity>
      <IconSets />
      <IconGroups />
    </React.Activity>
    <FavoritedIcons />
    <CustomizedIcons />
    <CachedIcons />
  </div>
))
