import {useQueryClient} from '@tanstack/react-query'
import {useUnmount} from 'ahooks'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {Fallback} from '../components/fallback'
import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {DEFAULT_QUERY_OPTIONS} from '../misc/constants'
import {renderSlot} from '../misc/render-slot'
import {Progress} from './progress'

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
      <React.Suspense fallback={fallback}>
        <React.Activity>{children}</React.Activity>
      </React.Suspense>
    </ErrorBoundary>
  )),
  {
    Query: component(
      ({
        fallback = defaults.fallback,
        query,
        queryOptions = DEFAULT_QUERY_OPTIONS,
        render
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
          return (
            <Fallback.Error
              message={query.error.message}
              retryFn={async () => {
                await queryClient.resetQueries(queryClientFilters)
              }}
            />
          )

        return renderSlot({
          bespoke: true,
          default: render
        })
      }
    ),
    with: Component =>
      component(props => (
        <Boundary>
          <Component {...props} />
        </Boundary>
      ))
  }
)
