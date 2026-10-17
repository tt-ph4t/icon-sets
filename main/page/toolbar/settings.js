import {useHotkey} from '@tanstack/react-hotkeys'
import {isEqual} from '@ver0/deep-equal'
import {castArray} from 'es-toolkit/compat'

import {Kbd} from '../../components/kbd'
import {Menu} from '../../components/menu'
import {useTheme} from '../../components/theme'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {open} from '../../misc'
import {GITHUB_REPO} from '../../misc/constants'
import {takumi} from '../../misc/takumi'
import Font from './font'

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
  const themeMenu = useThemeMenu()

  const takumiStore = takumi.useStore()
  const takumiState = takumiStore.useValue()

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
