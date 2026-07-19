import {VscodeTextfield} from '@vscode-elements/react-elements'
import {play} from 'cuelume'

import {component} from '../hocs'
import {Slot} from './slot'

export const Textfield = component(props => (
  <Slot
    onInput={() => {
      play('press')
    }}>
    <VscodeTextfield {...props} />
  </Slot>
))
