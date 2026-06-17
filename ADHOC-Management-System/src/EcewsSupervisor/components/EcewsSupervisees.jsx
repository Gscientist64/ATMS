import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './EcewsSupervisees.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { ecewsSupervisorService } from '../../services/api'

const EcewsSupervisees = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [supervisees, setSupervisees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentFilter, setCurrentFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchSupervisees()
  }, [currentFilter])

  const fetchSupervisees = async () => {
    try {
      setLoading(true)
      const data = await ecewsSupervisorService.getSupervisees(currentFilter)
      setSupervisees(data)
    } catch (err) {
      setError('Failed to load supervisees')
      console.error('Error fetching supervisees:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = () => {
    setIsFilterOpen((open) => !open)
  }

  const applyFilter = (filter) => {
    setCurrentFilter(filter)
    setIsFilterOpen(false)
  }

  const getFilterLabel = () => {
    switch(currentFilter) {
      case 'all': return 'All Status'
      case 'active': return 'Active'
      case 'onpip': return 'On PIP'
      case 'expiringsoon': return 'Expiring Soon'
      default: return 'All Status'
    }
  }

  const columns = [
    { header: 'Staff name', accessor: 'name' },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Staff ID', accessor: 'staffId' },
    {
      header: 'Contract Status',
      key: 'contractStatus',
      render: (row) => (
        <span
          className={`ecews-sup-status ecews-sup-status-${row.contractStatus
            .replace(' ', '')
            .toLowerCase()}`}
        >
          {row.contractStatus}
        </span>
      ),
    },
    {
    //  header: 'Flags',
    //  accessor: 'flags',
     // render: (row) => (
      //  <span
       //   className={`ecews-sup-flag ${
         //   row.flagCount > 0 ? 'ecews-sup-flag-alert' : 'ecews-sup-flag-none'
         // }`}
       // >
        //  {row.flags}
      //  </span>
    //  ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton
          type="button"
          className="ecews-sup-view-btn"
          onClick={() => navigate(`/ecews-supervisor/supervisees/${row.id}`)}
        >
          View
        </AppButton>
      ),
    },
  ]

  if (loading && supervisees.length === 0) {
    return (
      <div className="ecews-sup-page">
        <div className="ecews-sup-loading">Loading supervisees...</div>
      </div>
    )
  }

  return (
    <div className="ecews-sup-page">
      <div className="ecews-sup-header">
        <h1 className="ecews-sup-title">Supervisees</h1>
        <p className="ecews-sup-subtitle">Manage and monitor your team members</p>
      </div>

      {error && (
        <div className="ecews-sup-error">
          {error}
          <button onClick={fetchSupervisees} className="ecews-retry-btn">Retry</button>
        </div>
      )}

      <div className="ecews-sup-card">
        <div className="ecews-sup-card-header">
          <h2 className="ecews-sup-card-title">My Supervisees ({supervisees.length})</h2>
          <div className="ecews-sup-filter">
            <button type="button" className="ecews-sup-filter-btn" onClick={toggleFilter}>
              <span>{getFilterLabel()}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {isFilterOpen && (
              <div className="ecews-sup-filter-menu">
                <button 
                  type="button" 
                  className={`ecews-sup-filter-item ${currentFilter === 'all' ? 'active' : ''}`}
                  onClick={() => applyFilter('all')}
                >
                  All Status
                </button>
                <button 
                  type="button" 
                  className={`ecews-sup-filter-item ${currentFilter === 'active' ? 'active' : ''}`}
                  onClick={() => applyFilter('active')}
                >
                  Active
                </button>
                <button 
                  type="button" 
                  className={`ecews-sup-filter-item ${currentFilter === 'onpip' ? 'active' : ''}`}
                  onClick={() => applyFilter('onpip')}
                >
                  On PIP
                </button>
                <button 
                  type="button" 
                  className={`ecews-sup-filter-item ${currentFilter === 'expiringsoon' ? 'active' : ''}`}
                  onClick={() => applyFilter('expiringsoon')}
                >
                  Expiring Soon
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ecews-sup-table-container">
          <AppTable
            columns={columns}
            data={supervisees}
            rowKey="id"
            containerClassName=""
            tableClassName="ecews-sup-table"
            emptyMessage="No supervisees found"
          />
        </div>
      </div>
    </div>
  )
}

export default EcewsSupervisees