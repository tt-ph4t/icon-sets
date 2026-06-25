import {formatForDisplay, useHotkey} from '@tanstack/react-hotkeys'
import {isEqual} from '@ver0/deep-equal'
import {castArray} from 'es-toolkit/compat'

import {IconGrid} from '../../components/icon-grid'
import {Menu} from '../../components/menu'
import {useTheme} from '../../components/theme'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useSettings} from '../../hooks/use-settings'
import {GITHUB_REPO} from '../../misc/constants'
import AllIconQueries from './all-icon-queries'
import useFont from './use-font'

const themeHotkey = 't'

const Settings = component(({menu}) => {
  const settings = useSettings()
  const theme = useTheme()

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
          description: formatForDisplay(themeHotkey),
          label: 'Theme',
          menu: theme.ids.map(themeId => ({
            label: themeId.label,
            onClick: () => {
              theme.set(themeId.value)
            },
            selected: themeId.value === theme.id
          }))
        },
        {
          label: 'Font',
          menu: [
            {
              label: 'Default',
              onClick: () => {
                font.set(({draft}) => {
                  draft.current = draft.default
                })
              },
              selected: isEqual(fontValue.current, fontValue.default)
            },
            {
              separator: true
            },
            ...Object.keys(useFont.families).map(a => ({
              label: a,
              onClick: () => {
                font.set(({draft}) => {
                  draft.current = useFont.families[a]
                })
              },
              selected: isEqual(fontValue.current, useFont.families[a])
            }))
          ]
        },
        'Layout',
        {
          label: 'Reverse',
          onClick: () => {
            settings.set(({draft}) => {
              draft.layout.isReverse = !draft.layout.isReverse
            })
          }
        },
        {
          label: 'Fullscreen',
          onClick: () => {
            settings.set(({draft}) => {
              draft.layout.isFullscreen = !draft.layout.isFullscreen
            })
          }
        },
        'Misc',
        {
          label: 'Devtools',
          onClick: () => {
            settings.set(({draft}) => {
              draft.isDev = !draft.isDev
            })
          }
        },
        {
          label: 'GitHub',
          onClick: () => {
            open(`https://github.com/${GITHUB_REPO}`)
          }
        },
        ...castArray(menu)
      ]}
      render={<ToolbarButton icon='settings' />}
    />
  )
})

export default component(({menu}) => (
  <>
    <Settings menu={menu} />
    <IconGrid.Search>
      <AllIconQueries />
    </IconGrid.Search>
  </>
))
