import React, { useState } from 'react'
import './Supervisees.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const supervisees = [
  { id: 1, name: 'John Adeyemi', designation: 'Case Manager', staffId: 'AKS/UYO/09234', status: 'Active' },
  { id: 2, name: 'John Adeyemi', designation: 'Case Manager', staffId: 'AKS/UYO/09234', status: 'Active' },
  { id: 3, name: 'John Adeyemi', designation: 'Case Manager', staffId: 'AKS/UYO/09234', status: 'Expiring soon' },
  { id: 4, name: 'John Adeyemi', designation: 'Case Manager', staffId: 'AKS/UYO/09234', status: 'On PIP' },
  { id: 5, name: 'John Adeyemi', designation: 'Case Manager', staffId: 'AKS/UYO/09234', status: 'Active' },
  { id: 6, name: 'John Adeyemi', designation: 'Case Manager', staffId: 'AKS/UYO/09234', status: 'Active' },
  { id: 7, name: 'John Adeyemi', designation: 'Case Manager', staffId: 'AKS/UYO/09234', status: 'Expiring soon' },
]

const Supervisees = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  const toggleFilter = () => {
    setIsFilterOpen((open) => !open)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleSubmitConcern = () => {
    setIsModalOpen(false)
    setIsSuccessOpen(true)
  }

  const closeSuccess = () => setIsSuccessOpen(false)

  return (
    <div className="gon-sup-page">
      <div className="gon-sup-header">
        <h1 className="gon-sup-title">Supervisees</h1>
        <p className="gon-sup-subtitle">Manage and monitor your team members</p>
      </div>

      <div className="gon-sup-card">
        <div className="gon-sup-card-header">
          <h2 className="gon-sup-card-title">My Supervisees (10)</h2>
          <div className="gon-sup-filter">
            <button type="button" className="gon-sup-filter-btn" onClick={toggleFilter}>
              <span>All Status</span>
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
                <button type="button" className="gon-sup-filter-item">
                  Active
                </button>
                <button type="button" className="gon-sup-filter-item">
                  On PIP
                </button>
                <button type="button" className="gon-sup-filter-item">
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
                key: 'status',
                render: (row) => (
                  <span
                    className={`gon-sup-status gon-sup-status-${row.status
                      .replace(' ', '')
                      .toLowerCase()}`}
                  >
                    {row.status}
                  </span>
                ),
              },
              {
                header: 'Action',
                key: 'action',
                render: () => (
                  <AppButton type="button" className="gon-sup-raise-btn" onClick={openModal}>
                    <span className="gon-sup-raise-icon">!</span>
                    <span>Raise Concern</span>
                  </AppButton>
                ),
              },
            ]}
            data={supervisees}
            rowKey="id"
            containerClassName=""
            tableClassName="gon-sup-table"
          />
        </div>
      </div>

      {isModalOpen && (
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
            <p className="gon-sup-modal-subtitle">Provide feedback on staff performance</p>
            <div className="gon-sup-modal-body">
              <div className="gon-sup-modal-field">
                <label className="gon-sup-modal-label">Concern Type</label>
                <select className="gon-sup-modal-select" defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                </select>
              </div>
              <div className="gon-sup-modal-field">
                <label className="gon-sup-modal-label">Severity</label>
                <select className="gon-sup-modal-select" defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                </select>
              </div>
              <div className="gon-sup-modal-field">
                <label className="gon-sup-modal-label">Feedback*</label>
                <textarea
                  className="gon-sup-modal-textarea"
                  placeholder="Describe the concern in detail..."
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

