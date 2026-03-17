import { experimental_VGrid as VGrid } from 'virtua'

import { component } from '../../../hocs'
import { useMemo } from '../../../hooks/use-memo'
import { useRef } from '../../../hooks/use-ref'
import { has } from '../../../utils'
import Item from './item'

const defaultCol = 1

export default Object.assign(
  component(({ cellSize = 100, col, itemCount, renderItem }) => {
    const size = useRef.Size()

    col = useMemo(
      () =>
        Math.floor(
          col ??
            (has(size)
              ? Math.max(size.width / cellSize, defaultCol)
              : defaultCol)
        ),
      [col, size]
    )

    return (
      <VGrid
        cellHeight={cellSize}
        cellWidth={cellSize}
        col={col}
        domRef={size.ref}
        row={Math.ceil(itemCount / col)}>
        {context =>
          renderItem({
            context: {
              ...context,
              cellSize,
              index: context.rowIndex * col + context.colIndex
            }
          })
        }
      </VGrid>
    )
  }),
  { Item }
)
