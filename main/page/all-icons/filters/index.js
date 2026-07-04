import {useQuery} from '@tanstack/react-query'
import {
  VscodeDivider,
  VscodeToolbarContainer
} from '@vscode-elements/react-elements'

import {ButtonGroup} from '../../../components/button-group'
import {Popover} from '../../../components/popover'
import {component} from '../../../hocs'
import {DEFAULT_QUERY_OPTIONS} from '../../../misc/constants'
import {pluralize} from '../../../misc/pluralize'
import {isFiltered, useStore} from '../misc'
import MultiSelect from './multi-select'
import Tree from './tree'

const Label = component(() => {
  const {selectedIconSetPrefixes} = useStore().useSelectValue(
    'selectedIconSetPrefixes'
  )

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: iconSets => ({
      isFiltered: isFiltered(Object.keys(iconSets), selectedIconSetPrefixes),
      label:
        selectedIconSetPrefixes.length === 1
          ? iconSets[selectedIconSetPrefixes[0]].name
          : pluralize(selectedIconSetPrefixes.length, 'icon set')
    })
  })

  return (
    <ButtonGroup
      data={[
        {
          children: query.data.label
        },
        {
          icon: 'filter',
          secondary: !query.data.isFiltered
        }
      ]}
    />
  )
})

export default (
  <Popover
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
        <Tree />
      </>
    }
    render={
      <VscodeToolbarContainer>
        <Label />
      </VscodeToolbarContainer>
    }
  />
)
