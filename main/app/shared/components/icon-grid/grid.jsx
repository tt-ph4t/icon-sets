import { experimental_VGrid as VGrid } from 'virtua'

import { component } from '../../hocs'
import { useMemo } from '../../hooks/use-memo'
import { useSize } from '../../hooks/use-size'
import { has } from '../../utils'

const defaultCol = 1

export default component(({ cellSize = 100, col, itemCount, renderItem }) => {
  const size = useSize()

  col = useMemo(
    () =>
      Math.floor(
        col ??
          (has(size) ? Math.max(size.width / cellSize, defaultCol) : defaultCol)
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
})
