import {
  VscodeButton,
  VscodeButtonGroup
} from '@vscode-elements/react-elements'
import { pick } from 'es-toolkit'

import { component } from '../hocs'
import { Menu } from './base-ui/menu'

export const ButtonGroup = component(({ menu, ...props }) => (
  <VscodeButtonGroup>
    <VscodeButton {...props} />
    <Menu
      data={menu}
      render={
        <VscodeButton
          icon='chevron-down'
          {...pick(props, ['disabled', 'secondary'])}
        />
      }
    />
  </VscodeButtonGroup>
))
