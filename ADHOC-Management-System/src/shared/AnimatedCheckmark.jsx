import { useEffect, useRef, useState } from 'react'
import './AnimatedCheckmark.css'

const CHECK_PATH = 'M18 38 L30 50 L54 22'
const VIEW_BOX = '0 0 72 72'

const AnimatedCheckmark = ({
  size = 96,
  strokeWidth = 10,
  className = '',
  loop = true,
  duration = 2.2,
  ariaHidden = true,
}) => {
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [])

  const pathClassName = [
    'animated-checkmark-path',
    pathLength ? 'is-ready' : '',
    loop ? 'animated-checkmark-path--loop' : 'animated-checkmark-path--once',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <svg
      className={`animated-checkmark ${className}`.trim()}
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      fill="none"
      aria-hidden={ariaHidden}
      style={{ '--check-duration': `${duration}s` }}
    >
      <path
        ref={pathRef}
        className={pathClassName}
        d={CHECK_PATH}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        fill="none"
        style={pathLength ? { '--check-length': `${pathLength}px` } : undefined}
      />
    </svg>
  )
}

export default AnimatedCheckmark
