import React from 'react'
import { Link } from 'react-router-dom'

const AppButton = ({
  label,
  children,
  to,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ...rest
}) => {
  const content = children || label

  if (to && !disabled) {
    return (
      <Link to={to} className={className} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {content}
    </button>
  )
}

export default AppButton

