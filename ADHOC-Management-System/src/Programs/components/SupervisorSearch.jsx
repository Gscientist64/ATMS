import React, { useState, useEffect, useRef } from 'react'
import './SupervisorSearch.css'

const SupervisorSearch = ({ 
    type, // 'ecews' or 'gon'
    placeholder, 
    selectedId, 
    onSelect,
    className = ''
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedName, setSelectedName] = useState('')
    const searchRef = useRef(null)
    const debounceRef = useRef(null)

    useEffect(() => {
        // If there's a selectedId, fetch the name (or clear)
        if (!selectedId) {
            setSelectedName('')
            setSearchTerm('')
        }
    }, [selectedId])

    const searchSupervisors = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`http://localhost:5087/api/Programs/search-supervisors?searchTerm=${encodeURIComponent(query)}&type=${type}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const data = await response.json()
            setSuggestions(data)
            setShowDropdown(data.length > 0)
        } catch (error) {
            console.error('Error searching supervisors:', error)
            setSuggestions([])
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }
        
        debounceRef.current = setTimeout(() => {
            searchSupervisors(value)
        }, 300)
    }

    const handleSelectSuggestion = (supervisor) => {
        setSelectedName(supervisor.name)
        setSearchTerm(supervisor.name)
        setShowDropdown(false)
        onSelect(supervisor.id, supervisor.name)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={`supervisor-search ${className}`} ref={searchRef}>
            <div className="supervisor-search-input-wrapper">
                <input
                    type="text"
                    className="supervisor-search-input"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => searchTerm.length >= 2 && setShowDropdown(suggestions.length > 0)}
                    placeholder={placeholder || `Search ${type === 'ecews' ? 'ECEWS' : 'Facility'} Supervisor...`}
                    autoComplete="off"
                />
                {loading && (
                    <div className="supervisor-search-loading">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="30 10" />
                        </svg>
                    </div>
                )}
            </div>
            
            {showDropdown && suggestions.length > 0 && (
                <ul className="supervisor-search-dropdown">
                    {suggestions.map(supervisor => (
                        <li 
                            key={supervisor.id}
                            className="supervisor-search-item"
                            onClick={() => handleSelectSuggestion(supervisor)}
                        >
                            <div className="supervisor-search-item-name">{supervisor.name}</div>
                            <div className="supervisor-search-item-detail">
                                {supervisor.employeeCode} {supervisor.state && `• ${supervisor.state}`}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default SupervisorSearch