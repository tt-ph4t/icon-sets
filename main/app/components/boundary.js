import {useQueryClient} from '@tanstack/react-query'
import {useUnmount} from 'ahooks'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {renderSlot} from 'render-slot'

import {Fallback} from '../components/fallback'
import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'

const ErrorBoundaryProps = {
  FallbackComponent: component(({error, resetErrorBoundary}) => (
    <Fallback.Error>
      {error.message}
      <Fallback.TryAgainButton onClick={resetErrorBoundary} />
    </Fallback.Error>
  ))
}

const fallback = <Fallback />

export const Boundary = Object.assign(
  component(({children}) => (
    <ErrorBoundary {...ErrorBoundaryProps}>
      <React.Suspense fallback={fallback}>
        <React.Activity>{children}</React.Activity>
      </React.Suspense>
    </ErrorBoundary>
  )),
  {
    Query: component(({query, queryOptions, render}) => {
      const queryClient = useQueryClient()

      const queryFilter = useMemo(
        () => ({
          exact: true,
          queryKey: queryOptions.queryKey
        }),
        [queryOptions.queryKey]
      )

      useUnmount(async () => {
        await queryClient.cancelQueries(queryFilter)
      })

      if (query.isLoading) return fallback

      if (query.isError)
        return (
          <Fallback.Error>
            {query.error.message}
            <Fallback.TryAgainButton
              onClick={async () => {
                await queryClient.resetQueries(queryFilter)
              }}
            />
          </Fallback.Error>
        )

      return (
        <React.Activity>
          {renderSlot({
            bespoke: true,
            default: render
          })}
        </React.Activity>
      )
    })
  }
)
