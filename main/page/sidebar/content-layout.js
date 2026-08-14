import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'

import {Slot} from '../../components/slot'
import {component} from '../../hocs'

const defaultStyle = {
  maxWidth: 'unset'
}

export default component(props => (
  <VscodeFormContainer style={defaultStyle}>
    <VscodeFormGroup style={defaultStyle} variant='settings-group'>
      <Slot
        style={{
          ...defaultStyle,
          height: 'var(--SIDEBAR-CONTENT-HEIGHT)'
        }}>
        <VscodeFormHelper {...props} />
      </Slot>
    </VscodeFormGroup>
  </VscodeFormContainer>
))
