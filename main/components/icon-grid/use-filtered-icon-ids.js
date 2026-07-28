import uFuzzy from '@leeoniya/ufuzzy'

import {useMemo} from '../../hooks/use-memo'
import {EMPTY} from '../../misc/constants'
import useSearchTerm from './use-search-term'

const uf = new uFuzzy()

export default iconIds => {
  const searchTerm = useSearchTerm()
  const searchTermValue = searchTerm.useValue()

  return useMemo(() => {
    if (searchTerm.isDefault(searchTermValue)) return iconIds

    return (
      uf.search(iconIds, searchTermValue)[0]?.map(index => iconIds[index]) ??
      EMPTY.ARRAY
    )
  }, [searchTermValue, iconIds])
}
