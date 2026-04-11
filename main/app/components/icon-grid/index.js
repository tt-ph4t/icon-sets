import uFuzzy from '@leeoniya/ufuzzy'
import {useBatcher} from '@tanstack/react-pacer/batcher'
import {Sketch} from '@uiw/react-color'
import {
  VscodeBadge,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel,
  VscodeTextfield,
  VscodeToolbarContainer
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
import {isWordCharacter} from 'is-word-character'
import ms from 'ms'
import randomColor from 'randomcolor'
import React from 'react'

import {component} from '../../hocs'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useEffect} from '../../hooks/use-effect'
import {useFavoritedIcons} from '../../hooks/use-favorited-icons'
import {useMemo} from '../../hooks/use-memo'
import {useRemount} from '../../hooks/use-remount'
import {useState} from '../../hooks/use-state'
import {copy, hasValues, validateIconId} from '../../misc'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  EMPTY_ARRAY,
  EMPTY_SIZE_TEXT,
  ICON_CACHE,
  SORT_ORDER_LABELS,
  THEME
} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import {Menu} from '../menu'
import {Popover} from '../popover'
import {ToolbarButton} from '../toolbar-button'
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

const uf = new uFuzzy()

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
          ? uf.search(iconIds, state)[0].map(index => iconIds[index])
          : EMPTY_ARRAY,
    [iconIds, state]
  )
}

const IconOptions = {
  ColorPicker: component(props => {
    const customizedIcons = useCustomizedIcons()

    const batcher = useBatcher(items => {
      last(items)()
      ICON_CACHE.clear()
    })

    const iconOptions = customizedIcons.store.useSelectValue(({draft}) => ({
      color: draft.sharedOptions.color
    }))

    return (
      <Popover.Primitive
        popupRender={
          <>
            <Sketch
              color={iconOptions.color}
              editableDisable={false}
              onChange={colorResult => {
                batcher.addItem(() => {
                  customizedIcons.store.set(({draft}) => {
                    draft.sharedOptions.color = colorResult.hexa
                  })
                })
              }}
              presetColors={false}
              style={THEME.CARD_STYLE}
              width={300}
            />
            <React.Activity>
              <div
                style={{
                  display: 'flex',
                  placeContent: 'space-between'
                }}>
                <ToolbarButton
                  icon='copy'
                  onClick={() => {
                    copy(iconOptions.color)
                  }}>
                  {iconOptions.color}
                </ToolbarButton>
                <VscodeToolbarContainer>
                  <ToolbarButton
                    icon='wand'
                    onClick={() => {
                      batcher.addItem(() => {
                        customizedIcons.store.set(({draft}) => {
                          draft.sharedOptions.color = randomColor()
                        })
                      })
                    }}
                  />
                  <ToolbarButton
                    icon='eraser'
                    onClick={() => {
                      batcher.addItem(() => {
                        customizedIcons.store.set(({draft}) => {
                          draft.sharedOptions.color =
                            DEFAULT_ICON_CUSTOMISATIONS.color
                        })
                      })
                    }}
                  />
                </VscodeToolbarContainer>
              </div>
            </React.Activity>
          </>
        }
        render={
          <ToolbarButton
            checked={iconOptions.color !== DEFAULT_ICON_CUSTOMISATIONS.color}
            icon='paintcan'
            preventToggle
            {...props}
          />
        }
      />
    )
  }),
  SquareToggle: component(props => {
    const customizedIcons = useCustomizedIcons()

    const iconOptions = customizedIcons.store.useSelectValue(({draft}) => ({
      square: draft.sharedOptions.square
    }))

    return (
      <ToolbarButton
        checked={iconOptions.square}
        icon='symbol-ruler'
        onChange={event => {
          customizedIcons.store.set(({draft}) => {
            draft.sharedOptions.square = event.target.checked
          })
        }}
        toggleable
        {...props}
      />
    )
  })
}

export const IconGrid = useRemount.with(
  component(({iconIds, initialSearchTerm, INTERNAL_REMOUNT}) => {
    iconIds = useMemo(
      () => castArray(iconIds).filter(validateIconId),
      [iconIds]
    )

    const favoritedIcons = useFavoritedIcons()
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

    const hasFilteredIconIds = hasValues(filteredIconIds)

    useEffect(() => {
      batcher.addItem(() => filteredIconIds)
    }, [batcher, filteredIconIds])

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
                <React.Activity>
                  <Menu
                    data={
                      hasFilteredIconIds && [
                        {
                          label: 'Favorite',
                          menu: useFavoritedIcons.menu.map(a => ({
                            label: sentenceCase(a),
                            onClick: () => {
                              favoritedIcons[a](...state.iconIds)
                            }
                          }))
                        },
                        {
                          label: 'Sort',
                          menu: Object.keys(SORT_ORDER_LABELS).map(order => ({
                            label: SORT_ORDER_LABELS[order],
                            onClick: () => {
                              batcher.addItem(iconIds => sort(iconIds)[order]())
                            }
                          }))
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
                        {separator: true},
                        {
                          description: EMPTY_SIZE_TEXT,
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
                  <IconOptions.SquareToggle slot='content-after' />
                  <IconOptions.ColorPicker slot='content-after' />
                  <batcher.Subscribe
                    selector={state => pick(state, ['isPending'])}>
                    {batcherState => (
                      <ToolbarButton
                        checked={batcherState.isPending}
                        icon={INTERNAL_REMOUNT.icon}
                        onClick={INTERNAL_REMOUNT}
                        preventToggle
                        slot='content-after'
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
                        <Item iconId={iconId} index={context.index} />
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
