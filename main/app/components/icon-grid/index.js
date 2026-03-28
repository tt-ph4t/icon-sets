import {useBatcher} from '@tanstack/react-pacer/batcher'
import {
  VscodeBadge,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeIcon,
  VscodeLabel,
  VscodeTextfield
} from '@vscode-elements/react-elements'
import {useSetState} from 'ahooks'
import {capitalCase} from 'change-case'
import {
  clone,
  flow,
  head,
  initial,
  last,
  mapValues,
  pick,
  sampleSize,
  shuffle,
  tail,
  uniq
} from 'es-toolkit'
import {castArray, reverse} from 'es-toolkit/compat'
import {sort} from 'fast-sort'
import {isWordCharacter} from 'is-word-character'
import ms from 'ms'
import React from 'react'

import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {useFavorites} from '../../hooks/use-favorites'
import {useMemo} from '../../hooks/use-memo'
import {useRemount} from '../../hooks/use-remount'
import {useState} from '../../hooks/use-state'
import {has, validateIconId} from '../../misc'
import {EMPTY_ARRAY, U_FUZZY} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import {prettyBytes} from '../../misc/pretty-bytes'
import {Menu} from '../menu'
import Grid from './grid'
import Item from './item'
import useStore from './use-store'

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

const sortOrderLabels = {
  asc: 'Ascending',
  desc: 'Descending'
}

const favoriteActions = ['toggle', 'add', 'delete']

const batcherOptions = {
  wait: ms('.4s')
}

const useFilteredIconIds = (searchTerm, iconIds) => {
  const [state, setState] = useState(searchTerm)

  const batcher = useBatcher(items => {
    setState(last(items))
  }, batcherOptions)

  useEffect.Update(() => {
    batcher.addItem(searchTerm)
  }, [batcher, searchTerm])

  return useMemo(
    () =>
      useStore.initial.searchTerm === state
        ? iconIds
        : isWordCharacter(state)
          ? U_FUZZY.search(iconIds, state)[0].map(index => iconIds[index])
          : EMPTY_ARRAY,
    [iconIds, state]
  )
}

export const IconGrid = useRemount.with(
  component(({iconIds, initialSearchTerm, INTERNAL_REMOUNT}) => {
    iconIds = useMemo(
      () => castArray(iconIds).filter(validateIconId),
      [iconIds]
    )

    const favorites = useFavorites()
    const store = useStore()
    const searchTerm = store.useSelectValue(({draft}) => draft.searchTerm)
    const filteredIconIds = useFilteredIconIds(searchTerm, iconIds)

    const [state, setState] = useSetState({
      iconIds
    })

    const batcher = useBatcher(items => {
      setState(state => ({
        iconIds: last(items)(state.iconIds)
      }))
    }, batcherOptions)

    const hasFilteredIconIds = has(filteredIconIds)

    useEffect(() => {
      batcher.addItem(() => filteredIconIds)
    }, [batcher, filteredIconIds])

    useEffect.Once(
      () => {
        store.set(({draft}) => {
          // draft.searchTerm = initialSearchTerm
        })
      },
      has(initialSearchTerm) &&
        initialSearchTerm !== useStore.initial.searchTerm
    )

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
                  !(
                    searchTerm === useStore.initial.searchTerm ||
                    isWordCharacter(searchTerm)
                  )
                }
                onInput={event => {
                  store.set(({draft}) => {
                    draft.searchTerm = event.target.value
                  })
                }}
                placeholder='Search'
                style={{width: 260}}
                value={searchTerm}>
                <Menu
                  data={
                    hasFilteredIconIds && [
                      {
                        label: 'Favorite',
                        menu: favoriteActions.map(a => ({
                          label: capitalCase(a),
                          onClick: () => {
                            favorites[a](...state.iconIds)
                          }
                        }))
                      },
                      {
                        label: 'Sort',
                        menu: Object.keys(sortOrderLabels).map(order => ({
                          label: sortOrderLabels[order],
                          onClick: () => {
                            batcher.addItem(iconIds => sort(iconIds)[order]())
                          }
                        }))
                      },
                      ...Object.entries(actions).map(([a, b]) => ({
                        label: capitalCase(a),
                        onClick: () => {
                          batcher.addItem(b)
                        }
                      })),
                      {
                        label: 'Sample',
                        onClick: () => {
                          batcher.addItem(() => sampleSize(filteredIconIds, 1))
                        }
                      },
                      {separator: true},
                      {
                        description: prettyBytes(),
                        label: 'Download'
                      }
                    ]
                  }
                  render={
                    <VscodeBadge slot='content-after'>
                      {pluralize(state.iconIds.length, 'icon')}
                    </VscodeBadge>
                  }
                />
                <React.Activity>
                  <batcher.Subscribe
                    selector={state => pick(state, ['isPending'])}>
                    {batcherState => (
                      <Menu
                        data={[
                          {
                            label: 'Lock aspect ratio',
                            onClick: () => {
                              store.set(({draft}) => {
                                draft.isIconAspectRatioLocked =
                                  !draft.isIconAspectRatioLocked
                              })
                            }
                          },
                          {
                            label: INTERNAL_REMOUNT.label,
                            onClick: INTERNAL_REMOUNT
                          }
                        ]}
                        render={
                          <VscodeIcon
                            name='settings'
                            slot='content-after'
                            {...(batcherState.isPending && {
                              name: 'loading',
                              spin: true
                            })}
                          />
                        }
                      />
                    )}
                  </batcher.Subscribe>
                </React.Activity>
              </VscodeTextfield>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
        <React.Activity>
          {hasFilteredIconIds ? (
            <Grid
              item={{
                count: state.iconIds.length,
                render: (...[, {context}]) => {
                  const iconId = state.iconIds[context.index]

                  if (validateIconId(iconId))
                    return (
                      <div
                        style={{
                          alignItems: 'center',
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                        <Item context={context} iconId={iconId} />
                      </div>
                    )
                }
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
)
