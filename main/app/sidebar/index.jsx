import { VscodeToolbarButton } from '@vscode-elements/react-elements'
import { useUpdate } from 'ahooks'
import { asyncNoop } from 'es-toolkit'
import React from 'react'

import { Menu } from '../shared/components/base-ui/menu'
import { Collapsible } from '../shared/components/collapsible'
import { component } from '../shared/hocs'
import { useBookmarkedIcons } from '../shared/hooks/use-bookmarked-icons'
import { useCustomizedIcons } from '../shared/hooks/use-customized-icons'
import { iconCache } from '../shared/hooks/use-icon-queries/build-icon'
import Characters from './characters'
import IconGrid from './icon-grid'
import IconSets from './icon-sets'

const CustomizedIcons = component(() => {
  const customizedIcons = useCustomizedIcons()
  const iconIds = useCustomizedIcons.useIconIds()

  return (
    <Collapsible
      description={iconIds.length}
      heading='customized icons'
      keepMounted={false}>
      <IconGrid iconIds={iconIds} />
      <Menu
        data={{
          label: 'Reset',
          onClick: () => {
            customizedIcons.delete(...iconIds)
          }
        }}
        render={<VscodeToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})

const CachedIcons = component(() => {
  const update = useUpdate()
  const iconIds = [...iconCache.values()].map(icon => icon.id)

  return (
    <Collapsible
      description={iconIds.length}
      heading='cached icons'
      keepMounted={false}
      onToggle={event => {
        if (event.detail.open) update()
      }}>
      <IconGrid iconIds={iconIds} />
      <Menu
        data={[
          { label: 'Reload' },
          { separator: true },
          {
            label: 'Purge Stale',
            onClick: () => {
              iconCache.purgeStale()
            }
          },
          {
            label: 'Pop',
            onClick: () => {
              iconCache.pop()
            }
          },
          {
            label: 'Clear',
            onClick: () => {
              iconCache.clear()
            }
          }
        ].map(({ onClick = asyncNoop, ...rest }) => ({
          onClick: async () => {
            await onClick()

            update()
          },
          ...rest
        }))}
        render={<VscodeToolbarButton icon='kebab-vertical' slot='actions' />}
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
        render={<VscodeToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})

export default component(() => (
  <div style={{ '--sidebar-icon-grid-height': 'calc(var(--height) / 2)' }}>
    <React.Activity>
      <IconSets />
    </React.Activity>
    <BookmarkedIcons />
    <CustomizedIcons />
    <React.Activity>
      <CachedIcons />
      <Characters />
    </React.Activity>
  </div>
))
