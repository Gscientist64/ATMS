import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Timesheet.css'
import AppTable from '../../shared/AppTable'
import { adHocService } from '../../services/api'

const Timesheet = () => {
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTimesheets()
  }, [])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await adHocService.getTimesheets()
      setTimesheets(data)
      setError('')
    } catch (err) {
      setError('Failed to load timesheets. Please try again.')
      console.error('Error fetching timesheets:', err)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="ts-page">
        <div className="ts-page-header">
          <h1 className="ts-page-title">Timesheet</h1>
          <p className="ts-page-subtitle">Track your timesheet requests</p>
        </div>
        <div className="ts-loading">Loading timesheets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ts-page">
        <div className="ts-page-header">
          <h1 className="ts-page-title">Timesheet</h1>
          <p className="ts-page-subtitle">Track your timesheet requests</p>
        </div>
        <div className="ts-error">{error}</div>
      </div>
    )
  }

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
            emptyMessage="No timesheets found. Create your first timesheet!"
          />
        </div>
      </div>
    </div>
  )
}

export default Timesheet