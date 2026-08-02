import {
  useHeldKeys,
  useHotkey,
  useHotkeyRegistrations
} from '@tanstack/react-hotkeys'
import {useIsFetching, useQueryClient} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {play} from 'cuelume'
import {delay, mapValues, sumBy} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import ms from 'ms'
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
import useFont from './use-font'

const themeHotkey = 't'

const Settings = component(({menu}) => {
  const settings = useSettings()
  const theme = useTheme()
  const {isDev} = settings.useSelectValue('isDev')

  const takumiStore = takumi.useStore()
  const takumiOptions = takumiStore.useValue()

  const layoutStore = Layout.useStore()
  const layout = layoutStore.useSelectValue('isReverse', 'isFullscreen')

  const font = useFont()
  const fontValue = font.useValue()

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
          menu: [
            {
              checked: isEqual(fontValue.current, fontValue.default),
              label: 'Default',
              onClick: () => {
                font.set(({draft}) => {
                  draft.current = draft.default
                })
              }
            },
            {
              separator: true
            },
            ...Object.keys(useFont.families).map(a => ({
              checked: isEqual(fontValue.current, useFont.families[a]),
              label: a,
              onClick: () => {
                font.set(({draft}) => {
                  draft.current = useFont.families[a]
                })
              }
            }))
          ]
        },
        'Layout',
        {
          checked: layout.isReverse,
          label: 'Reverse',
          onClick: () => {
            layoutStore.toggle('isReverse')
          }
        },
        {
          checked: layout.isFullscreen,
          label: 'Fullscreen',
          onClick: () => {
            layoutStore.toggle('isFullscreen')
          }
        },
        'Misc',
        {
          label: takumi.label,
          menu: [
            {
              checked: takumiOptions.drawDebugBorder,
              label: 'drawDebugBorder',
              onClick: () => {
                takumiStore.toggle('drawDebugBorder')
              }
            },
            'dithering',
            ...takumi.ditheringValues.map(dithering => ({
              checked: dithering === takumiOptions.dithering,
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
          checked: isDev,
          label: 'Devtools',
          onClick: () => {
            settings.toggle('isDev')
          }
        },
        {
          label: 'GitHub',
          onClick: () => {
            open(`https://github.com/${GITHUB_REPO}`)
          }
        },
        ...menu
      ]}
      render={<ToolbarButton icon='settings' />}
    />
  )
})

const FetchingQueries = component(() => {
  const isFetching = Boolean(useIsFetching())

  const queries = useQueryClient()
    .getQueryCache()
    .findAll({
      predicate: query => query.state.fetchStatus === 'fetching'
    })

  return (
    isFetching && (
      <ToolbarButton>
        Fetching {pluralize(queries.length, 'query')}
      </ToolbarButton>
    )
  )
})

const HeldKeys = component(() => {
  const heldKeys = useHeldKeys()
  const progress = useProgress()

  const triggerCounts = mapValues(useHotkeyRegistrations(), a =>
    sumBy(a, hotkeyRegistrationView => hotkeyRegistrationView.triggerCount)
  )

  useEffect.update(() => {
    progress.with(async () => {
      play('release')

      await delay(ms('.1s'))
    })
  }, [triggerCounts])

  return hasValues(heldKeys) && <Kbd keys={heldKeys} />
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
