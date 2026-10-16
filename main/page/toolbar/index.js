import {useIsFetching, useQueryClient} from '@tanstack/react-query'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import {castArray} from 'es-toolkit/compat'

import {IconGrid} from '../../components/icon-grid'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {pluralize} from '../../misc/pluralize'
import Context from '../context'
import Layout from '../layout'
import AllIconQueries from './all-icon-queries'
import Cuelume from './cuelume'
import FailedQueries from './failed-queries'
import Font from './font'
import Fps from './fps'
import heldKeys from './held-keys'
import PrefetchIcons from './prefetch-icons'
import Settings from './settings'

useNetwork

const FetchingQueries = component(props => {
  const isFetching = Boolean(useIsFetching())

  const queries = useQueryClient()
    .getQueryCache()
    .findAll({
      predicate: query => query.state.fetchStatus === 'fetching'
    })

  return (
    isFetching && (
      <ToolbarButton {...props}>
        Fetching {pluralize(queries, 'query')}
      </ToolbarButton>
    )
  )
})

const Remount = component(() => {
  const {remount} = Context.useSelectValue('remount')

  return <ToolbarButton icon={remount.icon} onClick={remount} />
})

export default component(({menu}) => (
  <>
    <div
      style={{
        alignItems: 'flex-end',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--SPACING)'
      }}>
      {heldKeys}
      <FetchingQueries />
      <FailedQueries />
      <Fps />
      <VscodeToolbarContainer>
        <Settings menu={castArray(menu)} />
        <Layout.SidebarRightToggle />
        <Cuelume />
        <IconGrid.Search>
          <PrefetchIcons.Actions />
          <AllIconQueries />
        </IconGrid.Search>
        <Remount />
      </VscodeToolbarContainer>
    </div>
    <Font.Sync />
    <PrefetchIcons />
  </>
))
