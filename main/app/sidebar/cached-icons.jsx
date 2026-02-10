import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarButton
} from '@vscode-elements/react-elements'
import { useUpdate } from 'ahooks'
import { asyncNoop } from 'es-toolkit'

import { Menu } from '../shared/components/base-ui/menu'
import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { component } from '../shared/hocs'
import { iconCache } from '../shared/hooks/use-icon-queries/build-icon'
import { getQueryOptions } from '../shared/utils'

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

export default component(() => {
  const update = useUpdate()
  const query = useQuery(queryOptions)
  const iconIds = [...iconCache.values()].map(icon => icon.id)

  return (
    <Collapsible
      description={iconIds.length}
      heading='cached icons'
      keepMounted={false}
      onToggle={event => {
        if (event.detail.open) update()
      }}>
      <QueryBoundary
        query={query}
        queryOptions={queryOptions}
        render={() => (
          <VscodeFormContainer>
            <VscodeFormGroup variant='settings-group'>
              <VscodeFormHelper
                style={{ height: 'var(--sidebar-icon-grid-height)' }}>
                <IconGrid iconIds={iconIds} />
              </VscodeFormHelper>
            </VscodeFormGroup>
          </VscodeFormContainer>
        )}
      />
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
