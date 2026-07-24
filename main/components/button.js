import {mergeProps} from '@base-ui/react'
import {isPlainObject} from '@sindresorhus/is'
import {VscodeButton, VscodeButtonGroup} from '@vscode-elements/react-elements'
import {castArray} from 'es-toolkit/compat'

import {component} from '../hocs'
import {getId} from '../misc/get-id'
import {Menu} from './menu'
import {Slot} from './slot'

export const Button = Object.assign(
  component(props => (
    <Slot.Interactive>
      <VscodeButton {...props} />
    </Slot.Interactive>
  )),
  {
    Group: component(({data, ...sharedProps}) => (
      <VscodeButtonGroup>
        {Iterator.from(castArray(data))
          .filter(isPlainObject)
          .map(({menu, ...props}, index) => (
            <Menu
              data={menu}
              key={getId(index, menu, props)}
              render={<Button secondary {...mergeProps(sharedProps, props)} />}
            />
          ))
          .toArray()}
      </VscodeButtonGroup>
    ))
  }
)
