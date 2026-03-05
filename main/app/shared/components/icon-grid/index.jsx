import {
  VscodeBadge,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel,
  VscodeTextfield
} from '@vscode-elements/react-elements'
import { capitalCase } from 'change-case'
import {
  clone,
  flow,
  head,
  initial,
  last,
  mapValues,
  sampleSize,
  shuffle,
  tail,
  uniq
} from 'es-toolkit'
import { castArray, reverse } from 'es-toolkit/compat'
import { sort } from 'fast-sort'
import { isWordCharacter } from 'is-word-character'
import React from 'react'

import { component } from '../../hocs'
import { useState } from '../../hooks'
import { useFavorites } from '../../hooks/use-favorites'
import { useUpdateEffect } from '../../hooks/use-update-effect'
import { has, validateIconId } from '../../utils'
import { pluralize } from '../../utils/pluralize'
import { prettyBytes } from '../../utils/pretty-bytes'
import { Menu } from '../menu'
import { ToolbarButton } from '../toolbar-button'
import Grid from './grid'
import { useFilteredIconIds, useSearchTerm } from './hooks'

const actions = mapValues(
  {
    head,
    initial,
    last,
    reverse,
    shuffle,
    tail,
    uniq
  },
  value =>
    flow(clone, value, castArray, iconIds => iconIds.filter(validateIconId))
)

const Root = component(({ iconIds, initialSearchTerm, reloadFn }) => {
  const searchTerm = useSearchTerm()
  const isInitSearchTerm = searchTerm.useIsInit()
  const [hasInteracted, setHasInteracted] = useState()
  const favorites = useFavorites()

  const searchTermCurrent = searchTerm.useSelectValue(
    ({ draft }) =>
      hasInteracted ? draft.current : (initialSearchTerm ?? draft.current),
    { deps: [hasInteracted, initialSearchTerm] }
  )

  const filteredIconIds = useFilteredIconIds(searchTermCurrent, iconIds)
  const hasIconIds = has(filteredIconIds)
  const [state, setState] = useState(() => filteredIconIds)

  useUpdateEffect(() => {
    React.startTransition(() => {
      setState(filteredIconIds)
    })
  }, [filteredIconIds])

  return (
    <div
      style={{
        '--size': '100%',

        height: 'var(--size)',
        position: 'relative',
        width: 'var(--size)'
      }}>
      <VscodeFormContainer
        style={{
          position: 'absolute',
          right: 'calc(var(--spacing) * 2)',
          top: 0,
          zIndex: 1
        }}>
        <VscodeFormGroup variant='settings-group'>
          <VscodeFormHelper>
            <VscodeTextfield
              invalid={
                !(isInitSearchTerm || isWordCharacter(searchTermCurrent))
              }
              onInput={event => {
                if (!hasInteracted) setHasInteracted(true)

                searchTerm.set(({ draft }) => {
                  draft.current = event.target.value
                })
              }}
              placeholder='Search'
              style={{ width: 260 }}
              value={searchTermCurrent}>
              <Menu
                data={
                  hasIconIds && [
                    {
                      label: 'Favorite',
                      menu: ['toggle', 'add', 'delete'].map(a => ({
                        label: capitalCase(a),
                        onClick: () => {
                          favorites[a](...state)
                        }
                      }))
                    },
                    {
                      label: 'Sort',
                      menu: ['asc', 'desc'].map(order => ({
                        label: {
                          asc: 'Ascending',
                          desc: 'Descending'
                        }[order],
                        onClick: () => {
                          setState(state => sort(state)[order]())
                        }
                      }))
                    },
                    ...Object.entries(actions).map(([key, value]) => ({
                      label: capitalCase(key),
                      onClick: () => {
                        setState(value)
                      }
                    })),
                    {
                      label: 'Sample',
                      onClick: () => {
                        setState(sampleSize(filteredIconIds, 1))
                      }
                    },
                    { separator: true },
                    {
                      description: prettyBytes(),
                      label: 'Download'
                    }
                  ]
                }
                render={
                  <VscodeBadge slot='content-after'>
                    {pluralize(state.length, 'icon')}
                  </VscodeBadge>
                }
              />
              <ToolbarButton
                icon='refresh'
                onClick={reloadFn}
                slot='content-after'
              />
            </VscodeTextfield>
          </VscodeFormHelper>
        </VscodeFormGroup>
      </VscodeFormContainer>
      <React.Activity>
        {hasIconIds ? (
          <Grid
            itemCount={state.length}
            renderItem={({ context }) => {
              const iconId = state[context.index]

              if (validateIconId(iconId))
                return (
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                    <Grid.Item context={context} iconId={iconId} />
                  </div>
                )
            }}
          />
        ) : (
          <VscodeFormContainer
            style={{
              alignItems: 'center',
              display: 'flex',
              height: '100%',
              justifyContent: 'center',
              maxWidth: 'unset'
            }}>
            <VscodeFormGroup variant='settings-group'>
              <VscodeLabel required>No Icons</VscodeLabel>
            </VscodeFormGroup>
          </VscodeFormContainer>
        )}
      </React.Activity>
    </div>
  )
})

export const IconGrid = component(props => {
  const [state, setState] = useState()

  return (
    <Root
      key={state}
      reloadFn={() => {
        setState(state => !state)
      }}
      {...props}
    />
  )
})
