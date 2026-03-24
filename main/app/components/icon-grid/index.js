import {useBatchedCallback, useBatcher} from '@tanstack/react-pacer/batcher'
import {
  VscodeBadge,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel,
  VscodeTextfield
} from '@vscode-elements/react-elements'
import {capitalCase} from 'change-case'
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
import {castArray, reverse} from 'es-toolkit/compat'
import {sort} from 'fast-sort'
import {isWordCharacter} from 'is-word-character'
import ms from 'ms'
import React from 'react'

import {EMPTY_ARRAY, U_FUZZY} from '../../constants'
import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {useFavorites} from '../../hooks/use-favorites'
import {useMemo} from '../../hooks/use-memo'
import {useRemount} from '../../hooks/use-remount'
import {useState} from '../../hooks/use-state'
import {has, validateIconId} from '../../utils'
import {pluralize} from '../../utils/pluralize'
import {prettyBytes} from '../../utils/pretty-bytes'
import {Menu} from '../menu'
import {ToolbarButton} from '../toolbar-button'
import Grid from './grid'
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
  }, [searchTerm])

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

const IconSquareToggle = component(props => {
  const store = useStore()
  const iconSquare = store.useSelectValue(({draft}) => draft.iconSquare)

  return (
    <ToolbarButton
      checked={!iconSquare}
      onClick={() => {
        store.set(({draft}) => {
          draft.iconSquare = !draft.iconSquare
        })
      }}
      preventToggle
      toggleable
      {...props}
    />
  )
})

export const IconGrid = useRemount.with(
  component(({iconIds, initialSearchTerm, INTERNAL_REMOUNT}) => {
    iconIds = useMemo(
      () => castArray(iconIds).filter(validateIconId),
      [iconIds]
    )

    const [hasInteracted, setHasInteracted] = useState()
    const favorites = useFavorites()
    const store = useStore()

    const searchTerm = store.useSelectValue(
      ({draft}) =>
        hasInteracted
          ? draft.searchTerm
          : (initialSearchTerm ?? draft.searchTerm),
      {deps: [hasInteracted, initialSearchTerm]}
    )

    const filteredIconIds = useFilteredIconIds(searchTerm, iconIds)
    const [state, setState] = useState(filteredIconIds)

    const batchedSetState = useBatchedCallback(items => {
      setState(last(items))
    }, batcherOptions)

    const hasIconIds = has(filteredIconIds)

    useEffect.Update(() => {
      batchedSetState(filteredIconIds)
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
                  !(
                    searchTerm === useStore.initial.searchTerm ||
                    isWordCharacter(searchTerm)
                  )
                }
                onInput={event => {
                  if (!hasInteracted) setHasInteracted(true)

                  store.set(({draft}) => {
                    draft.searchTerm = event.target.value
                  })
                }}
                placeholder='Search'
                style={{width: 260}}
                value={searchTerm}>
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
                            batchedSetState(sort(state)[order]())
                          }
                        }))
                      },
                      ...Object.entries(actions).map(([a, b]) => ({
                        label: capitalCase(a),
                        onClick: () => {
                          batchedSetState(b)
                        }
                      })),
                      {
                        label: 'Sample',
                        onClick: () => {
                          batchedSetState(sampleSize(filteredIconIds, 1))
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
                      {pluralize(state.length, 'icon')}
                    </VscodeBadge>
                  }
                />
                <React.Activity>
                  <IconSquareToggle icon='symbol-ruler' slot='content-after' />
                  <ToolbarButton
                    icon={INTERNAL_REMOUNT.icon}
                    onClick={INTERNAL_REMOUNT}
                    slot='content-after'
                  />
                </React.Activity>
              </VscodeTextfield>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
        <React.Activity>
          {hasIconIds ? (
            <Grid
              itemCount={state.length}
              renderItem={({context}) => {
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
)
