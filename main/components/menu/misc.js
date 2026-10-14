import {component} from '../../hocs'
import {buildContext} from '../../misc/build-context'
import {Slot} from '../slot'

export {isString as isGroupLabel} from '@sindresorhus/is'
export const Context = buildContext()

export const ContextSlot = Object.assign(
  component(({as: Component, selector, ...props}) => {
    const defaultProps = Context.useSelectValue(selector)

    return (
      <Slot {...defaultProps}>
        <Component {...props} />
      </Slot>
    )
  }),
  {
    selectors: ['TriggerProps', 'RootProps', 'ItemProps'].reduce((a, b) => {
      a[b] = ({context}) => context[b]

      return a
    }, {})
  }
)
