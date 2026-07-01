import {isPlainObject} from '@sindresorhus/is'
import {identity, noop} from 'es-toolkit'
import {renderSlot as render} from 'render-slot'

export const renderSlot = options => {
  if (isPlainObject(options)) {
    const {context, wrapper = identity, ...props} = options

    return render({
      context: {
        context
      },
      wrapper,
      ...props,
      default: props.default ?? noop
    })
  }

  return render(options)
}
