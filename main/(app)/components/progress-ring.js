import {VscodeProgressRing} from '@vscode-elements/react-elements'

import {component} from '../hocs'
import {isWordCharacter} from '../misc'

export const ProgressRing = component(({children, ...props}) => {
  const progressRing = <VscodeProgressRing {...props} />

  return isWordCharacter(children) ? (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column'
      }}>
      {progressRing}
      {children}
    </div>
  ) : (
    progressRing
  )
})
