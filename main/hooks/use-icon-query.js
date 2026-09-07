import {useCustomizedIcons} from './use-customized-icons'
import {useIconQueries} from './use-icon-queries'

export const useIconQuery = (iconId, options) => {
  const {iconCustomisations} = useCustomizedIcons.useSelect(iconId)

  return useIconQueries({
    iconCustomisations,
    iconId,
    queryOptions: options
  })[0]
}
