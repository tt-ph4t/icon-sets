import {isString} from '@sindresorhus/is'
import {VscodeProgressRing} from '@vscode-elements/react-elements'

import {component} from '../hocs'

export const ProgressRing = component(({children, ...props}) => {
  const progressRing = <VscodeProgressRing {...props} />

  return isString(children) ? (
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
