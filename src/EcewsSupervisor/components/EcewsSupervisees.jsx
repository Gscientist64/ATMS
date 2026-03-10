import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './EcewsSupervisees.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const supervisees = [
  {
    id: 1,
    name: 'John Adeyemi',
    designation: 'Case Manager',
    staffId: 'AKS/UYO/09234',
    contractStatus: 'Active',
    flags: '2 Flags',
  },
  {
    id: 2,
    name: 'John Adeyemi',
    designation: 'Case Manager',
    staffId: 'AKS/UYO/09234',
    contractStatus: 'Active',
    flags: 'None',
  },
  {
    id: 3,
    name: 'John Adeyemi',
    designation: 'Case Manager',
    staffId: 'AKS/UYO/09234',
    contractStatus: 'Active',
    flags: 'None',
  },
  {
    id: 4,
    name: 'John Adeyemi',
    designation: 'Case Manager',
    staffId: 'AKS/UYO/09234',
    contractStatus: 'On PIP',
    flags: 'None',
  },
  {
    id: 5,
    name: 'John Adeyemi',
    designation: 'Case Manager',
    staffId: 'AKS/UYO/09234',
    contractStatus: 'Expiring soon',
    flags: 'None',
  },
  {
    id: 6,
    name: 'John Adeyemi',
    designation: 'Case Manager',
    staffId: 'AKS/UYO/09234',
    contractStatus: 'Active',
    flags: 'None',
  },
]

const EcewsSupervisees = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const navigate = useNavigate()

  const toggleFilter = () => {
    setIsFilterOpen((open) => !open)
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
      header: 'Flags',
      accessor: 'flags',
      render: (row) => (
        <span
          className={`ecews-sup-flag ${
            row.flags === '2 Flags' ? 'ecews-sup-flag-alert' : 'ecews-sup-flag-none'
          }`}
        >
          {row.flags}
        </span>
      ),
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

  return (
    <div className="ecews-sup-page">
      <div className="ecews-sup-header">
        <h1 className="ecews-sup-title">Supervisees</h1>
        <p className="ecews-sup-subtitle">Manage and monitor your team members</p>
      </div>

      <div className="ecews-sup-card">
        <div className="ecews-sup-card-header">
          <h2 className="ecews-sup-card-title">My Supervisees (10)</h2>
          <div className="ecews-sup-filter">
            <button type="button" className="ecews-sup-filter-btn" onClick={toggleFilter}>
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
              <div className="ecews-sup-filter-menu">
                <button type="button" className="ecews-sup-filter-item">
                  Active
                </button>
                <button type="button" className="ecews-sup-filter-item">
                  On PIP
                </button>
                <button type="button" className="ecews-sup-filter-item">
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
          />
        </div>
      </div>
    </div>
  )
}

export default EcewsSupervisees

