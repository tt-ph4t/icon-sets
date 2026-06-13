import {formatForDisplay, useHotkey} from '@tanstack/react-hotkeys'

import {IconGrid} from '../../components/icon-grid'
import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useSettings} from '../../hooks/use-settings'
import {useTheme} from '../../hooks/use-theme'
import AllIconQueries from './all-icon-queries'

const themeHotkey = 't'

const Settings = component(({menu}) => {
  const settings = useSettings()
  const theme = useTheme()

  useHotkey(themeHotkey, () => {
    theme.set(theme.cycled.peek(1).value)
  })

  return (
    <Menu
      data={[
        {
          label: 'Devtools',
          onClick: () => {
            settings.set(({draft}) => {
              draft.isDev = !draft.isDev
            })
          }
        },
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
        ...menu
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
