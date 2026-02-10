import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarButton
} from '@vscode-elements/react-elements'
import { useLocalStorageState } from 'ahooks'
import { union, uniq, without } from 'es-toolkit'
import { castArray } from 'es-toolkit/compat'

import { Menu } from '../shared/components/base-ui/menu'
import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { component } from '../shared/hocs'
import { useCallback } from '../shared/hooks/use-callback'
import { useMemo } from '../shared/hooks/use-memo'
import { getQueryOptions, validateIconId } from '../shared/utils'

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

export const useBookmarkedIcons = () => {
  const [state, setState] = useLocalStorageState('useBookmarkedIcons', {
    defaultValue: [],
    listenStorageChange: true
  })

  const current = useMemo(
    () => castArray(state).filter(validateIconId),
    [state]
  )

  const set = useCallback(fn => {
    setState(state => fn(state).filter(validateIconId))
  })

  return {
    add: useCallback((...iconIds) => {
      set(state => union(iconIds, state))
    }),
    current,
    delete: useCallback((...iconIds) => {
      set(state => without(state, ...iconIds))
    }),
    has: useCallback((...iconIds) =>
      iconIds.every(iconId => current.includes(iconId))
    ),
    reset: useCallback(() => {
      set(() => [])
    }),
    set,
    toggle: useCallback((...iconIds) => {
      set(state => {
        const a = new Set()
        const b = new Set(castArray(state))

        for (const iconId of uniq(iconIds))
          b.has(iconId) ? b.delete(iconId) : a.add(iconId)

        return [...a, ...b]
      })
    })
  }
}

export default component(() => {
  const bookmarkedIcons = useBookmarkedIcons()
  const query = useQuery(queryOptions)

  return (
    <Collapsible
      description={bookmarkedIcons.current.length}
      heading='bookmarked icons'
      keepMounted={false}>
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
