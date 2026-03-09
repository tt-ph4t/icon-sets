import { useQueryClient } from '@tanstack/react-query'
import { useUnmount } from 'ahooks'
import React from 'react'

import { component } from '../hocs'
import { useMemo } from '../hooks/use-memo'
import { Fallback } from './fallback'

export const QueryBoundary = component(
  ({ query, queryOptions, render: Render = React.Fragment }) => {
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

    if (query.isLoading) return <Fallback />

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
        <Render />
      </React.Activity>
    )
  }
)
