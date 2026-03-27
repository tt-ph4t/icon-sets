import {experimental_VGrid as VGrid} from 'virtua'

import {component} from '../../hocs'
import {useRef} from '../../hooks/use-ref'
import {has} from '../../misc'
import {renderSlot} from '../../misc/render-slot'

const defaultCol = 1

export default component(
  ({cellSize = 100, bufferSize = cellSize * 2, col, item, row}) => {
    const size = useRef.Size()

    col = Math.floor(
      col ??
        (has(size) ? Math.max(size.width / cellSize, defaultCol) : defaultCol)
    )

    row = Math.ceil(row ?? item.count / col)

    return (
      <VGrid
        bufferSize={bufferSize}
        cellHeight={cellSize}
        cellWidth={cellSize}
        col={col}
        domRef={size.ref}
        row={row}>
        {context =>
          renderSlot({
            bespoke: item.render,
            context: {
              ...context,
              cellSize,
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
