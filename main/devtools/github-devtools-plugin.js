import ms from 'ms'
import {useGlitch} from 'react-powerglitch'

import {component} from '../app/hocs'
import {GITHUB_REPO, POWER_GLITCH_OPTIONS} from '../app/misc/constants'
import fish from './xT9IgxY4eMijhmPgm4.webp'

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

export default options => ({
  name: 'GitHub',
  get render() {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
          justifyContent: 'center'
        }}>
        <div
          style={{
            height: 'unset'
          }}>
          <GlitchFish />
        </div>
        <a
          href={`https://github.com/${GITHUB_REPO}`}
          style={{
            height: 'unset'
          }}
          target='blank'>
          {this.name}
        </a>
      </div>
    )
  },
  ...options
})
