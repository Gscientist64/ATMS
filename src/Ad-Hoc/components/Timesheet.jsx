import React from 'react'
import { Link } from 'react-router-dom'
import './Timesheet.css'
import AppTable from '../../shared/AppTable'

const Timesheet = () => {
  const timesheets = [
    { id: 1, monthYear: 'January 2026', daysWorked: '3 Days', submittedDate: '05-02-2026', status: 'GON Review', statusType: 'review' },
    { id: 2, monthYear: 'January 2026', daysWorked: '3 Days', submittedDate: '05-02-2026', status: 'Approved', statusType: 'approved' },
    { id: 3, monthYear: 'January 2026', daysWorked: '3 Days', submittedDate: '05-02-2026', status: 'Approved', statusType: 'approved' },
    { id: 4, monthYear: 'January 2026', daysWorked: '3 Days', submittedDate: '05-02-2026', status: 'Approved', statusType: 'approved' },
  ]

  const columns = [
    { header: 'Month/Year', accessor: 'monthYear' },
    { header: 'Days Worked', accessor: 'daysWorked' },
    { header: 'Submitted Date', accessor: 'submittedDate' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`ts-status-badge ts-status-${row.statusType}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <Link to={`/timesheet/${row.id}`} className="ts-view-details-link">
          View Details
        </Link>
      ),
    },
  ]

  return (
    <div className="ts-page">
      <div className="ts-page-header">
        <h1 className="ts-page-title">Timesheet</h1>
        <p className="ts-page-subtitle">Track your timesheet requests</p>
      </div>

      <div className="ts-page-section">
        <h2 className="ts-page-section-title">My Timesheets</h2>
        <div className="ts-page-card">
          <AppTable
            columns={columns}
            data={timesheets}
            rowKey="id"
            containerClassName="ts-page-table-container"
            tableClassName="ts-page-table"
          />
        </div>
      </div>
    </div>
  )
}

export default Timesheet
