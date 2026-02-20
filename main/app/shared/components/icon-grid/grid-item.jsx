import { stringToIcon } from '@iconify/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { VscodeIcon } from '@vscode-elements/react-elements'
import { useUnmount } from 'ahooks'
import { capitalCase } from 'change-case'
import { findKey, uniq } from 'es-toolkit'
import { size, truncate } from 'es-toolkit/compat'
import React from 'react'
import root from 'react-shadow'

import { ICON_SETS_URL } from '../../constants'
import { component } from '../../hocs'
import { useBookmarkedIcons } from '../../hooks/use-bookmarked-icons'
import { useCallback } from '../../hooks/use-callback'
import { useCustomizedIcons } from '../../hooks/use-customized-icons'
import { useIconQueries } from '../../hooks/use-icon-queries'
import { useMemo } from '../../hooks/use-memo'
import {
  copy,
  fileSaver,
  getQueryOptions,
  has,
  openObjectURL
} from '../../utils'
import { prettyBytes } from '../../utils/pretty-bytes'
import { timeAgo } from '../../utils/time-ago'
import { Menu } from '../base-ui/menu'
import { useSearchTerm } from './hooks'

const flipDirections = {
  hFlip: 'Horizontal flip',
  vFlip: 'Vertical flip'
}

export default component(({ context, iconId }) => {
  const icon = useMemo(() => stringToIcon(iconId), [iconId])
  const iconNameFallback = useMemo(() => icon.name.slice(0, 3), [icon.name])
  const queryClient = useQueryClient()
  const searchTerm = useSearchTerm()
  const bookmarkedIcons = useBookmarkedIcons()
  const customizedIcons = useCustomizedIcons()
  const { iconCustomisations } = useCustomizedIcons.useSelectValue(iconId)

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
      select: useCallback(
        iconSets => {
          const { icons, ...iconSet } = iconSets[icon.prefix]

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
        data={[{ label: iconId }, { separator: true }, ...iconQueryMenu]}
        render={<span>{iconNameFallback}</span>}
      />
    )

  if (iconQuery.isError)
    return (
      <Menu
        data={[
          { label: iconId },
          { separator: true },
          { label: iconQuery.error.message },
          { separator: true },
          ...iconQueryMenu
        ]}
        render={
          <span
            style={{ color: 'var(--vscode-activityErrorBadge-background)' }}>
            {iconNameFallback}
          </span>
        }
      />
    )

  const iconAliases = uniq([
    iconQuery.data.name,
    ...(iconSetQuery.data.aliases[iconQuery.data.name] ?? [])
  ])

  return (
    <Menu
      data={[
        {
          label: capitalCase(iconQuery.data.name),
          menu: [
            {
              label: 'Bookmark',
              menu: ['toggle', 'add', 'delete'].map(a => ({
                label: capitalCase(a),
                onClick: () => {
                  bookmarkedIcons[a](iconQuery.data.id)
                }
              }))
            },
            {
              label: 'More',
              menu: [
                {
                  label: 'Reset',
                  onClick: () => {
                    customizedIcons.delete(iconQuery.data.id)
                  }
                },
                { separator: true },
                {
                  label: 'Restart animations',
                  onClick: () => {
                    customizedIcons.set(iconQuery.data.id, () => ({
                      wrapSvgContentStart: `<!-- ${crypto.randomUUID()} -->`
                    }))
                  }
                },
                ...Object.keys(flipDirections).map(flipDirection => ({
                  label: flipDirections[flipDirection],
                  onClick: () => {
                    customizedIcons.set(
                      iconQuery.data.id,
                      ({ iconCustomisations }) => ({
                        [flipDirection]: !iconCustomisations[flipDirection]
                      })
                    )
                  }
                }))
              ]
            },
            { separator: true },
            ...Object.entries(iconQuery.data['/'].paths).map(
              ([fileType, fileName]) => {
                const icon = iconQuery.data['/'].as(fileType)

                return {
                  description: prettyBytes(icon.blob),
                  label: fileType.toUpperCase(),
                  menu: has(icon) && [
                    {
                      label: 'View',
                      onClick: async () => {
                        await openObjectURL(icon.blob)
                      }
                    },
                    {
                      label: 'Copy',
                      onClick: () => {
                        copy(icon.data, {
                          // format: icon.mimeType
                        })
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
            )
          ],
          onClick: () => {
            bookmarkedIcons.toggle(iconQuery.data.id)
          }
        },
        { separator: true },
        {
          description: context.index + 1,
          label: 'Order'
        },
        {
          description: size(iconQuery.data['/'].idCases),
          label: 'ID Cases',
          menu: Object.entries(iconQuery.data['/'].idCases).map(
            ([label, id]) => {
              label = capitalCase(label)

              return {
                description: truncate(id, { length: 6 }),
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
          description: `${iconQuery.data.data.width} x ${iconQuery.data.data.height}`,
          label: 'Size'
        },
        {
          description: iconAliases.length,
          label: 'Alias',
          menu: iconAliases.map(iconAlias => ({
            label: capitalCase(iconAlias),
            onClick: () => {
              searchTerm.set(({ draft }) => {
                draft.current = iconAlias
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
        <root.div
          icon={iconQuery.data.id}
          style={{
            '--size': '40%',

            height: 'var(--size)',
            position: 'relative',
            width: 'var(--size)'
          }}>
          <React.Activity
            mode={
              bookmarkedIcons.has(iconQuery.data.id) ? 'visible' : 'hidden'
            }>
            <VscodeIcon
              name='circle-filled'
              onClick={() => {
                bookmarkedIcons.delete(iconQuery.data.id)
              }}
              size={12}
              style={{
                '--vscode-icon-foreground':
                  'var(--vscode-activityWarningBadge-background)',

                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 1
              }}
            />
          </React.Activity>
          <div
            icon={iconQuery.data.id}
            style={{
              '--size': '100%',

              height: 'var(--size)',
              width: 'var(--size)'
            }}
          />
          <style>{iconQuery.data['/'].to.css}</style>
        </root.div>
      }
    />
  )
})
