import {useDebouncer} from '@tanstack/react-pacer'
import {useQueryClient} from '@tanstack/react-query'
import {useSetState} from 'ahooks'
import {pick} from 'es-toolkit'
import ms from 'ms'
import React from 'react'

import {Menu} from '../components/menu'
import {ToolbarButton} from '../components/toolbar-button'
import {component} from '../hocs'
import {useCallback} from '../hooks/use-callback'
import {useEffect} from '../hooks/use-effect'
import {QUERY_CLIENT_MENU, REACT_QUERY_STATUS_HOOKS} from '../misc/constants'
import {pluralize} from '../misc/pluralize'

const InternalToolbarButton = component(props => {
  const queryClient = useQueryClient()

  const [state, setState] = useSetState({
    fetchingQueries: 0,
    mutatingQueries: 0,
    totalQueries: 0
  })

  const updateState = useCallback(() => {
    React.startTransition(() => {
      setState({
        fetchingQueries: queryClient.isFetching(),
        mutatingQueries: queryClient.isMutating(),
        totalQueries: queryClient.getQueryCache().getAll().length
      })
    })
  })

  const deps = REACT_QUERY_STATUS_HOOKS.map(hook => hook())

  useEffect.update(updateState, deps)

  return (
    <ToolbarButton onClick={updateState} {...props}>
      {pluralize(state.totalQueries, 'query')}
    </ToolbarButton>
  )
})

export default component(() => {
  const queryClient = useQueryClient()

  const debouncer = useDebouncer(
    async a => {
      await queryClient[a]()
    },
    {
      wait: ms('1s')
    }
  )

  return (
    <Menu
      data={[
        ...QUERY_CLIENT_MENU.map(([a, b]) => ({
          label: a,
          onClick: () => {
            debouncer.maybeExecute(b)
          }
        })),
        {separator: true},
        {
          label: 'Clear',
          onClick: () => {
            debouncer.maybeExecute('clear')
          }
        }
      ]}
      render={
        <div>
          <debouncer.Subscribe selector={state => pick(state, ['isPending'])}>
            {debouncerState => (
              <InternalToolbarButton
                checked={debouncerState.isPending}
                preventToggle
              />
            )}
          </debouncer.Subscribe>
        </div>
      }
    />
  )
})
