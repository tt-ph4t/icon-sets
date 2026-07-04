import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'

import {component} from '../../hocs'

const defaultStyle = {
  maxWidth: 'unset'
}

export default component(({children, style}) => (
  <VscodeFormContainer style={defaultStyle}>
    <VscodeFormGroup style={defaultStyle} variant='settings-group'>
      <VscodeFormHelper
        style={{
          ...defaultStyle,
          height: 'var(--SIDEBAR-CONTENT-HEIGHT)',
          ...style
        }}>
        {children}
      </VscodeFormHelper>
    </VscodeFormGroup>
  </VscodeFormContainer>
))
