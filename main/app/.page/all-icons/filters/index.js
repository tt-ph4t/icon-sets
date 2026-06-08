import {useQuery} from '@tanstack/react-query'
import {
  VscodeDivider,
  VscodeToolbarContainer
} from '@vscode-elements/react-elements'
import {castArray} from 'es-toolkit/compat'

import {ButtonGroup} from '../../../components/button-group'
import {Popover} from '../../../components/popover'
import {component} from '../../../hocs'
import {useRemount} from '../../../hooks/use-remount'
import {DEFAULT_QUERY_OPTIONS} from '../../../misc/constants'
import {isFiltered, useStore} from '../misc'
import MultiSelect from './multi-select'
import Tree from './tree'

const Label = component(({buttons}) => {
  const selectedIconSetPrefixes = useStore().useSelectValue(
    ({draft}) => draft.selectedIconSetPrefixes
  )

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: iconSets => ({
      isFiltered: isFiltered(Object.keys(iconSets), selectedIconSetPrefixes)
    })
  })

  return (
    <ButtonGroup
      data={[
        {
          icon: 'filter',
          secondary: !query.data.isFiltered
        },
        ...castArray(buttons)
      ]}
    />
  )
})

export default useRemount.with(
  component(({INTERNAL_REMOUNT}) => (
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
          <Tree />
        </>
      }
      render={
        <VscodeToolbarContainer>
          <Label
            buttons={{
              icon: INTERNAL_REMOUNT.icon,
              onClick: INTERNAL_REMOUNT
            }}
          />
        </VscodeToolbarContainer>
      }
    />
  ))
)
