import {mergeProps} from '@base-ui/react'
import {useQuery} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {VscodeIcon} from '@vscode-elements/react-elements'
import {capitalCase, sentenceCase} from 'change-case'
import {findKey, identity, mapValues, pick, range, uniq} from 'es-toolkit'
import {size, truncate} from 'es-toolkit/compat'
import React from 'react'

import {component} from '../../../hocs'
import {useCallback} from '../../../hooks/use-callback'
import {useCustomizedIcons} from '../../../hooks/use-customized-icons'
import {useFavoritedIcons} from '../../../hooks/use-favorited-icons'
import {useIconQueries} from '../../../hooks/use-icon-queries'
import {useMemo} from '../../../hooks/use-memo'
import {
  copy,
  fileSaver,
  getIconFilePaths,
  getId,
  hasValues,
  openObjectURL
} from '../../../misc'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  DEFAULT_QUERY_OPTIONS,
  EMPTY_ARRAY,
  THEME
} from '../../../misc/constants'
import {parseIconName} from '../../../misc/parse-icon-name'
import {prettyBytes} from '../../../misc/pretty-bytes'
import {timeAgo} from '../../../misc/time-ago'
import {Menu} from '../../menu'
import useStore from '../use-store'
import takumi from './takumi.wasm'
import withQueryBoundary from './with-query-boundary'

const flipDirections = {
  hFlip: 'Horizontal',
  vFlip: 'Vertical'
}

const rotate = {
  step: 90,
  values: range(DEFAULT_ICON_CUSTOMISATIONS.rotate, 4)
}

const scales = range(
  DEFAULT_ICON_CUSTOMISATIONS.scale,
  DEFAULT_ICON_CUSTOMISATIONS.scale + 100
)

const sizeLabel = (
  {height = 0, width = 0},
  scale = DEFAULT_ICON_CUSTOMISATIONS.scale
) => `${width * scale} x ${height * scale}`

export default withQueryBoundary(
  component(({iconId, index, menu}) => {
    const {icon} = parseIconName(iconId)
    const customizedIcons = useCustomizedIcons()
    const favoritedIcons = useFavoritedIcons()
    const {iconCustomisations} = useCustomizedIcons.useSelect(iconId)
    const store = useStore()

    const iconOptions = customizedIcons.store.useSelectValue(
      ({draft}) => draft.globalOptions
    )

    const [iconQuery] = useIconQueries({
      iconCustomisations,
      iconId,
      queryOptions: {
        select: identity
      }
    })

    const iconSetQuery = useQuery({
      ...DEFAULT_QUERY_OPTIONS,
      enabled: iconQuery.isSuccess,
      select: useCallback(
        iconSets => {
          // eslint-disable-next-line no-unused-vars
          const {icons, ...iconSet} = iconSets[icon.prefix]

          return iconSet
        },
        [icon.prefix]
      )
    })

    const getTakumiBlob = useCallback(
      async format =>
        await takumi(
          (format === 'jpeg' && !iconQuery.data.palette
            ? React.cloneElement
            : identity)(
            iconQuery.data.internal.to.reactElement,
            mergeProps(iconQuery.data.internal.to.reactElement.props, {
              style: {
                backgroundColor: 'white'
              }
            })
          ),
          {
            get id() {
              return getId(`[${iconQuery.data.id}]`, {
                iconCustomisations,
                iconOptions,
                options: this.options
              })
            },
            options: {
              format,
              ...mapValues(
                pick(iconQuery.data.data, ['height', 'width']),
                a => a * iconCustomisations.scale
              )
            }
          }
        )
    )

    const iconAliases = useMemo(
      () =>
        uniq([
          iconQuery.data.name,
          ...(iconSetQuery.data.aliases[iconQuery.data.name] ?? EMPTY_ARRAY)
        ]),
      [iconQuery.data.name, iconSetQuery.data.aliases]
    )

    return (
      <Menu
        data={[
          {
            label: capitalCase(iconQuery.data.name),
            menu: [
              {
                label: 'To',
                menu: [
                  ...Object.entries(iconQuery.data.internal.paths).map(
                    ([a, b]) => {
                      const icon = iconQuery.data.internal.as(a)

                      return {
                        description: prettyBytes(icon.blob),
                        label: a.toUpperCase(),
                        menu: hasValues(icon) && [
                          {
                            label: 'View',
                            onClick: () => {
                              openObjectURL(icon.blob)
                            }
                          },
                          {
                            label: 'Copy',
                            onClick: async () => {
                              await copy(icon.data)
                            }
                          },
                          {
                            label: 'Download',
                            onClick: async () => {
                              await fileSaver(icon.blob, b.labeled)
                            }
                          }
                        ]
                      }
                    }
                  ),
                  {
                    separator: true
                  },
                  {
                    label: 'Takumi WASM',
                    menu: Object.entries(takumi.formats).map(
                      ([format, type]) => ({
                        label: format.toUpperCase(),
                        menu: type && [
                          {
                            label: 'View',
                            onClick: async () => {
                              openObjectURL(await getTakumiBlob(format))
                            }
                          },
                          ClipboardItem.supports(type) && {
                            label: 'Copy',
                            onClick: async () => {
                              await copy(await getTakumiBlob(format), {
                                format: type
                              })
                            }
                          },
                          {
                            label: 'Download',
                            onClick: async () => {
                              await fileSaver(
                                await getTakumiBlob(format),
                                getIconFilePaths(iconQuery.data, format).labeled
                              )
                            }
                          }
                        ]
                      })
                    )
                  }
                ]
              },
              {
                label: 'Favorite',
                menu: useFavoritedIcons.actions.map(a => ({
                  label: sentenceCase(a),
                  onClick: () => {
                    favoritedIcons[a](iconQuery.data.id)
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
                  {
                    separator: true
                  },
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
                    label: 'Size',
                    menu: scales.map(scale => ({
                      label: sizeLabel(iconQuery.data.data, scale),
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
                  },
                  'Flip',
                  ...Object.entries(flipDirections).map(
                    ([flipDirection, label]) => ({
                      label,
                      onClick: () => {
                        customizedIcons.set(
                          iconQuery.data.id,
                          ({iconCustomisations}) => ({
                            [flipDirection]: !iconCustomisations[flipDirection]
                          })
                        )
                      }
                    })
                  )
                ]
              },
              ...menu
            ],
            onClick: () => {
              favoritedIcons.toggle(iconQuery.data.id)
            }
          },
          {
            separator: true
          },
          {
            description: index + 1,
            label: 'Order'
          },
          {
            description: size(iconQuery.data.internal.idCases),
            label: 'ID cases',
            menu: Object.entries(iconQuery.data.internal.idCases).map(
              ([label, id]) => {
                label = sentenceCase(label)

                return {
                  description: truncate(id, {
                    length: 6
                  }),
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
            label: 'Set name'
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
            description: sizeLabel(
              iconQuery.data.data,
              iconCustomisations.scale
            ),
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
            label: 'Last modified',
            onClick: () => {
              prompt('Unix time', iconSetQuery.data.lastModified)
            }
          }
        ]}
        render={
          <div
            style={{
              position: 'relative'
            }}>
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
                    favoritedIcons.has(iconQuery.data.id) ? 'visible' : 'hidden'
                  }>
                  <VscodeIcon
                    name='circle-filled'
                    onClick={() => {
                      favoritedIcons.delete(iconQuery.data.id)
                    }}
                    size={13}
                    style={{
                      '--vscode-icon-foreground': `var(${THEME.COLORS.WARNING})`
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
                      '--vscode-icon-foreground': `var(${THEME.COLORS.PRIMARY})`
                    }}
                  />
                </React.Activity>
              </div>
            </React.Activity>
            {React.cloneElement(iconQuery.data.internal.to.reactElement, {
              get height() {
                return iconOptions.square ? this.width : '100%'
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
