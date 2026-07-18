import uFuzzy from '@leeoniya/ufuzzy'

import {useMemo} from '../../hooks/use-memo'
import {EMPTY} from '../../misc/constants'
import useStore from './use-store'

const uf = new uFuzzy()

export default iconIds => {
  const store = useStore()
  const {searchTerm} = store.useSelectValue('searchTerm')

  return useMemo(() => {
    if (store.searchTerm.isDefault(searchTerm)) return iconIds

    return (
      uf.search(iconIds, searchTerm)[0]?.map(index => iconIds[index]) ??
      EMPTY.ARRAY
    )
  }, [searchTerm, iconIds])
}
