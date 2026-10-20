import {noop} from 'es-toolkit'
import {VGrid} from 'virtua'

import {component} from '../../hocs'
import {useSize} from '../../hooks/use-size'
import {Slot} from '../slot'

export default component(
  ({
    cols,
    colWidth = 0,
    count = 0,
    renderItem = noop,
    rowHeight = colWidth,
    rows,
    ...props
  }) => {
    const size = useSize()

    cols ??= Math.max(1, Math.floor(size.width / colWidth))
    rows ??= Math.ceil(count / cols)

    return (
      <div
        ref={size.ref}
        style={{
          '--size': 'inherit',

          height: 'var(--size)',
          width: 'var(--size)'
        }}>
        <VGrid
          cols={cols}
          colWidth={colWidth}
          rowHeight={rowHeight}
          rows={rows}
          {...props}>
          {(row, col, cell) =>
            Slot.render({
              bespoke: renderItem,
              context: {
                col,
                cols,
                index: cell.rowIndex * cols + cell.colIndex,
                row,
                rows
              }
            })
          }
        </VGrid>
      </div>
    )
  }
)
