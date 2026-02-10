import { useQueryClient } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel
} from '@vscode-elements/react-elements'
import { useUnmount } from 'ahooks'
import React from 'react'

import { component } from '../hocs'
import { useMemo } from '../hooks/use-memo'
import { progressBar } from './'
import { ButtonGroup } from './button-group'

export const QueryBoundary = component(
  ({ query, queryOptions, render: Render }) => {
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

    if (query.isLoading) return progressBar.default

    if (query.isError)
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
          {progressBar.error}
          <VscodeFormContainer
            style={{
              alignContent: 'center',
              alignSelf: 'center',
              flexGrow: 1
            }}>
            <VscodeFormGroup variant='settings-group'>
              <VscodeLabel required>Error</VscodeLabel>
              <VscodeFormHelper>
                {query.error.message}
                <div>
                  <ButtonGroup
                    menu={[
                      {
                        label: 'Invalidate',
                        onClick: async () => {
                          await queryClient.invalidateQueries(queryFilter)
                        }
                      },
                      {
                        label: 'Reset',
                        onClick: async () => {
                          await queryClient.resetQueries(queryFilter)
                        }
                      }
                    ]}
                    onClick={async () => {
                      await queryClient.refetchQueries(queryFilter)
                    }}>
                    Try again
                  </ButtonGroup>
                </div>
              </VscodeFormHelper>
            </VscodeFormGroup>
          </VscodeFormContainer>
        </div>
      )

    return (
      <React.Activity>
        <Render />
      </React.Activity>
    )
  }
)
