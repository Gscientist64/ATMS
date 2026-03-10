import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './EcewsTimesheetReview.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const pendingRows = [
  {
    id: 1,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'ECEWS Review',
    statusType: 'ecews',
  },
  {
    id: 2,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'ECEWS Review',
    statusType: 'ecews',
  },
  {
    id: 3,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'ECEWS Review',
    statusType: 'ecews',
  },
  {
    id: 4,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'ECEWS Review',
    statusType: 'ecews',
  },
  {
    id: 5,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'ECEWS Review',
    statusType: 'ecews',
  },
  {
    id: 6,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'ECEWS Review',
    statusType: 'ecews',
  },
]

const approvedRows = [
  {
    id: 1,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Programs Review',
    statusType: 'programs',
  },
  {
    id: 2,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Programs Review',
    statusType: 'programs',
  },
  {
    id: 3,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Programs Review',
    statusType: 'programs',
  },
  {
    id: 4,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Programs Review',
    statusType: 'programs',
  },
  {
    id: 5,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Programs Review',
    statusType: 'programs',
  },
  {
    id: 6,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Programs Review',
    statusType: 'programs',
  },
]

const returnedRows = [
  {
    id: 1,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Returned',
    statusType: 'returned',
  },
  {
    id: 2,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Returned',
    statusType: 'returned',
  },
  {
    id: 3,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Returned',
    statusType: 'returned',
  },
  {
    id: 4,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Returned',
    statusType: 'returned',
  },
  {
    id: 5,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Returned',
    statusType: 'returned',
  },
  {
    id: 6,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    gonSupervisor: 'Amina Mohammed',
    status: 'Returned',
    statusType: 'returned',
  },
]

const EcewsTimesheetReview = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')

  const getRowsForTab = () => {
    if (activeTab === 'approved') return approvedRows
    if (activeTab === 'returned') return returnedRows
    return pendingRows
  }

  const rows = getRowsForTab()

  const columns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    { header: 'GON Supervisor', accessor: 'gonSupervisor' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span
          className={`ecews-review-status-badge ${
            row.statusType ? `ecews-review-status-${row.statusType}` : ''
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) =>
        row.statusType === 'programs' || row.statusType === 'returned' ? (
          <AppButton
            type="button"
            className="ecews-review-view-btn"
            onClick={() => navigate(`/ecews-supervisor/timesheet/${row.id}`)}
          >
            View
          </AppButton>
        ) : (
          <AppButton
            type="button"
            className="ecews-review-btn"
            onClick={() => navigate(`/ecews-supervisor/timesheet/${row.id}`)}
          >
            Review
          </AppButton>
        ),
    },
  ]

  return (
    <div className="ecews-review-page">
      <div className="ecews-review-header">
        <h1 className="ecews-review-title">Review Timesheet</h1>
        <p className="ecews-review-subtitle">Track all submitted timesheets</p>
      </div>

      <div className="ecews-review-card">
        <div className="ecews-review-card-header">
          <h2 className="ecews-review-card-title">All Timesheet</h2>
        </div>

        <div className="ecews-review-tabs">
          <button
            type="button"
            className={`ecews-review-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            type="button"
            className={`ecews-review-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
          <button
            type="button"
            className={`ecews-review-tab ${activeTab === 'returned' ? 'active' : ''}`}
            onClick={() => setActiveTab('returned')}
          >
            Returned
          </button>
        </div>

        <div className="ecews-review-table-container">
          <AppTable
            columns={columns}
            data={rows}
            rowKey="id"
            containerClassName=""
            tableClassName="ecews-review-table"
          />
        </div>
      </div>
    </div>
  )
}

export default EcewsTimesheetReview

