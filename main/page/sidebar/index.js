import {useUpdate} from 'ahooks'
import {sentenceCase} from 'change-case'

import {Collapsible} from '../../components/collapsible'
import {IconGrid} from '../../components/icon-grid'
import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useFavoritedIcons} from '../../hooks/use-favorited-icons'
import {hasValues} from '../../misc'
import {ICON_CACHE} from '../../misc/constants'
import AllIconSets from './all-icon-sets'
import ContentLayout from './content-layout'
import IconGroups from './icon-groups'

const iconGrid = (menu, props) => (
  <>
    <ContentLayout>
      <IconGrid {...props} />
    </ContentLayout>
    {hasValues(menu) && (
      <Menu
        data={menu}
        render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
      />
    )}
  </>
)

const CustomizedIcons = component(() => {
  const customizedIcons = useCustomizedIcons()
  const iconIds = useCustomizedIcons.useIconIds()

  return (
    <Collapsible description={iconIds.length} heading='customized icons'>
      {iconGrid(
        {
          label: 'Reset',
          onClick: customizedIcons.reset
        },
        {
          iconIds
        }
      )}
    </Collapsible>
  )
})

const CachedIcons = component(() => {
  const update = useUpdate()
  const iconIds = [...ICON_CACHE.values()].map(icon => icon.id)

  return (
    <Collapsible
      description={`${iconIds.length} / ${ICON_CACHE.max}`}
      heading='cached icons'
      onToggle={event => {
        if (event.detail.open) update()
      }}>
      {iconGrid(
        [
          {
            label: 'Update',
            onClick: update
          },
          {
            separator: true
          },
          ...['purgeStale', 'pop', 'clear'].map(a => ({
            label: sentenceCase(a),
            onClick: () => {
              ICON_CACHE[a]()
              update()
            }
          }))
        ],
        {
          iconIds
        }
      )}
    </Collapsible>
  )
})

const FavoritedIcons = component(() => {
  const favoritedIcons = useFavoritedIcons()
  const iconIds = favoritedIcons.get()

  return (
    <Collapsible description={iconIds.length} heading='favorited icons'>
      {iconGrid(
        {
          label: 'Reset',
          onClick: favoritedIcons.reset
        },
        {
          iconIds
        }
      )}
    </Collapsible>
  )
})

export default component(() => (
  <>
    <AllIconSets />
    <IconGroups />
    <FavoritedIcons />
    <CustomizedIcons />
    <CachedIcons />
  </>
))
