import uFuzzy from '@leeoniya/ufuzzy'

import {useMemo} from '../../hooks/use-memo'
import {EMPTY} from '../../misc/constants'
import useSearchTerm from './use-search-term'

const uf = new uFuzzy()

export default iconIds => {
  const searchTerm = useSearchTerm()
  const searchTermState = searchTerm.useValue()

  return useMemo(() => {
    if (searchTerm.isDefault(searchTermState)) return iconIds

    return (
      uf.search(iconIds, searchTermState)[0]?.map(index => iconIds[index]) ??
      EMPTY.ARRAY
    )
  }, [searchTermState, iconIds])
}
