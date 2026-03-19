import { useEffect, useMemo, useRef, useState } from 'react'
import AppButton from './AppButton'
import './AppDropdown.css'

const AppDropdown = ({
  value,
  onChange,
  placeholder = 'Select',
  options = [],
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value])

  useEffect(() => {
    if (!open) return

    const onDoc = (e) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }

    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={`app-dropdown ${className}`.trim()} ref={rootRef}>
      <AppButton
        type="button"
        className={`app-dropdown-btn ${buttonClassName}`.trim()}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        aria-expanded={open}
      >
        <span className={`app-dropdown-label ${selected ? '' : 'placeholder'}`.trim()}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`app-dropdown-caret ${open ? 'open' : ''}`.trim()} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </AppButton>

      {open && (
        <div className={`app-dropdown-menu ${menuClassName}`.trim()} role="listbox">
          {options.map((o) => (
            <AppButton
              key={o.value}
              type="button"
              className={`app-dropdown-item ${o.value === value ? 'selected' : ''}`.trim()}
              onClick={() => {
                onChange?.(o.value)
                setOpen(false)
              }}
            >
              {o.label}
            </AppButton>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppDropdown

