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
import { useCustomizedIcons } from '../shared/hooks/use-customized-icons'
import { getQueryOptions } from '../shared/utils'

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

export default component(() => {
  const query = useQuery(queryOptions)
  const customizedIcons = useCustomizedIcons()
  const iconIds = useCustomizedIcons.useIconIds()

  return (
    <Collapsible description={iconIds.length} heading='customized icons'>
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
          {
            label: 'Reset',
            onClick: () => {
              customizedIcons.delete(...iconIds)
            }
          }
        ]}
        render={<VscodeToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    </Collapsible>
  )
})
