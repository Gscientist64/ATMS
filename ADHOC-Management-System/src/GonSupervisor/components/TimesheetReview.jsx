// ADHOC-Management-System/src/GonSupervisor/components/TimesheetReview.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './TimesheetReview.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { gonSupervisorService } from '../../services/api'

const TimesheetReview = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Helper functions for status display
  const getStatusDisplay = (status) => {
    switch(status) {
      case 'GONReview':
        return 'Pending';
      case 'ProgramsReview':
        return 'Programs Review';
      case 'Approved':
        return 'Approved';
      case 'Rejected':
        return 'Returned';
      case 'Submitted':
        return 'Submitted';
      default:
        return status;
    }
  }

  const getStatusType = (status) => {
    switch(status) {
      case 'GONReview':
        return 'pending';
      case 'ProgramsReview':
        return 'programs';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  }

  useEffect(() => {
    fetchTimesheets()
  }, [activeTab])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await gonSupervisorService.getTimesheetsForReview(activeTab)
      setTimesheets(data)
    } catch (err) {
      setError('Failed to load timesheets')
      console.error('Error fetching timesheets:', err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Department', accessor: 'department' },
    { header: 'Month', accessor: 'month' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        // Direct mapping - handle "Facility Supervisor Review" label from the backend
        let displayText = '';
        let statusClass = '';

        if (row.status === 'Facility Supervisor Review') {
          displayText = 'Pending';
          statusClass = 'pending';
        } else if (row.status === 'ProgramsReview' || row.status === 'Programs Review') {
          displayText = 'Programs Review';
          statusClass = 'programs';
        } else if (row.status === 'Approved') {
          displayText = 'Approved';
          statusClass = 'approved';
        } else if (row.status === 'Rejected') {
          displayText = 'Returned';
          statusClass = 'rejected';
        } else {
          displayText = row.status || 'Unknown';
          statusClass = 'pending';
        }
        
        return (
          <span className={`gon-review-status-badge gon-review-status-${statusClass}`}>
            {displayText}
          </span>
        );
      },
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
  ];

  if (loading && timesheets.length === 0) {
    return (
      <div className="gon-review-page">
        <div className="gon-review-loading">Loading timesheets...</div>
      </div>
    )
  }

  return (
    <div className="gon-review-page">
      <div className="gon-review-header">
        <h1 className="gon-review-title">Review Timesheets</h1>
        <p className="gon-review-subtitle">Track submitted timesheets</p>
      </div>

      {error && (
        <div className="gon-review-error">
          {error}
          <button onClick={fetchTimesheets} className="gon-retry-btn">Retry</button>
        </div>
      )}

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
            data={timesheets}
            rowKey="id"
            containerClassName=""
            tableClassName="gon-review-table"
            emptyMessage={`No ${activeTab} timesheets found`}
          />
        </div>
      </div>
    </div>
  )
}

export default TimesheetReview