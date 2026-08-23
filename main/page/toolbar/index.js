import {
  useHeldKeys,
  useHotkey,
  useHotkeyRegistrations
} from '@tanstack/react-hotkeys'
import {useIsFetching, useQueryClient} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import {play} from 'cuelume'
import {mapValues, sumBy} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import React from 'react'

import {IconGrid} from '../../components/icon-grid'
import {Kbd} from '../../components/kbd'
import {Menu} from '../../components/menu'
import {useProgress} from '../../components/progress'
import {useTheme} from '../../components/theme'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {useSettings} from '../../hooks/use-settings'
import {hasValues, open} from '../../misc'
import {GITHUB_REPO} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import {takumi} from '../../misc/takumi'
import Layout from '../layout'
import AllIconQueries from './all-icon-queries'
import Cuelume from './cuelume'
import FailedQueries from './failed-queries'
import Fps from './fps'
import PrefetchQueries from './prefetch-queries'
import useFont from './use-font'

const themeHotkey = 't'

useNetwork

const Settings = component(({menu, ...props}) => {
  const theme = useTheme()

  const settings = useSettings()
  const settingsState = settings.useSelectValue('isDev')

  const takumiStore = takumi.useStore()
  const takumiState = takumiStore.useValue()

  const layoutStore = Layout.useStore()
  const layoutState = layoutStore.useSelectValue('isReverse', 'isFullscreen')

  const font = useFont()
  const fontState = font.useValue()

  const prefetchQueriesStore = PrefetchQueries.useStore()

  const prefetchQueriesState = prefetchQueriesStore.useSelectValue(
    'enabled',
    'done'
  )

  useFont.useInit()

  useHotkey(themeHotkey, () => {
    theme.set(theme.cycled.peek(1).value)
  })

  return (
    <Menu
      data={[
        {
          description: Kbd.text(themeHotkey),
          label: 'Theme',
          menu: theme.ids.map(themeId => ({
            checked: themeId.value === theme.id,
            label: themeId.label,
            onClick: () => {
              theme.set(themeId.value)
            }
          }))
        },
        {
          label: 'Font',
          menu: Object.entries(useFont.families).map(([a, b]) => {
            const checked = isEqual(fontState.current, b)

            return {
              checked,
              label: a,
              menu: Object.values(b).map(label => ({
                checked,
                disabled: true,
                label
              })),
              onClick: () => {
                font.set(({draft}) => {
                  draft.current = checked ? draft.default : b
                })
              }
            }
          })
        },
        {
          label: takumi.label,
          menu: [
            {
              checked: takumiState.drawDebugBorder,
              label: 'drawDebugBorder',
              onClick: () => {
                takumiStore.toggle('drawDebugBorder')
              }
            },
            'dithering',
            ...takumi.ditheringValues.map(dithering => ({
              checked: dithering === takumiState.dithering,
              label: dithering,
              onClick: () => {
                takumiStore.set(({draft}) => {
                  draft.dithering = dithering
                })
              }
            }))
          ]
        },
        {
          checked: prefetchQueriesState.enabled,
          disabled: prefetchQueriesState.done,
          label: 'Background prefetching',
          onClick: () => {
            prefetchQueriesStore.toggle('enabled')
          }
        },
        {
          checked: settingsState.isDev,
          label: 'Devtools',
          onClick: () => {
            settings.toggle('isDev')
          }
        },
        'Layout',
        {
          checked: layoutState.isReverse,
          label: 'Reverse',
          onClick: () => {
            layoutStore.toggle('isReverse')
          }
        },
        {
          checked: layoutState.isFullscreen,
          label: 'Fullscreen',
          onClick: () => {
            layoutStore.toggle('isFullscreen')
          }
        },
        'Misc',
        {
          label: 'GitHub',
          onClick: () => {
            open(`https://github.com/${GITHUB_REPO}`)
          }
        },
        ...menu
      ]}
      render={<ToolbarButton icon='settings' {...props} />}
    />
  )
})

const FetchingQueries = component(props => {
  const isFetching = Boolean(useIsFetching())

  const queries = useQueryClient()
    .getQueryCache()
    .findAll({
      predicate: query => query.state.fetchStatus === 'fetching'
    })

  return (
    isFetching && (
      <ToolbarButton {...props}>
        Fetching {pluralize(queries, 'query')}
      </ToolbarButton>
    )
  )
})

const HeldKeys = component(props => {
  const heldKeys = useHeldKeys()
  const progress = useProgress()

  const triggerCounts = mapValues(useHotkeyRegistrations(), a =>
    sumBy(a, hotkeyRegistrationView => hotkeyRegistrationView.triggerCount)
  )

  useEffect.update(() => {
    progress.with(() => {
      play('release')
    })
  }, [triggerCounts])

  return hasValues(heldKeys) && <Kbd keys={heldKeys} {...props} />
})

export default menu => (
  <div
    style={{
      alignItems: 'flex-end',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--SPACING)'
    }}>
    <React.Activity>
      <HeldKeys />
      <PrefetchQueries />
      <FetchingQueries />
      <FailedQueries />
      <Fps />
    </React.Activity>
    <VscodeToolbarContainer>
      <Settings menu={castArray(menu)} />
      <Cuelume />
      <IconGrid.Search>
        <AllIconQueries />
      </IconGrid.Search>
    </VscodeToolbarContainer>
  </div>
)
