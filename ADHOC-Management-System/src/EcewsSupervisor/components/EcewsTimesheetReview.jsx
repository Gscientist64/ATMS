// src/EcewsSupervisor/components/EcewsTimesheetReview.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './EcewsTimesheetReview.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { ecewsSupervisorService } from '../../services/api'

const EcewsTimesheetReview = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('pending')
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardStats, setDashboardStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    returnedCount: 0,
    totalStaff: 0
  })

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const data = await ecewsSupervisorService.getDashboard()
      setDashboardStats(data)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    }
  }

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'Submitted':
        return 'Pending';
      case 'GONReview':
        return 'Facility Supervisor Review';
      case 'ProgramsReview':
        return 'Programs Review';
      case 'Approved':
        return 'Approved';
      case 'Rejected':
        return 'Returned';
      default:
        return status;
    }
  };

  // Fetch timesheets based on active tab
  const fetchTimesheets = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      switch (activeTab) {
        case 'pending':
          endpoint = 'pending'
          break
        case 'approved':
          endpoint = 'approved'
          break
        case 'returned':
          endpoint = 'returned'
          break
        default:
          endpoint = 'pending'
      }
      const data = await ecewsSupervisorService.getTimesheetsForReview(endpoint)
      setTimesheets(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load timesheets')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when tab changes or component mounts
  useEffect(() => {
    fetchTimesheets()
    fetchDashboardStats()
  }, [activeTab])

  // Refresh after approve/decline if returning from detail page
  useEffect(() => {
    if (location.state?.refresh) {
      fetchTimesheets()
      fetchDashboardStats()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const handleReview = (id) => {
    navigate(`/ecews-supervisor/timesheet/${id}`)
  }

  // Get status class for badge styling
  const getStatusClass = (status) => {
    switch(status) {
      case 'Submitted':
        return 'pending';
      case 'GONReview':
        return 'facility';  // or 'warning' / 'review'
      case 'ProgramsReview':
        return 'programs';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  // Get display status text
  const getDisplayStatus = (status) => {
    switch(status) {
      case 'Submitted':
        return 'Pending';
      case 'GONReview':
        return 'Facility Supervisor Review';  // Change this line
      case 'ProgramsReview':
        return 'Programs Review';
      case 'Approved':
        return 'Approved';
      case 'Rejected':
        return 'Returned';
      default:
        return status;
    }
  };

  const columns = [
    { header: 'Staff name', accessor: 'staffName', key: 'staffName' },
    { header: 'Month/Year', accessor: 'monthYear', key: 'monthYear' },
    { header: 'Days Worked', accessor: 'daysWorked', key: 'daysWorked' },
    { header: 'Submission Date', accessor: 'submittedDate', key: 'submittedDate' },
    {
      header: 'Status',
      accessor: (row) => getStatusDisplay(row.status),
      key: 'status',
      render: (row) => (
        <span className={`ecews-review-status-badge ecews-review-status-${getStatusClass(row.status)}`}>
          {getDisplayStatus(row.status)}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => {
        // For pending tab - show Review button
        if (activeTab === 'pending') {
          return (
            <AppButton
              type="button"
              className="ecews-review-btn"
              onClick={() => handleReview(row.id)}
            >
              Review
            </AppButton>
          )
        }
        // For approved/returned tabs - show View button
        return (
          <AppButton
            type="button"
            className="ecews-review-view-btn"
            onClick={() => handleReview(row.id)}
          >
            View
          </AppButton>
        )
      },
    },
  ]

  if (loading && timesheets.length === 0) {
    return (
      <div className="ecews-review-page">
        <div className="ecews-review-loading">Loading timesheets...</div>
      </div>
    )
  }

  return (
    <div className="ecews-review-page">
      <div className="ecews-review-header">
        <h1 className="ecews-review-title">Timesheet Review</h1>
        <p className="ecews-review-subtitle">Review and manage submitted timesheets</p>
      </div>

      {error && (
        <div className="ecews-review-error">
          {error}
          <button onClick={fetchTimesheets} className="ecews-retry-btn">Retry</button>
        </div>
      )}

      <div className="ecews-review-card">
        <div className="ecews-review-card-header">
          <h2 className="ecews-review-card-title">All Timesheets</h2>
        </div>

        <div className="ecews-review-tabs">
          <button
            type="button"
            className={`ecews-review-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({dashboardStats.pendingCount})
          </button>
          <button
            type="button"
            className={`ecews-review-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({dashboardStats.approvedCount})
          </button>
          <button
            type="button"
            className={`ecews-review-tab ${activeTab === 'returned' ? 'active' : ''}`}
            onClick={() => setActiveTab('returned')}
          >
            Returned ({dashboardStats.returnedCount})
          </button>
        </div>

        <div className="ecews-review-table-container">
          <AppTable
            columns={columns}
            data={timesheets}
            rowKey="id"
            containerClassName=""
            tableClassName="ecews-review-table"
            emptyMessage={`No ${activeTab} timesheets found`}
          />
        </div>
      </div>
    </div>
  )
}

export default EcewsTimesheetReview