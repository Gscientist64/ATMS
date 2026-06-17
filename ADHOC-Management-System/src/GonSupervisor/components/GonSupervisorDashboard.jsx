// GonSupervisorDashboard.jsx - Main dashboard component for Gon Supervisor role, showing overview cards and active timesheets

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './GonSupervisorDashboard.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { gonSupervisorService } from '../../services/api'

const GonSupervisorDashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Helper functions for status display
  const getStatusDisplay = (status) => {
    if (status === 'Facility Supervisor Review') {
      return 'Pending';
    } else if (status === 'ProgramsReview' || status === 'Programs Review') {
      return 'Programs Review';
    } else if (status === 'Approved') {
      return 'Approved';
    } else if (status === 'Rejected') {
      return 'Returned';
    } else if (status === 'Submitted') {
      return 'Submitted';
    }
    return status;
  }

  const getStatusClass = (status) => {
    if (status === 'Facility Supervisor Review') {
      return 'pending';
    } else if (status === 'ProgramsReview' || status === 'Programs Review') {
      return 'programs';
    } else if (status === 'Approved') {
      return 'approved';
    } else if (status === 'Rejected') {
      return 'rejected';
    }
    return 'pending';
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await gonSupervisorService.getDashboard()
      setDashboardData(data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const overviewCards = dashboardData ? [
    {
      id: 'pending',
      label: 'Pending Timesheets',
      value: dashboardData.pendingTimesheets,
      detail: 'Awaiting your review',
      iconBg: '#FFF7E6',
      iconColor: '#F59E0B',
    },
    {
      id: 'approved',
      label: 'Approved this month',
      value: dashboardData.approvedThisMonth,
      detail: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      iconBg: '#ECFDF3',
      iconColor: '#16A34A',
    },
    {
      id: 'returned',
      label: 'Returned for correction',
      value: dashboardData.returnedForCorrection,
      detail: 'Requires resubmission',
      iconBg: '#FEF2F2',
      iconColor: '#E11D48',
    },
    {
      id: 'supervisees',
      label: 'Supervisees',
      value: dashboardData.superviseesCount,
      detail: 'No of Subordinates',
      iconBg: '#E5E7EB',
      iconColor: '#4B5563',
    },
  ] : []

  const activeTimesheetColumns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Department', accessor: 'department' },
    { header: 'Month', accessor: 'month' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const displayText = getStatusDisplay(row.status);
        const statusClass = getStatusClass(row.status);
        return (
          <span className={`gon-status-badge gon-status-${statusClass}`}>
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
          className="gon-review-btn"
          onClick={() => navigate(`/gon-supervisor/approval-action/${row.id}`)}
        >
          Review
        </AppButton>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="gon-dashboard">
        <div className="gon-loading">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="gon-dashboard">
        <div className="gon-error">{error}</div>
        <AppButton onClick={() => window.location.reload()} className="gon-retry-btn">
          Retry
        </AppButton>
      </div>
    )
  }

  return (
    <div className="gon-dashboard">
      <div className="gon-header">
        <h1 className="gon-title">Facility Supervisor Dashboard</h1>
        <p className="gon-subtitle">Review and approve staff timesheets</p>
      </div>

      <section className="gon-section">
        <h2 className="gon-section-title">Overview</h2>
        <div className="gon-overview-grid">
          {overviewCards.map((card) => (
            <div key={card.id} className="gon-overview-card">
              <div
                className="gon-overview-icon-wrapper"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                {card.id === 'pending' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 8V12L14.5 14.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.id === 'approved' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.id === 'returned' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M9 9L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15 9L9 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {card.id === 'supervisees' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M6 19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div className="gon-overview-text">
                <div className="gon-overview-label">{card.label}</div>
                <div className="gon-overview-value">{card.value}</div>
                <div className="gon-overview-detail">{card.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gon-section">
        <h2 className="gon-section-title">Active Timesheet</h2>
        <div className="gon-table-card">
          <AppTable
            columns={activeTimesheetColumns}
            data={dashboardData?.activeTimesheets || []}
            rowKey="id"
            containerClassName="gon-table-container"
            tableClassName="gon-table"
            emptyMessage="No pending timesheets"
          />
        </div>
      </section>
    </div>
  )
}

export default GonSupervisorDashboard