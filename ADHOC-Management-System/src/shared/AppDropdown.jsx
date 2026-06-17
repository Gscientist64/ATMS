import React, { useState, useRef, useEffect } from 'react'
import './AppDropdown.css'

const AppDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select', 
  className = '', 
  buttonClassName = '',
  menuClassName = '',
  ariaLabel = 'Dropdown',
  searchable = false,
  searchPlaceholder = 'Search...'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchQuery('')
  }

  useEffect(() => {
    if (isOpen && searchable) {
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen, searchable])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayText = selectedOption ? selectedOption.label : placeholder
  const isPlaceholder = !selectedOption

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={`app-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`app-dropdown-btn ${buttonClassName}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span className={`app-dropdown-label ${isPlaceholder ? 'placeholder' : ''}`}>
          {displayText}
        </span>
        <span className={`app-dropdown-caret ${isOpen ? 'open' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className={`app-dropdown-menu ${menuClassName} ${searchable ? 'app-dropdown-menu--searchable' : ''}`} onKeyDown={handleKeyDown}>
          {searchable && (
            <div className="app-dropdown-search-wrap">
              <input
                ref={searchInputRef}
                type="text"
                className="app-dropdown-search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="app-dropdown-empty">No results found</div>
          ) : filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`app-dropdown-item ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppDropdown