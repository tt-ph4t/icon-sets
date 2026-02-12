import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarButton
} from '@vscode-elements/react-elements'

import { Menu } from '../shared/components/base-ui/menu'
import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { component } from '../shared/hocs'
import { useBookmarkedIcons } from '../shared/hooks/use-bookmarked-icons'
import { getQueryOptions } from '../shared/utils'

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

export default component(() => {
  const bookmarkedIcons = useBookmarkedIcons()
  const query = useQuery(queryOptions)

  return (
    <Collapsible
      description={bookmarkedIcons.current.length}
      heading='bookmarked icons'>
      <QueryBoundary
        query={query}
        queryOptions={queryOptions}
        render={() => (
          <VscodeFormContainer>
            <VscodeFormGroup variant='settings-group'>
              <VscodeFormHelper
                style={{ height: 'var(--sidebar-icon-grid-height)' }}>
                <IconGrid iconIds={bookmarkedIcons.current} />
              </VscodeFormHelper>
            </VscodeFormGroup>
          </VscodeFormContainer>
        )}
      />
      <Menu
        data={[
          {
            label: 'Reset',
            onClick: bookmarkedIcons.reset
          }
        ]}
        render={<VscodeToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})
