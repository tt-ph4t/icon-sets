import {IconGrid} from '../../components/icon-grid'
import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useSettings} from '../../hooks/use-settings'
import AllIconQueries from './all-icon-queries'

const Settings = component(({menu}) => {
  const settings = useSettings()

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
          label: 'Layout',
          menu: [
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
            }
          ]
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
