import { useUpdate } from 'ahooks'
import { capitalCase } from 'change-case'
import { asyncNoop } from 'es-toolkit'
import React from 'react'

import { Menu } from '../shared/components/base-ui/menu'
import { Collapsible } from '../shared/components/collapsible'
import { ToolbarButton } from '../shared/components/toolbar-button'
import { ICON_CACHE } from '../shared/constants'
import { component } from '../shared/hocs'
import { useBookmarkedIcons } from '../shared/hooks/use-bookmarked-icons'
import { useCustomizedIcons } from '../shared/hooks/use-customized-icons'
import IconGrid from './components/icon-grid'
import IconGroups from './icon-groups'
import IconSets from './icon-sets'

const CustomizedIcons = component(() => {
  const customizedIcons = useCustomizedIcons()
  const iconIds = useCustomizedIcons.useIconIds()

  return (
    <Collapsible description={iconIds.length} heading='customized icons'>
      <IconGrid iconIds={iconIds} />
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
      description={iconIds.length}
      heading='cached icons'
      onToggle={event => {
        if (event.detail.open) update()
      }}>
      <IconGrid iconIds={iconIds} />
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

const BookmarkedIcons = component(() => {
  const bookmarkedIcons = useBookmarkedIcons()

  return (
    <Collapsible
      description={bookmarkedIcons.current.length}
      heading='bookmarked icons'>
      <IconGrid iconIds={bookmarkedIcons.current} />
      <Menu
        data={{
          label: 'Reset',
          onClick: bookmarkedIcons.reset
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
    <BookmarkedIcons />
    <CustomizedIcons />
    <CachedIcons />
  </div>
))
