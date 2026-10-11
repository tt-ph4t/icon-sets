import {isEqual} from '@ver0/deep-equal'
import {VscodeIcon} from '@vscode-elements/react-elements'
import {identity} from 'es-toolkit'
import {AccessibleIcon} from 'radix-ui'
import React from 'react'

import {component} from '../../../hocs'
import {useCustomizedIcons} from '../../../hooks/use-customized-icons'
import {useFavoritedIcons} from '../../../hooks/use-favorited-icons'
import {useIconQuery} from '../../../hooks/use-icon-query'
import {hasValues} from '../../../misc'
import {DEFAULT_ICON_CUSTOMISATIONS, THEME} from '../../../misc/constants'
import {Slot} from '../../slot'
import Context from './context'
import withMenu from './with-menu'
import withQueryBoundary from './with-query-boundary'

const Badge = Object.assign(
  component(({color, ...props}) => (
    <Slot.Cuelume.Press
      style={
        hasValues(color) && {
          '--vscode-icon-foreground': color
        }
      }>
      <VscodeIcon name='circle-filled' size={13} {...props} />
    </Slot.Cuelume.Press>
  )),
  {
    Customized: component(props => {
      const {iconId} = Context.useSelectValue('iconId')
      const {iconCustomisations} = useCustomizedIcons.useSelect(iconId)
      const customizedIcons = useCustomizedIcons()

      return (
        isEqual(DEFAULT_ICON_CUSTOMISATIONS, iconCustomisations) || (
          <Slot
            onClick={() => {
              customizedIcons.delete(iconId)
            }}>
            <Badge color={THEME.COLORS.PRIMARY} {...props} />
          </Slot>
        )
      )
    }),
    Favorited: component(props => {
      const {iconId} = Context.useSelectValue('iconId')
      const favoritedIcons = useFavoritedIcons()

      return (
        favoritedIcons.has(iconId) && (
          <Slot
            onClick={() => {
              favoritedIcons.delete(iconId)
            }}>
            <Badge color={THEME.COLORS.WARNING} {...props} />
          </Slot>
        )
      )
    })
  }
)

export default withQueryBoundary(
  withMenu(
    component(props => {
      const {iconId} = Context.useSelectValue('iconId')

      const iconQuery = useIconQuery(iconId, {
        select: identity
      })

      return (
        <>
          <AccessibleIcon.Root label={iconId}>
            {React.cloneElement(iconQuery.data.more.to.reactElement, {
              height: 'calc(var(--SPACING) * 12)',
              width: 'calc(var(--SPACING) * 12)',
              ...props
            })}
          </AccessibleIcon.Root>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              right: 0,
              top: 0
            }}>
            <Badge.Favorited />
            <Badge.Customized />
          </div>
        </>
      )
    })
  )
)
