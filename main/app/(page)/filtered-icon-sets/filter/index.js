import {useQuery} from '@tanstack/react-query'
import {
  VscodeDivider,
  VscodeToolbarContainer
} from '@vscode-elements/react-elements'
import React from 'react'

import {Popover} from '../../../components/popover'
import {ToolbarButton} from '../../../components/toolbar-button'
import {component} from '../../../hocs'
import {DEFAULT_QUERY_OPTIONS} from '../../../misc/constants'
import {isFiltering, useStore} from '../misc'
import MultiSelect from './multi-select'
import Tree from './tree'

const Label = component(() => {
  const selectedIconSetPrefixes = useStore().useSelectValue(
    ({draft}) => draft.selectedIconSetPrefixes
  )

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: iconSets =>
      isFiltering(Object.keys(iconSets), selectedIconSetPrefixes)
  })

  return (
    <ToolbarButton checked={query.data} icon='filter' preventToggle>
      Filter
    </ToolbarButton>
  )
})

export default component(() => (
  <Popover
    keepMounted
    open
    popupRender={
      <>
        <div
          style={{
            inset: 0,
            position: 'sticky',
            zIndex: 1
          }}>
          <MultiSelect />
          <VscodeDivider />
        </div>
        <React.Activity>
          <Tree />
        </React.Activity>
      </>
    }
    render={
      <VscodeToolbarContainer>
        <Label />
      </VscodeToolbarContainer>
    }
  />
))
