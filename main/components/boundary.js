import {useQueryClient} from '@tanstack/react-query'
import {useUnmount} from 'ahooks'
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
      <Fallback.Error message={error.message} retryFn={resetErrorBoundary} />
    ))
  },
  fallback: <Progress.Bar />
}

export const Boundary = Object.assign(
  component(({children, fallback = defaults.fallback}) => (
    <ErrorBoundary {...defaults.ErrorBoundaryProps}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </ErrorBoundary>
  )),
  {
    Query: component(
      ({
        fallback = defaults.fallback,
        query,
        queryOptions = DEFAULT_QUERY_OPTIONS,
        render,
        renderError
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

        if (query.isLoading) return fallback

        if (query.isError)
          return Slot.render({
            bespoke:
              renderError ??
              (() => (
                <Fallback.Error
                  message={query.error.message}
                  retryFn={async () => {
                    await queryClient.resetQueries(queryClientFilters)
                  }}
                />
              )),
            context: query.error
          })

        return Slot.render(render)
      }
    ),
    with: (Component, fallback) =>
      component(props => (
        <Boundary fallback={fallback}>
          <Component {...props} />
        </Boundary>
      ))
  }
)
