import {useMergedRefs} from '@base-ui/utils/useMergedRefs'
import {experimental_VGrid as VGrid} from 'virtua'

import {component} from '../../hocs'
import {useRef} from '../../hooks/use-ref'
import {Slot} from '../slot'

const defaultCellSize = Number.MIN_SAFE_INTEGER

export default component(
  ({
    cellWidth = defaultCellSize,
    col,
    count = 0,
    domRef,
    renderItem,
    row,
    ...props
  }) => {
    const size = useRef.size()

    domRef = useMergedRefs(domRef, size.ref)

    col ??= Math.max(1, Math.floor(size.width / cellWidth))
    row ??= Math.ceil(count / col)

    return (
      <VGrid
        bufferSize={size.height * 0.1}
        cellHeight={defaultCellSize}
        cellWidth={cellWidth}
        col={col}
        domRef={domRef}
        row={row}
        {...props}>
        {context =>
          Slot.render({
            bespoke: renderItem,
            context: {
              ...context,
              col,
              index: context.rowIndex * col + context.colIndex,
              row
            }
          })
        }
      </VGrid>
    )
  }
)
