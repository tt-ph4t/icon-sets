import {mergeProps} from '@base-ui/react/merge-props'
import {stringToIcon} from '@iconify/utils'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {VscodeIcon} from '@vscode-elements/react-elements'
import {useUnmount} from 'ahooks'
import {capitalCase} from 'change-case'
import {findKey, identity, range, uniq} from 'es-toolkit'
import {size, truncate} from 'es-toolkit/compat'
import React from 'react'

import {
  DEFAULT_ICON_CUSTOMISATIONS,
  EMPTY_ARRAY,
  ICON_SETS_URL
} from '../../../constants'
import {component} from '../../../hocs'
import {useCallback} from '../../../hooks/use-callback'
import {useCustomizedIcons} from '../../../hooks/use-customized-icons'
import {useFavorites} from '../../../hooks/use-favorites'
import {useIconQueries} from '../../../hooks/use-icon-queries'
import {getIconFileNames} from '../../../hooks/use-icon-queries/build-icon'
import {useMemo} from '../../../hooks/use-memo'
import {useRemount} from '../../../hooks/use-remount'
import {copy, fileSaver, getId, has, openObjectURL} from '../../../utils'
import {getQueryOptions} from '../../../utils/get-query-options'
import {prettyBytes} from '../../../utils/pretty-bytes'
import {timeAgo} from '../../../utils/time-ago'
import {Menu} from '../../menu'
import useStore from '../use-store'
import takumi from './takumi.wasm'

const Fallback = component(({children, ...props}) => (
  <span {...mergeProps(props, {style: {userSelect: 'none'}})}>
    {children.slice(0, 3)}
  </span>
))

const flipDirections = {
  hFlip: 'Horizontal flip',
  vFlip: 'Vertical flip'
}

const rotate = {
  step: 90,
  values: range(DEFAULT_ICON_CUSTOMISATIONS.rotate, 4)
}

const scales = range(
  DEFAULT_ICON_CUSTOMISATIONS.scale,
  100 + DEFAULT_ICON_CUSTOMISATIONS.scale
)

export default useRemount.with(
  component(({context, iconId, INTERNAL_REMOUNT}) => {
    const icon = useMemo(() => stringToIcon(iconId), [iconId])
    const queryClient = useQueryClient()
    const customizedIcons = useCustomizedIcons()
    const favorites = useFavorites()
    const {iconCustomisations} = useCustomizedIcons.useSelect(iconId)
    const store = useStore()

    const isIconAspectRatioLocked = store.useSelectValue(
      ({draft}) => draft.isIconAspectRatioLocked
    )

    const remountMenu = useMemo(
      () => ({
        label: INTERNAL_REMOUNT.label,
        onClick: INTERNAL_REMOUNT
      }),
      [INTERNAL_REMOUNT]
    )

    const [iconQuery] = useIconQueries({
      iconCustomisations,
      iconId
    })

    const iconQueryFilter = useMemo(
      () => ({
        exact: true,
        queryKey: [iconId]
      }),
      [iconId]
    )

    const iconSetQuery = useQuery(
      getQueryOptions({
        enabled: iconQuery.isSuccess,
        select: useCallback(
          iconSets => {
            // eslint-disable-next-line no-unused-vars
            const {icons, ...iconSet} = iconSets[icon.prefix]

            return iconSet
          },
          [icon]
        ),
        url: ICON_SETS_URL
      })
    )

    const iconQueryMenu = useMemo(
      () => [
        {
          label: 'Refetch',
          onClick: async () => {
            await queryClient.refetchQueries(iconQueryFilter)
          }
        },
        {
          label: 'Invalidate',
          onClick: async () => {
            await queryClient.invalidateQueries(iconQueryFilter)
          }
        },
        {
          label: 'Reset',
          onClick: async () => {
            await queryClient.resetQueries(iconQueryFilter)
          }
        },
        {
          label: 'Cancel',
          onClick: async () => {
            await queryClient.cancelQueries(iconQueryFilter)
          }
        }
      ],
      [queryClient, iconQueryFilter]
    )

    useUnmount(async () => {
      await queryClient.cancelQueries(iconQueryFilter)
    })

    if (iconQuery.isLoading || iconSetQuery.isLoading)
      return (
        <Menu
          data={[...iconQueryMenu, {separator: true}, remountMenu]}
          render={<Fallback>{icon.name}</Fallback>}
        />
      )

    if (iconQuery.isError)
      return (
        <Menu
          data={[...iconQueryMenu, {separator: true}, remountMenu]}
          render={
            <Fallback
              onClick={() => {
                prompt('Error', iconQuery.error.message)
              }}
              style={{
                color: 'var(--vscode-activityErrorBadge-background)'
              }}>
              {icon.name}
            </Fallback>
          }
        />
      )

    const iconAliases = uniq([
      iconQuery.data.name,
      ...(iconSetQuery.data.aliases[iconQuery.data.name] ?? EMPTY_ARRAY)
    ])

    return (
      <Menu
        data={[
          {
            label: capitalCase(iconQuery.data.name),
            menu: [
              {
                label: 'To',
                menu: [
                  ...Object.entries(iconQuery.data.INTERNAL.paths).map(
                    ([fileType, fileName]) => {
                      const icon = iconQuery.data.INTERNAL.as(fileType)

                      return {
                        description: prettyBytes(icon.blob),
                        label: fileType.toUpperCase(),
                        menu: has(icon) && [
                          {
                            label: 'View',
                            onClick: () => {
                              openObjectURL(icon.blob)
                            }
                          },
                          {
                            label: 'Copy',
                            onClick: () => {
                              copy(icon.data)
                            }
                          },
                          {
                            label: 'Download',
                            onClick: async () => {
                              await fileSaver(icon.blob, fileName.labeled)
                            }
                          }
                        ]
                      }
                    }
                  ),
                  {separator: true},
                  {
                    label: 'Takumi WASM',
                    menu: Object.entries(takumi.formats).map(
                      ([format, type]) => {
                        const takumiArg = {
                          component: (format === 'jpeg' &&
                            !iconQuery.data.palette
                            ? React.cloneElement
                            : identity)(
                            iconQuery.data.INTERNAL.to.reactElement,
                            {
                              style: {
                                backgroundColor: 'white'
                              }
                            }
                          ),
                          get id() {
                            return getId(`[${iconQuery.data.id}]`, {
                              iconCustomisations,
                              options: this.options
                            })
                          },
                          options: {
                            format,
                            height:
                              iconQuery.data.data.height *
                              iconCustomisations.scale,
                            width:
                              iconQuery.data.data.width *
                              iconCustomisations.scale
                          }
                        }

                        return {
                          label: format.toUpperCase(),
                          menu: type && [
                            {
                              label: 'View',
                              onClick: async () => {
                                openObjectURL(await takumi(takumiArg))
                              }
                            },
                            ClipboardItem.supports(type) && {
                              label: 'Copy',
                              onClick: async () => {
                                await navigator.clipboard.write([
                                  new ClipboardItem({
                                    [type]: await takumi(takumiArg)
                                  })
                                ])
                              }
                            },
                            {
                              label: 'Download',
                              onClick: async () => {
                                await fileSaver(
                                  await takumi(takumiArg),
                                  getIconFileNames(iconQuery.data, format)
                                    .labeled
                                )
                              }
                            }
                          ]
                        }
                      }
                    )
                  }
                ]
              },
              {
                label: 'Favorite',
                menu: ['toggle', 'add', 'delete'].map(a => ({
                  label: capitalCase(a),
                  onClick: () => {
                    favorites[a](iconQuery.data.id)
                  }
                }))
              },
              {
                label: 'Customisations',
                menu: [
                  {
                    label: 'Reset',
                    onClick: () => {
                      customizedIcons.delete(iconQuery.data.id)
                    }
                  },
                  {separator: true},
                  ...Object.keys(flipDirections).map(flipDirection => ({
                    label: flipDirections[flipDirection],
                    onClick: () => {
                      customizedIcons.set(
                        iconQuery.data.id,
                        ({iconCustomisations}) => ({
                          [flipDirection]: !iconCustomisations[flipDirection]
                        })
                      )
                    }
                  })),
                  {separator: true},
                  {
                    label: 'Rotate',
                    menu: rotate.values.map(value => ({
                      label: `${value * rotate.step}deg`,
                      onClick: () => {
                        customizedIcons.set(iconQuery.data.id, () => ({
                          rotate: value
                        }))
                      },
                      selected: value === iconCustomisations.rotate
                    }))
                  },
                  {
                    label: 'Scale',
                    menu: scales.map(scale => ({
                      label: scale,
                      onClick: () => {
                        customizedIcons.set(iconQuery.data.id, () => ({
                          scale
                        }))
                      },
                      selected: scale === iconCustomisations.scale
                    }))
                  },
                  {
                    label: 'Restart animations',
                    onClick: () => {
                      customizedIcons.set(iconQuery.data.id, () => ({
                        wrapSvgContentStart: `<!-- ${crypto.randomUUID()} -->`
                      }))
                    }
                  }
                ]
              },
              {
                label: 'Query',
                menu: iconQueryMenu
              },
              {separator: true},
              remountMenu
            ],
            onClick: () => {
              favorites.toggle(iconQuery.data.id)
            }
          },
          {separator: true},
          {
            description: context.index + 1,
            label: 'Order'
          },
          {
            description: size(iconQuery.data.INTERNAL.idCases),
            label: 'ID Cases',
            menu: Object.entries(iconQuery.data.INTERNAL.idCases).map(
              ([label, id]) => {
                label = capitalCase(label)

                return {
                  description: truncate(id, {length: 6}),
                  label,
                  onClick: () => {
                    prompt(label, id)
                  }
                }
              }
            )
          },
          {
            description: iconSetQuery.data.name,
            label: 'Set Name'
          },
          {
            description: iconSetQuery.data.author.name,
            label: 'Author',
            onClick: () => {
              open(iconSetQuery.data.author.url)
            }
          },
          {
            description: iconSetQuery.data.category,
            label: 'Category'
          },
          {
            description: `${iconQuery.data.data.width * iconCustomisations.scale} x ${iconQuery.data.data.height * iconCustomisations.scale}`,
            label: 'Size'
          },
          {
            description: iconAliases.length,
            label: 'Alias',
            menu: iconAliases.map(iconAlias => ({
              label: capitalCase(iconAlias),
              onClick: () => {
                store.set(({draft}) => {
                  draft.searchTerm = iconAlias
                })
              }
            }))
          },
          {
            description: findKey(
              iconSetQuery.data.chars,
              iconName => iconName === iconQuery.data.name
            ),
            label: 'Character'
          },
          {
            description: iconSetQuery.data.license.spdx,
            label: 'License',
            onClick: () => {
              open(iconSetQuery.data.license.url)
            }
          },
          {
            description: iconSetQuery.data.version,
            label: 'Version'
          },
          {
            description: timeAgo.unix(iconSetQuery.data.lastModified),
            label: 'Last modified'
          }
        ]}
        key={iconQuery.data.id}
        render={
          <div style={{position: 'relative'}}>
            <React.Activity>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'absolute',
                  right: 0,
                  top: 0
                }}>
                <React.Activity
                  mode={
                    favorites.has(iconQuery.data.id) ? 'visible' : 'hidden'
                  }>
                  <VscodeIcon
                    name='circle-filled'
                    onClick={() => {
                      favorites.delete(iconQuery.data.id)
                    }}
                    size={13}
                    style={{
                      '--vscode-icon-foreground':
                        'var(--vscode-activityWarningBadge-background)'
                    }}
                  />
                </React.Activity>
                <React.Activity
                  mode={
                    isEqual(DEFAULT_ICON_CUSTOMISATIONS, iconCustomisations)
                      ? 'hidden'
                      : 'visible'
                  }>
                  <VscodeIcon
                    name='circle-filled'
                    onClick={() => {
                      customizedIcons.delete(iconQuery.data.id)
                    }}
                    size={13}
                    style={{
                      '--vscode-icon-foreground':
                        'var(--vscode-inputOption-activeBorder)'
                    }}
                  />
                </React.Activity>
              </div>
            </React.Activity>
            {React.cloneElement(iconQuery.data.INTERNAL.to.reactElement, {
              get height() {
                return isIconAspectRatioLocked ? this.width : '100%'
              },
              id: iconQuery.data.id,
              width: '2.8rem'
            })}
          </div>
        }
      />
    )
  })
)
