import {isSafeInteger} from '@sindresorhus/is'
import {useHotkey} from '@tanstack/react-hotkeys'
import {isEqual} from '@ver0/deep-equal'
import {castArray} from 'es-toolkit/compat'
import {find, map, pipe} from 'es-toolkit/fp'

import {Kbd} from '../../components/kbd'
import {Menu} from '../../components/menu'
import {useTheme} from '../../components/theme'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useSettings} from '../../hooks/use-settings'
import {numbers, open} from '../../misc'
import {GITHUB_REPO} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import {takumi} from '../../misc/takumi'
import Layout from '../layout'
import Font from './font'
import PrefetchIcons from './prefetch-icons'

const usePrefetchIconsMenu = () => {
  const store = PrefetchIcons.useStore()
  const state = store.useValue()
  const description = pluralize(state.batchSize, 'icon')

  return {
    disabled: state.done,
    label: 'Background prefetching',
    menu: [
      {
        checked: state.enabled,
        label: 'Enabled',
        onClick: () => {
          store.toggle('enabled')
        }
      },
      {
        description,
        label: 'Set',
        onClick: () => {
          store.set(({draft}) => {
            draft.batchSize = Math.abs(
              pipe(
                numbers(prompt(undefined, description), {
                  splitter: ' '
                }),
                map(Math.round),
                find(isSafeInteger)
              ) ?? draft.batchSize
            )
          })
        }
      }
    ]
  }
}

const useThemeMenu = () => {
  const theme = useTheme()
  const hotkey = 't'

  useHotkey(hotkey, () => {
    theme.set(theme.cycled.peek(1).value)
  })

  return {
    description: Kbd.text(hotkey),
    label: 'Theme',
    menu: theme.ids.map(themeId => ({
      checked: themeId.value === theme.id,
      label: themeId.label,
      onClick: () => {
        theme.set(themeId.value)
      }
    }))
  }
}

export default component(({menu, ...props}) => {
  const prefetchIconsMenu = usePrefetchIconsMenu()
  const themeMenu = useThemeMenu()

  const settings = useSettings()
  const settingsState = settings.useSelectValue('isDev')

  const takumiStore = takumi.useStore()
  const takumiState = takumiStore.useValue()

  const layoutStore = Layout.useStore()
  const layoutState = layoutStore.useSelectValue('isReverse', 'isFullscreen')

  const fontStore = Font.useStore()
  const fontState = fontStore.useValue()

  return (
    <Menu
      data={[
        themeMenu,
        {
          label: 'Font',
          menu: Object.entries(Font.families).map(([a, b]) => {
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
                fontStore.set(({draft}) => {
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
        prefetchIconsMenu,
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
        ...castArray(menu)
      ]}
      render={<ToolbarButton icon='settings' {...props} />}
    />
  )
})
