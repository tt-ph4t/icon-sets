import {useBatcher} from '@tanstack/react-pacer'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel
} from '@vscode-elements/react-elements'
import {useSetState} from 'ahooks'
import {sentenceCase} from 'change-case'
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
import ms from 'ms'
import React from 'react'

import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {useFavoritedIcons} from '../../hooks/use-favorited-icons'
import {useMemo} from '../../hooks/use-memo'
import {useRemount} from '../../hooks/use-remount'
import {hasValues, validateIconId} from '../../misc'
import {SORT_ORDER_LABELS} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import {prettyBytes} from '../../misc/pretty-bytes'
import {ButtonGroup} from '../button-group'
import Grid from './grid'
import Item from './item'
import Search from './search'
import useFilteredIconIds from './use-filtered-icon-ids'

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

const noIcons = (
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
)

export const IconGrid = Object.assign(
  useRemount.with(
    component(({children, iconIds, [useRemount.key]: remount}) => {
      iconIds = useMemo(
        () => castArray(iconIds).filter(validateIconId),
        [iconIds]
      )

      const favoritedIcons = useFavoritedIcons()
      const filteredIconIds = useFilteredIconIds(iconIds)

      const [state, setState] = useSetState({
        iconIds
      })

      const batcher = useBatcher(
        items => {
          setState(state => ({
            iconIds: last(items)(state.iconIds)
          }))
        },
        {
          wait: ms('.3s')
        }
      )

      const hasFilteredIconIds = hasValues(filteredIconIds)

      useEffect(() => {
        batcher.addItem(() => filteredIconIds)
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
              right: 'calc(var(--SPACING) * 2)',
              top: 0,
              zIndex: 1
            }}>
            <VscodeFormGroup variant='settings-group'>
              <VscodeFormHelper
                style={{
                  alignItems: 'flex-end',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'calc(var(--SPACING) * 2)'
                }}>
                <batcher.Subscribe
                  selector={batcherState => pick(batcherState, ['isPending'])}>
                  {batcherState => (
                    <ButtonGroup
                      data={[
                        {
                          children: pluralize(state.iconIds.length, 'icon'),
                          menu: hasFilteredIconIds && [
                            {
                              label: 'Favorite',
                              menu: useFavoritedIcons.actions.map(a => ({
                                label: sentenceCase(a),
                                onClick: () => {
                                  favoritedIcons[a](...state.iconIds)
                                }
                              }))
                            },
                            {
                              label: 'Sort',
                              menu: Object.keys(SORT_ORDER_LABELS).map(
                                order => ({
                                  label: SORT_ORDER_LABELS[order],
                                  onClick: () => {
                                    batcher.addItem(iconIds =>
                                      sort(iconIds)[order]()
                                    )
                                  }
                                })
                              )
                            },
                            ...Object.entries(actions).map(([a, b]) => ({
                              label: sentenceCase(a),
                              onClick: () => {
                                batcher.addItem(b)
                              }
                            })),
                            {
                              label: 'Sample',
                              onClick: () => {
                                batcher.addItem(() =>
                                  sampleSize(filteredIconIds, 1)
                                )
                              }
                            },
                            {
                              separator: true
                            },
                            {
                              description: prettyBytes(0),
                              label: 'Download'
                            }
                          ]
                        },
                        {
                          icon: remount.icon,
                          onClick: remount,
                          secondary: !batcherState.isPending
                        }
                      ]}
                    />
                  )}
                </batcher.Subscribe>
                {children}
              </VscodeFormHelper>
            </VscodeFormGroup>
          </VscodeFormContainer>
          <React.Activity>
            {hasFilteredIconIds ? (
              <Grid
                cellHeight={100}
                cellWidth={100}
                count={state.iconIds.length}
                renderItem={(...[, {context}]) => {
                  const iconId = state.iconIds[context.index]

                  if (validateIconId(iconId))
                    return (
                      <div
                        style={{
                          alignItems: 'center',
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                        <Item iconId={iconId} index={context.index} />
                      </div>
                    )
                }}
              />
            ) : (
              noIcons
            )}
          </React.Activity>
        </div>
      )
    })
  ),
  {
    Search
  }
)
