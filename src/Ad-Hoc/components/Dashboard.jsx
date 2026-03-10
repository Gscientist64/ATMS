import React, { useState } from 'react'
import './Dashboard.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const Dashboard = () => {
  const [alertVisible, setAlertVisible] = useState(true)

  const formatDate = () => {
    const date = new Date('2026-02-03')
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return date.toLocaleDateString('en-US', options)
  }

  const recentColumns = [
    { header: 'Month/Year', accessor: 'monthYear' },
    { header: 'Days Worked', accessor: 'daysWorked' },
    { header: 'Submitted Date', accessor: 'submittedDate' },
    { header: 'Status', accessor: 'status' },
    { header: 'Action', accessor: 'action' },
  ]

  const recentData = []

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, John</h1>
        <p className="welcome-date">{formatDate()}</p>
      </div>

      {alertVisible && (
        <div className="alert-banner">
          <div className="alert-content">
            <div className="alert-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                <path
                  d="M10 6V10M10 14H10.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="alert-text">
              <div className="alert-title">Timesheet Submission!</div>
              <div className="alert-message">
                Reminder! All timesheet must be submitted before or by February 25th, 2026. Late
                submission may delay payroll processing.
              </div>
            </div>
          </div>
          <button
            className="alert-close"
            onClick={() => setAlertVisible(false)}
            aria-label="Close alert"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="overview-section">
        <h2 className="overview-title">Overview</h2>
        <div className="overview-card">
          <div className="overview-content">
            <div className="overview-left">
              <div className="overview-icon-wrapper">
                <svg className="overview-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="6"
                    width="14"
                    height="14"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <line
                    x1="9"
                    y1="4"
                    x2="9"
                    y2="8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="15"
                    y1="4"
                    x2="15"
                    y2="8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="5"
                    y1="11"
                    x2="19"
                    y2="11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="17.5" cy="5.5" r="2.5" fill="currentColor" />
                  <path
                    d="M17.5 4.5V6.5M17.5 4V7M16.5 5.5H18.5"
                    stroke="#fff"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="overview-text">
                <div className="overview-label">Current Month</div>
                <div className="overview-month">February 2026</div>
                <button className="status-badge">Closed for submission</button>
              </div>
            </div>
            <AppButton
              to="/timesheet/create"
              className="create-timesheet-btn"
              label="Create Timesheet"
            />
          </div>
        </div>
      </div>

      <div className="timesheet-section">
        <h2 className="section-title">Recent Timesheet</h2>
        <div className="timesheet-card">
          <AppTable
            columns={recentColumns}
            data={recentData}
            containerClassName="timesheet-table-container"
            tableClassName="timesheet-table"
            emptyMessage="No timesheet available"
            emptyCellClassName="empty-state"
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
