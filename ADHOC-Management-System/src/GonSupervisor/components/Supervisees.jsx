import React, { useState, useEffect } from 'react'
import './Supervisees.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { gonSupervisorService } from '../../services/api'

const Supervisees = () => {
  const [supervisees, setSupervisees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [concernData, setConcernData] = useState({
    concernType: '',
    severity: '',
    description: ''
  })
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchSupervisees()
  }, [])

  const fetchSupervisees = async () => {
    try {
      setLoading(true)
      const data = await gonSupervisorService.getSupervisees()
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

  const applyFilter = (status) => {
    setFilterStatus(status)
    setIsFilterOpen(false)
  }

  const getFilteredSupervisees = () => {
    if (filterStatus === 'all') return supervisees
    return supervisees.filter(s => 
      s.contractStatus.toLowerCase().replace(' ', '') === filterStatus
    )
  }

  const openModal = (staff) => {
    setSelectedStaff(staff)
    setConcernData({ concernType: '', severity: '', description: '' })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStaff(null)
    setError('')
  }

  const handleSubmitConcern = async () => {
    if (!concernData.concernType || !concernData.severity || !concernData.description.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      await gonSupervisorService.raiseConcern(selectedStaff.id, concernData)
      setIsModalOpen(false)
      setIsSuccessOpen(true)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to raise concern')
    }
  }

  const closeSuccess = () => setIsSuccessOpen(false)

  const getFilterLabel = () => {
    switch(filterStatus) {
      case 'all': return 'All Status'
      case 'active': return 'Active'
      case 'onpip': return 'On PIP'
      case 'expiringsoon': return 'Expiring Soon'
      default: return 'All Status'
    }
  }

  if (loading && supervisees.length === 0) {
    return (
      <div className="gon-sup-page">
        <div className="gon-sup-loading">Loading supervisees...</div>
      </div>
    )
  }

  const filteredSupervisees = getFilteredSupervisees()

  return (
    <div className="gon-sup-page">
      <div className="gon-sup-header">
        <h1 className="gon-sup-title">Supervisees</h1>
        <p className="gon-sup-subtitle">Manage and monitor your team members</p>
      </div>

      {error && (
        <div className="gon-sup-error">
          {error}
          <button onClick={fetchSupervisees} className="gon-retry-btn">Retry</button>
        </div>
      )}

      <div className="gon-sup-card">
        <div className="gon-sup-card-header">
          <h2 className="gon-sup-card-title">My Supervisees ({filteredSupervisees.length})</h2>
          <div className="gon-sup-filter">
            <button type="button" className="gon-sup-filter-btn" onClick={toggleFilter}>
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
              <div className="gon-sup-filter-menu">
                <button 
                  type="button" 
                  className={`gon-sup-filter-item ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => applyFilter('all')}
                >
                  All Status
                </button>
                <button 
                  type="button" 
                  className={`gon-sup-filter-item ${filterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => applyFilter('active')}
                >
                  Active
                </button>
                <button 
                  type="button" 
                  className={`gon-sup-filter-item ${filterStatus === 'onpip' ? 'active' : ''}`}
                  onClick={() => applyFilter('onpip')}
                >
                  On PIP
                </button>
                <button 
                  type="button" 
                  className={`gon-sup-filter-item ${filterStatus === 'expiringsoon' ? 'active' : ''}`}
                  onClick={() => applyFilter('expiringsoon')}
                >
                  Expiring Soon
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="gon-sup-table-container">
          <AppTable
            columns={[
              { header: 'Staff name', accessor: 'name' },
              { header: 'Designation', accessor: 'designation' },
              { header: 'Staff ID', accessor: 'staffId' },
              {
                header: 'Contract Status',
                key: 'contractStatus',
                render: (row) => (
                  <span
                    className={`gon-sup-status gon-sup-status-${row.contractStatusClass}`}
                  >
                    {row.contractStatus}
                  </span>
                ),
              },
              {
                header: 'Action',
                key: 'action',
                render: (row) => (
                  <AppButton 
                    type="button" 
                    className="gon-sup-raise-btn" 
                    onClick={() => openModal(row)}
                  >
                    <span className="gon-sup-raise-icon">!</span>
                    <span>Raise Concern</span>
                  </AppButton>
                ),
              },
            ]}
            data={filteredSupervisees}
            rowKey="id"
            containerClassName=""
            tableClassName="gon-sup-table"
            emptyMessage="No supervisees found"
          />
        </div>
      </div>

      {/* Raise Concern Modal */}
      {isModalOpen && selectedStaff && (
        <div className="gon-sup-modal-overlay" onClick={closeModal}>
          <div className="gon-sup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gon-sup-modal-header">
              <h3 className="gon-sup-modal-title">Raise a Concern</h3>
              <button
                type="button"
                className="gon-sup-modal-close"
                aria-label="Close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <p className="gon-sup-modal-subtitle">
              Provide feedback on staff performance for {selectedStaff.name}
            </p>
            {error && <div className="gon-sup-modal-error">{error}</div>}
            <div className="gon-sup-modal-body">
              <div className="gon-sup-modal-field">
                <label className="gon-sup-modal-label">Concern Type</label>
                <select 
                  className="gon-sup-modal-select"
                  value={concernData.concernType}
                  onChange={(e) => setConcernData({...concernData, concernType: e.target.value})}
                >
                  <option value="" disabled>Select</option>
                  <option value="Performance">Performance</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Quality">Quality of Work</option>
                  <option value="Deadline">Missed Deadlines</option>
                  <option value="Behavior">Behavior/Conduct</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="gon-sup-modal-field">
                <label className="gon-sup-modal-label">Severity</label>
                <select 
                  className="gon-sup-modal-select"
                  value={concernData.severity}
                  onChange={(e) => setConcernData({...concernData, severity: e.target.value})}
                >
                  <option value="" disabled>Select</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="gon-sup-modal-field">
                <label className="gon-sup-modal-label">Feedback*</label>
                <textarea
                  className="gon-sup-modal-textarea"
                  placeholder="Describe the concern in detail..."
                  rows={4}
                  value={concernData.description}
                  onChange={(e) => setConcernData({...concernData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="gon-sup-modal-footer">
              <button
                type="button"
                className="gon-sup-modal-btn gon-sup-modal-btn-cancel"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gon-sup-modal-btn gon-sup-modal-btn-submit"
                onClick={handleSubmitConcern}
              >
                Submit Concern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessOpen && (
        <div className="gon-sup-modal-overlay" onClick={closeSuccess}>
          <div className="gon-sup-success-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gon-sup-success-close gon-sup-modal-close"
              aria-label="Close"
              onClick={closeSuccess}
            >
              ×
            </button>
            <div className="gon-sup-success-body">
              <h3 className="gon-sup-success-title">Done!</h3>
              <p className="gon-sup-success-message">
                Your concern has been successfully sent
              </p>
            </div>
            <div className="gon-sup-success-footer">
              <button
                type="button"
                className="gon-sup-success-ok-btn"
                onClick={closeSuccess}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Supervisees