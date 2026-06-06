import {VscodeButton, VscodeButtonGroup} from '@vscode-elements/react-elements'
import {pick} from 'es-toolkit'

import {component} from '../hocs'
import {Menu} from './menu'

export const ButtonGroup = component(
  ({icon = 'chevron-down', menu, onMenuClick, ...props}) => (
    <VscodeButtonGroup>
      <VscodeButton {...props} />
      <Menu
        data={menu}
        render={
          <VscodeButton
            icon={icon}
            onClick={onMenuClick}
            {...pick(props, ['disabled', 'secondary'])}
          />
        }
      />
    </VscodeButtonGroup>
  )
)
