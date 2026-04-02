import ms from 'ms'
import {useGlitch} from 'react-powerglitch'

import {component} from '../../app/hocs'
import {GITHUB_REPO, POWER_GLITCH_OPTIONS} from '../../app/misc/constants'
import XUA7ZZcBl0McuVqwd8 from './XUA7ZZcBl0McuVqwd8.webp'

const name = 'GitHub'

const GlitchCat = component(() => {
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
      src={XUA7ZZcBl0McuVqwd8}
      style={{
        height: 'auto',
        width: 50
      }}
    />
  )
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
      <div style={{height: 'unset'}}>
        <GlitchCat />
      </div>
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
