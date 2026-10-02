import {asyncNoop} from 'es-toolkit'

import {buildContext} from '../misc/build-context'

export default buildContext({
  remount: asyncNoop
})
