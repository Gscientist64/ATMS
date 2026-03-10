import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TimesheetReview.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const pendingRows = [
  { id: 1, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review', statusType: 'gon' },
  { id: 2, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review', statusType: 'gon' },
  { id: 3, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review', statusType: 'gon' },
  { id: 4, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review', statusType: 'gon' },
  { id: 5, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review', statusType: 'gon' },
  { id: 6, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review', statusType: 'gon' },
]

const approvedRows = [
  { id: 1, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'ECEWS Review', statusType: 'ecews' },
  { id: 2, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'Programs Review', statusType: 'programs' },
  { id: 3, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'Returned', statusType: 'returned' },
  { id: 4, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'HR Review', statusType: 'hr' },
  { id: 5, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'ECEWS Review', statusType: 'ecews' },
  { id: 6, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'ECEWS Review', statusType: 'ecews' },
  { id: 7, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'Programs Review', statusType: 'programs' },
]

const returnedRows = [
  { id: 1, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'Returned', statusType: 'returned' },
]

const TimesheetReview = () => {
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
    { header: 'Department', accessor: 'department' },
    { header: 'Month', accessor: 'month' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`gon-review-status-badge gon-review-status-${row.statusType}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton
          type="button"
          className="gon-review-view-btn"
          onClick={() => navigate(`/gon-supervisor/timesheet/${row.id}`)}
        >
          View
        </AppButton>
      ),
    },
  ]

  return (
    <div className="gon-review-page">
      <div className="gon-review-header">
        <h1 className="gon-review-title">Review Timesheets</h1>
        <p className="gon-review-subtitle">Track submitted timesheets</p>
      </div>

      <div className="gon-review-card">
        <div className="gon-review-card-header">
          <h2 className="gon-review-card-title">All Timesheet</h2>
        </div>

        <div className="gon-review-tabs">
          <button
            type="button"
            className={`gon-review-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            type="button"
            className={`gon-review-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
          <button
            type="button"
            className={`gon-review-tab ${activeTab === 'returned' ? 'active' : ''}`}
            onClick={() => setActiveTab('returned')}
          >
            Returned
          </button>
        </div>

        <div className="gon-review-table-container">
          <AppTable
            columns={columns}
            data={rows}
            rowKey="id"
            containerClassName=""
            tableClassName="gon-review-table"
          />
        </div>
      </div>
    </div>
  )
}

export default TimesheetReview

