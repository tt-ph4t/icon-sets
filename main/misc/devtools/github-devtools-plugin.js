import {QueryClient, QueryClientProvider, useQuery} from '@tanstack/react-query'
import ms from 'ms'
import React from 'react'
import {useGlitch} from 'react-powerglitch'
import semver from 'semver'

import {component} from '../../app/hocs'
import {useCallback} from '../../app/hooks/use-callback'
import {GITHUB_REPO, POWER_GLITCH_OPTIONS} from '../../app/misc/constants'
import {getQueryOptions} from '../../app/misc/get-query-options'
import fish from './xT9IgxY4eMijhmPgm4.webp'

const queryClient = new QueryClient()
const name = 'GitHub'

const GlitchFish = component(() => {
  const glitch = useGlitch({
    ...POWER_GLITCH_OPTIONS.MEDIUM,
    playMode: 'click',
    timing: {
      duration: ms('.3s'),
      easing: 'ease-in-out'
    }
  })

  return (
    <img
      ref={glitch.ref}
      src={fish}
      style={{
        height: 'auto',
        width: 50
      }}
    />
  )
})

const DataVersion = component(() => {
  const query = useQuery(
    getQueryOptions({
      select: useCallback(
        ({devDependencies}) =>
          semver.minVersion(devDependencies['@iconify/json']).version
      ),
      url: `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/data/package.json`
    })
  )

  if (query.isSuccess) return query.data
})

export default options => ({
  name,
  render: (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        height: 'inherit',
        justifyContent: 'center'
      }}>
      <React.Activity>
        <div
          style={{
            '--spacing': '1rem',

            position: 'absolute',
            right: 'var(--spacing)',
            top: 'var(--spacing)'
          }}>
          <QueryClientProvider client={queryClient}>
            <DataVersion />
          </QueryClientProvider>
        </div>
        <div style={{height: 'unset'}}>
          <GlitchFish />
        </div>
      </React.Activity>
      <a
        href={`https://github.com/${GITHUB_REPO}`}
        style={{height: 'unset'}}
        target='blank'>
        {name}
      </a>
    </div>
  ),
  ...options
})
