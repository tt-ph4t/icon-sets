import {formatForDisplay, useHotkey} from '@tanstack/react-hotkeys'
import {useIsFetching, useQueryClient} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {play} from 'cuelume'
import {pick} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'

import {IconGrid} from '../../components/icon-grid'
import {Menu} from '../../components/menu'
import {useTheme} from '../../components/theme'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {useSettings} from '../../hooks/use-settings'
import {open} from '../../misc'
import {GITHUB_REPO} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import Cuelume from '../cuelume'
import AllIconQueries from './all-icon-queries'
import FailedQueries from './failed-queries'
import useFont from './use-font'

const themeHotkey = 't'

const Settings = component(({menu}) => {
  const settings = useSettings()
  const theme = useTheme()
  const {isDev} = settings.useSelectValue('isDev')

  const layout = settings.useSelectValue(({draft}) =>
    pick(draft.layout, ['isReverse', 'isFullscreen'])
  )

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
            settings.set(({draft}) => {
              draft.layout.isReverse = !draft.layout.isReverse
            })
          }
        },
        {
          checked: layout.isFullscreen,
          label: 'Fullscreen',
          onClick: () => {
            settings.set(({draft}) => {
              draft.layout.isFullscreen = !draft.layout.isFullscreen
            })
          }
        },
        'Misc',
        {
          checked: isDev,
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

  useEffect.update(() => {
    play('tick')
  }, [queries.length])

  return (
    isFetching && (
      <ToolbarButton>
        Fetching {pluralize(queries.length, 'query')}
      </ToolbarButton>
    )
  )
})

export default menu => (
  <div
    style={{
      alignItems: 'flex-end',
      display: 'flex',
      flexDirection: 'column'
    }}>
    <FetchingQueries />
    <FailedQueries />
    <VscodeToolbarContainer>
      <Settings menu={castArray(menu)} />
      <Cuelume />
      <IconGrid.Search>
        <AllIconQueries />
      </IconGrid.Search>
    </VscodeToolbarContainer>
  </div>
)
