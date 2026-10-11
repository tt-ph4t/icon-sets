import {useHeldKeys, useHotkeyRegistrations} from '@tanstack/react-hotkeys'
import {useIsFetching, useQueryClient} from '@tanstack/react-query'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import {play} from 'cuelume'
import {mapValues, sumBy} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'

import {IconGrid} from '../../components/icon-grid'
import {Kbd} from '../../components/kbd'
import {useProgress} from '../../components/progress'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {hasValues} from '../../misc'
import {pluralize} from '../../misc/pluralize'
import Context from '../context'
import AllIconQueries from './all-icon-queries'
import Cuelume from './cuelume'
import FailedQueries from './failed-queries'
import Font from './font'
import Fps from './fps'
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

const HeldKeys = component(props => {
  const heldKeys = useHeldKeys()
  const progress = useProgress()

  const triggerCounts = mapValues(useHotkeyRegistrations(), a =>
    sumBy(a, hotkeyRegistrationView => hotkeyRegistrationView.triggerCount)
  )

  useEffect.update(() => {
    progress.with(() => {
      play('release')
    })
  }, [triggerCounts])

  return hasValues(heldKeys) && <Kbd keys={heldKeys} {...props} />
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
      <HeldKeys />
      <FetchingQueries />
      <FailedQueries />
      <Fps />
      <VscodeToolbarContainer>
        <Settings menu={castArray(menu)} />
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
