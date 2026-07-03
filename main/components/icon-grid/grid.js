import {experimental_VGrid as VGrid} from 'virtua'

import {component} from '../../hocs'
import {useRef} from '../../hooks/use-ref'
import {renderSlot} from '../../misc/render-slot'

export default component(
  ({
    bufferSize,
    cellHeight = Number.MIN_SAFE_INTEGER,
    cellWidth = Number.MIN_SAFE_INTEGER,
    col,
    count = 0,
    renderItem,
    row
  }) => {
    const size = useRef.size()

    col ??= Math.max(1, Math.floor(size.width / cellWidth))
    row ??= Math.ceil(count / col)

    return (
      <VGrid
        bufferSize={bufferSize ?? size.height * 0.1}
        cellHeight={cellHeight}
        cellWidth={cellWidth}
        col={col}
        domRef={size.ref}
        row={row}>
        {context =>
          renderSlot({
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
