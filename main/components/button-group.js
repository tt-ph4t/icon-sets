import {mergeProps} from '@base-ui/react'
import {isPlainObject} from '@sindresorhus/is'
import {VscodeButton, VscodeButtonGroup} from '@vscode-elements/react-elements'
import {castArray} from 'es-toolkit/compat'

import {component} from '../hocs'
import {getId} from '../misc/get-id'
import {Menu} from './menu'

export const ButtonGroup = component(({data, ...props}) => (
  <VscodeButtonGroup>
    {Iterator.from(castArray(data))
      .filter(isPlainObject)
      .map(({menu, ...ButtonProps}, index) => (
        <Menu
          data={menu}
          key={getId(index, menu, ButtonProps)}
          render={
            <VscodeButton secondary {...mergeProps(props, ButtonProps)} />
          }
        />
      ))
      .toArray()}
  </VscodeButtonGroup>
))
