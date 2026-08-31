import {mergeProps} from '@base-ui/react'
import {defaultIconSizeCustomisations} from '@iconify/utils'
import {isSafeInteger} from '@sindresorhus/is'
import {useQuery} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {VscodeIcon} from '@vscode-elements/react-elements'
import {capitalCase, sentenceCase} from 'change-case'
import {
  compact,
  findKey,
  identity,
  mapValues,
  omit,
  pick,
  range,
  uniq
} from 'es-toolkit'
import {castArray, size} from 'es-toolkit/compat'
import {filter, map, pipe} from 'es-toolkit/fp'
import mime from 'mime'
import {AccessibleIcon} from 'radix-ui'
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
  hasValues,
  numbers,
  open,
  sizeLabel
} from '../../../misc'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  DEFAULT_QUERY_OPTIONS,
  EMPTY,
  ICONIFY_API_URLS,
  THEME
} from '../../../misc/constants'
import {parseIconName} from '../../../misc/parse-icon-name'
import {prettyBytes} from '../../../misc/pretty-bytes'
import {takumi} from '../../../misc/takumi'
import {timeAgo} from '../../../misc/time-ago'
import {Menu} from '../../menu'
import {useProgress} from '../../progress'
import {Slot} from '../../slot'
import useSearchTerm from '../use-search-term'
import withQueryBoundary from './with-query-boundary'

const flipDirections = {
  hFlip: 'Horizontal',
  vFlip: 'Vertical'
}

const rotate = {
  step: 90,
  values: range(DEFAULT_ICON_CUSTOMISATIONS.rotate, 4)
}

const width = 'calc(var(--SPACING) * 12)'

const aaaaaaaaaaaaaaaaaaaaaaaaa = value =>
  pipe(
    castArray(value),
    map(Math.round),
    filter(isSafeInteger),
    map(Math.abs),
    filter(Boolean)
  )

const Badge = component(({color, ...props}) => (
  <Slot.Cuelume.Press
    style={
      hasValues(color) && {
        '--vscode-icon-foreground': color
      }
    }>
    <VscodeIcon name='circle-filled' size={13} {...props} />
  </Slot.Cuelume.Press>
))

export default withQueryBoundary(
  component(({iconId, index, menu, ...props}) => {
    const {icon} = parseIconName(iconId)
    const customizedIcons = useCustomizedIcons()
    const favoritedIcons = useFavoritedIcons()
    const {iconCustomisations} = useCustomizedIcons.useSelect(iconId)
    const searchTerm = useSearchTerm()
    const progress = useProgress()
    const takumiOptions = takumi.useStore().useValue()

    const {global: globalIconCustomisations} = useCustomizedIcons
      .useStore()
      .useSelectValue('global')

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
        ({[icon.prefix]: iconSet}) => omit(iconSet, ['icons']),
        [icon.prefix]
      )
    })

    const iconSize = mapValues(
      defaultIconSizeCustomisations,
      (...[, a]) => iconCustomisations[a] ?? iconQuery.data.data[a]
    )

    const isDefaultIconSizeCustomisations = isEqual(
      pick(iconCustomisations, Object.keys(defaultIconSizeCustomisations)),
      defaultIconSizeCustomisations
    )

    const getTakumiBlob = useCallback(
      async format =>
        new Blob(
          [
            await takumi(
              (format === 'jpeg' && !iconQuery.data.palette
                ? React.cloneElement
                : identity)(
                iconQuery.data.more.to.reactElement,
                mergeProps(iconQuery.data.more.to.reactElement.props, {
                  style: {
                    backgroundColor: 'white'
                  }
                })
              ),
              {
                ...takumiOptions,
                ...iconSize,
                format
              }
            )
          ],
          {
            type: mime.getType(format)
          }
        )
    )

    const iconAliases = useMemo(
      () =>
        uniq([
          iconQuery.data.name,
          ...(iconSetQuery.data.aliases[iconQuery.data.name] ?? EMPTY.ARRAY)
        ]),
      [iconQuery.data.name, iconSetQuery.data.aliases]
    )

    const isFavorited = favoritedIcons.has(iconQuery.data.id)

    return (
      <Menu
        data={[
          {
            icon: isFavorited ? 'bookmark' : undefined,
            label: capitalCase(iconQuery.data.name),
            menu: [
              {
                label: 'To',
                menu: [
                  ...Object.entries(iconQuery.data.more.paths).map(([a, b]) => {
                    const icon = iconQuery.data.more.as(a)

                    return {
                      description: prettyBytes(icon.blob),
                      label: a.toUpperCase(),
                      menu: hasValues(icon) && [
                        {
                          label: 'View',
                          onClick: () => {
                            open.objectURL(icon.blob)
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
                  }),
                  takumi.label,
                  ...Object.entries(takumi.formats).map(([a, b]) => ({
                    label: a.toUpperCase(),
                    menu:
                      b &&
                      compact([
                        {
                          label: 'View',
                          onClick: open.objectURL
                        },
                        ClipboardItem.supports(b) && {
                          label: 'Copy',
                          onClick: async value => {
                            await copy(value, {
                              format: b
                            })
                          }
                        },
                        {
                          label: 'Download',
                          onClick: async data => {
                            await fileSaver(
                              data,
                              getIconFilePaths(iconQuery.data, a).labeled
                            )
                          }
                        }
                      ]).map(({onClick, ...rest}) => ({
                        onClick: () => {
                          progress.with(async () => {
                            await onClick(await getTakumiBlob(a))
                          })
                        },
                        ...rest
                      }))
                  })),
                  'Iconify API', // https://iconify.design/docs/api/
                  ...[
                    {
                      label: 'SVG',
                      onClick: () => {
                        const url = new URL(
                          `${ICONIFY_API_URLS[0]}/${iconSetQuery.data.prefix}/${iconQuery.data.name}.svg`
                        )

                        url.searchParams.set(
                          'color',
                          globalIconCustomisations.color
                        )

                        mapValues(iconSize, (a, b) => {
                          url.searchParams.set(b, a)
                        })

                        url.searchParams.set(
                          'flip',
                          String(
                            compact(
                              Object.entries(
                                pick(
                                  iconCustomisations,
                                  Object.keys(flipDirections)
                                )
                              ).map(([a, b]) => b && flipDirections[a])
                            )
                          ).toLowerCase()
                        )

                        url.searchParams.set(
                          'rotate',
                          iconCustomisations.rotate
                        )

                        url.searchParams.set('box', true)

                        return url
                      }
                    },
                    {
                      label: 'CSS',
                      onClick: () => {
                        const url = new URL(
                          `${ICONIFY_API_URLS[0]}/${iconSetQuery.data.prefix}.css?icons=${iconQuery.data.name}`
                        )

                        url.searchParams.set(
                          'color',
                          globalIconCustomisations.color
                        )

                        return url
                      }
                    },
                    {
                      label: 'JSON',
                      onClick: () => {
                        const url = new URL(
                          `${ICONIFY_API_URLS[0]}/${iconSetQuery.data.prefix}.json?icons=${iconQuery.data.name}`
                        )

                        url.searchParams.set('pretty', true)

                        return url
                      }
                    }
                  ].map(({label, onClick, ...rest}) => ({
                    label,
                    menu: ICONIFY_API_URLS.map(a => {
                      const {hostname} = new URL(a)

                      return {
                        label: hostname,
                        onClick: async (...args) => {
                          const url = await onClick(...args)

                          url.hostname = hostname

                          prompt(label, url)
                        }
                      }
                    }),
                    ...rest
                  }))
                ]
              },
              {
                label: 'Customisation',
                menu: [
                  'Rotate',
                  ...rotate.values.map(value => ({
                    checked: value === iconCustomisations.rotate,
                    label: `${value * rotate.step}deg`,
                    onClick: () => {
                      customizedIcons.set(iconQuery.data.id, () => ({
                        rotate: value
                      }))
                    }
                  })),
                  'Flip',
                  ...Object.entries(flipDirections).map(
                    ([flipDirection, label]) => {
                      const checked = iconCustomisations[flipDirection]

                      return {
                        checked,
                        label,
                        onClick: () => {
                          customizedIcons.set(iconQuery.data.id, () => ({
                            [flipDirection]: !checked
                          }))
                        }
                      }
                    }
                  ),
                  'More',
                  {
                    label: 'Restart animations', // ?
                    onClick: () => {
                      customizedIcons.set(iconQuery.data.id, () => ({
                        wrapSvgContentStart: `<!-- ${crypto.randomUUID()} -->`
                      }))
                    }
                  },
                  {
                    disabled: true,
                    label: 'Color'
                  },
                  {
                    label: 'Reset',
                    onClick: () => {
                      customizedIcons.delete(iconQuery.data.id)
                    }
                  }
                ]
              },
              'Favorite',
              ...useFavoritedIcons.actions.map(a => ({
                label: sentenceCase(a),
                onClick: () => {
                  favoritedIcons[a](iconQuery.data.id)
                }
              })),
              ...menu
            ],
            onClick: () => {
              favoritedIcons.toggle(iconQuery.data.id)
            }
          },
          {
            separator: true
          },
          'Info',
          {
            description: iconSetQuery.data.name,
            label: 'Set name',
            onClick: () => {
              prompt(iconSetQuery.data.prefix, iconSetQuery.data.name)
            }
          },
          {
            description: iconSetQuery.data.author.name,
            label: 'Author',
            onClick: () => {
              prompt(
                iconSetQuery.data.author.name,
                iconSetQuery.data.author.url
              )
            }
          },
          {
            description: iconSetQuery.data.category,
            icon: 'tag',
            label: 'Category'
          },
          {
            description: `${iconSetQuery.data.license.spdx}${iconSetQuery.data.license.osiApproved ? ' (OSI)' : ''}`,
            label: 'License',
            onClick: () => {
              prompt(
                iconSetQuery.data.license.name,
                iconSetQuery.data.license.url
              )
            }
          },
          'Specs',
          {
            description: iconSetQuery.data.grid,
            label: 'Grid'
          },
          {
            description: sizeLabel(iconSize),
            icon: 'symbol-ruler',
            label: 'Size',
            menu: [
              {
                checked: isDefaultIconSizeCustomisations,
                disabled: isDefaultIconSizeCustomisations,
                label: 'Default',
                onClick: () => {
                  customizedIcons.set(
                    iconQuery.data.id,
                    () => defaultIconSizeCustomisations
                  )
                }
              },
              {
                label: 'Set',
                onClick: () => {
                  const value = aaaaaaaaaaaaaaaaaaaaaaaaa(
                    numbers(prompt(undefined, sizeLabel(iconSize)), {
                      splitter: /[,\sx]+/u
                    })
                  )

                  if (hasValues(value)) {
                    const size = {
                      height: value[1] ?? iconSize.height,
                      width: value[0] ?? iconSize.width
                    }

                    if (!isEqual(size, iconSize))
                      customizedIcons.set(iconQuery.data.id, () => size)
                  }
                }
              },
              {
                label: 'Scale',
                onClick: () => {
                  const [scale] = aaaaaaaaaaaaaaaaaaaaaaaaa(
                    numbers(prompt(undefined, 1), {
                      splitter: ' '
                    })
                  )

                  if (hasValues(scale))
                    customizedIcons.set(iconQuery.data.id, () => {
                      const a = mapValues(iconSize, a => a * scale)

                      if (Object.values(a).every(isSafeInteger)) return a
                    })
                }
              }
            ]
          },
          {
            description: findKey(
              iconSetQuery.data.chars,
              iconName => iconName === iconQuery.data.name
            ),
            label: 'Character',
            get onClick() {
              return () => {
                prompt(capitalCase(iconQuery.data.name), this.description)
              }
            }
          },
          'Misc',
          {
            description: iconAliases.length,
            label: 'Alias',
            menu: iconAliases.flatMap(iconAlias => [
              capitalCase(iconAlias),
              {
                label: 'View',
                onClick: () => {
                  prompt(undefined, iconAlias)
                }
              },
              {
                label: 'Search',
                onClick: () => {
                  searchTerm.set(iconAlias)
                }
              }
            ])
          },
          {
            description: size(iconQuery.data.more.idCases),
            label: 'ID cases',
            menu: Object.entries(iconQuery.data.more.idCases).map(([a, b]) => ({
              label: sentenceCase(a),
              menu: [
                b,
                {
                  label: 'Copy',
                  onClick: () => {
                    copy(b)
                  }
                }
              ]
            }))
          },
          {
            description: iconSetQuery.data.version,
            label: 'Version'
          },
          {
            description: timeAgo.unix(iconSetQuery.data.lastModified),
            icon: 'history',
            label: 'Last modified',
            onClick: () => {
              prompt('Unix time', iconSetQuery.data.lastModified)
            }
          },
          {
            description: index + 1,
            label: 'Order'
          }
        ]}
        render={
          <Slot.Cuelume.Hover
            style={{
              position: 'relative'
            }}
          />
        }>
        <Slot.Cuelume.Press>
          <div {...props}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                right: 0,
                top: 0
              }}>
              <React.Activity>
                {isFavorited && (
                  <Badge
                    color={THEME.COLORS.WARNING}
                    onClick={() => {
                      favoritedIcons.delete(iconQuery.data.id)
                    }}
                  />
                )}
                {isEqual(DEFAULT_ICON_CUSTOMISATIONS, iconCustomisations) || (
                  <Badge
                    color={THEME.COLORS.PRIMARY}
                    onClick={() => {
                      customizedIcons.delete(iconQuery.data.id)
                    }}
                  />
                )}
              </React.Activity>
            </div>
            <AccessibleIcon.Root label={iconQuery.data.id}>
              {React.cloneElement(iconQuery.data.more.to.reactElement, {
                height: globalIconCustomisations.square ? width : '100%',
                width
              })}
            </AccessibleIcon.Root>
          </div>
        </Slot.Cuelume.Press>
      </Menu>
    )
  })
)
