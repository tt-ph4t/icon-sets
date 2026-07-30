import {useQueryClient} from '@tanstack/react-query'
import {useUnmount} from 'ahooks'
import {play} from 'cuelume'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {Fallback} from '../components/fallback'
import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {DEFAULT_QUERY_OPTIONS} from '../misc/constants'
import {Progress} from './progress'
import {Slot} from './slot'

const defaults = {
  ErrorBoundaryProps: {
    FallbackComponent: component(({error, resetErrorBoundary}) => (
      <Fallback.Error error={error} onRetry={resetErrorBoundary} />
    )),
    onError: () => {
      play('error')
    }
  },
  fallback: <Progress.Bar />
}

export const Boundary = Object.assign(
  component(({children, fallback = defaults.fallback, ...props}) => (
    <Boundary.Error
      FallbackComponent={defaults.ErrorBoundaryProps.FallbackComponent}
      {...props}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </Boundary.Error>
  )),
  {
    Error: component(props => (
      <Slot onError={defaults.ErrorBoundaryProps.onError}>
        <ErrorBoundary {...props} />
      </Slot>
    )),
    Query: component(
      ({
        fallback = defaults.fallback,
        query,
        queryOptions = DEFAULT_QUERY_OPTIONS,
        render,
        renderError = true
      }) => {
        const queryClient = useQueryClient()

        const queryClientFilters = useMemo(
          () => ({
            exact: true,
            queryKey: queryOptions.queryKey
          }),
          [queryOptions.queryKey]
        )

        useUnmount(async () => {
          await queryClient.cancelQueries(queryClientFilters)
        })

        if (query.isLoading)
          return Slot.render({
            bespoke: fallback
          })

        if (query.isError)
          return Slot.render({
            bespoke: renderError,
            default: props => (
              <Slot
                onRetry={async () => {
                  await queryClient.resetQueries(queryClientFilters)
                }}>
                <Fallback.Error error={query.error} {...props} />
              </Slot>
            )
          })

        return Slot.render(render)
      }
    ),
    with: (Component, BoundaryProps) =>
      component(props => (
        <Boundary {...BoundaryProps}>
          <Component {...props} />
        </Boundary>
      ))
  }
)
