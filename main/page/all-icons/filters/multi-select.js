import {useQuery} from '@tanstack/react-query'
import {VscodeMultiSelect} from '@vscode-elements/react-elements'
import {intersection} from 'es-toolkit'

import {Slot} from '../../../components/slot'
import {component} from '../../../hocs'
import {DEFAULT_QUERY_OPTIONS} from '../../../misc/constants'
import {pluralize} from '../../../misc/pluralize'
import {useStore} from '../misc'

const queryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets => ({
    iconSetPrefixIndexMap: Object.keys(iconSets).reduce((a, b, c) => {
      a[b] = c

      return a
    }, {}),
    VscodeMultiSelectProps: {
      options: Object.values(iconSets).map(iconSet => ({
        description: pluralize(iconSet.icons, 'icon'),
        label: iconSet.name,
        value: iconSet.prefix
      }))
    }
  })
}

export default component(props => {
  const store = useStore()
  const query = useQuery(queryOptions)

  const {selectedIconSetPrefixes} = store.useSelectValue(
    'selectedIconSetPrefixes'
  )

  return (
    <Slot
      onChange={event => {
        store.set(({draft}) => {
          draft.selectedIconSetPrefixes = intersection(
            Object.keys(query.data.iconSetPrefixIndexMap),
            event.target.value
          )
        })
      }}>
      <VscodeMultiSelect
        combobox={false}
        selectedIndexes={selectedIconSetPrefixes.map(
          iconSetPrefix => query.data.iconSetPrefixIndexMap[iconSetPrefix]
        )}
        {...query.data.VscodeMultiSelectProps}
        {...props}
      />
    </Slot>
  )
})
