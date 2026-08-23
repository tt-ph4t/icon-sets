import {isPlainObject} from '@sindresorhus/is'
import {VscodeButton, VscodeButtonGroup} from '@vscode-elements/react-elements'
import {castArray} from 'es-toolkit/compat'

import {component} from '../hocs'
import {getId} from '../misc/get-id'
import {Menu} from './menu'
import {Slot} from './slot'

export const Button = Object.assign(
  component(props => (
    <Slot.Cuelume.Press>
      <VscodeButton {...props} />
    </Slot.Cuelume.Press>
  )),
  {
    Group: component(({data, ...sharedProps}) => (
      <VscodeButtonGroup>
        {Iterator.from(castArray(data))
          .filter(isPlainObject)
          .map(({menu, ...props}) => (
            <Menu
              data={menu}
              key={getId(menu, props)}
              render={
                <Slot {...sharedProps}>
                  <Button secondary {...props} />
                </Slot>
              }
            />
          ))
          .toArray()}
      </VscodeButtonGroup>
    ))
  }
)
