// src/Ad-Hoc/components/Dashboard.jsx

import React, { useState, useEffect } from 'react'
import './Dashboard.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { adHocService, getActiveWorkCycles } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'


const Dashboard = () => {
  const [alertVisible, setAlertVisible] = useState(true)
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState({})
  const { user: authUser } = useAuth()
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true)
  const [currentCycle, setCurrentCycle] = useState(null)
  const [checkingCycle, setCheckingCycle] = useState(true)
  
  useEffect(() => {
    fetchUserData()
    fetchTimesheets()
    fetchAnnouncements()
    checkWorkCycleStatus()
  }, [])

  const fetchUserData = async () => {
    try {
      const userData = await adHocService.getProfile()
      setUser(userData)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const checkWorkCycleStatus = async () => {
    try {
        setCheckingCycle(true);
        const cycles = await getActiveWorkCycles();
        // Find the active timesheet cycle for auxilary staff
        const activeCycle = cycles.find(cycle => 
            cycle.cycleType === 'timesheet' && 
            cycle.audience === 'auxilary-staff'
        );
        
        if (activeCycle) {
            const now = new Date();
            const endDate = new Date(activeCycle.endDate);
            setIsSubmissionOpen(now <= endDate);
        } else {
            // No active cycle - no timesheet submission allowed
            setIsSubmissionOpen(false);
        }
    } catch (error) {
        console.error('Error fetching work cycle:', error);
        setIsSubmissionOpen(false);
    } finally {
        setCheckingCycle(false);
    }
}

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await adHocService.getTimesheets()
      setTimesheets(data)
    } catch (error) {
      console.error('Error fetching timesheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const data = await adHocService.getActiveAnnouncements()
      setAnnouncements(data || [])
      
      // Load dismissed state from localStorage
      const dismissed = {}
      ;(data || []).forEach(ann => {
        const isDismissed = localStorage.getItem(`announcement_dismissed_${ann.id}`) === 'true'
        dismissed[ann.id] = isDismissed
      })
      setDismissedAnnouncements(dismissed)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const dismissAnnouncement = (announcementId) => {
    localStorage.setItem(`announcement_dismissed_${announcementId}`, 'true')
    setDismissedAnnouncements(prev => ({
      ...prev,
      [announcementId]: true
    }))
  }

  const formatDate = () => {
    const date = new Date()
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return date.toLocaleDateString('en-US', options)
  }

  const getCurrentMonth = () => {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#f44336'
      case 'normal':
        return '#2196f3'
      case 'low':
        return '#4caf50'
      default:
        return '#2196f3'
    }
  }

  const recentColumns = [
    { header: 'Month/Year', accessor: 'monthYear' },
    { header: 'Days Worked', accessor: 'daysWorked' },
    { header: 'Submitted Date', accessor: 'submittedDate' },
    { header: 'Status', accessor: 'status' },
    { header: 'Action', accessor: 'action' },
  ]

  const currentMonth = getCurrentMonth()
  const currentMonthTimesheet = timesheets.find(ts => ts.monthYear === currentMonth)
  const canCreateTimesheet = !currentMonthTimesheet || 
    (currentMonthTimesheet.status === 'Rejected' && isSubmissionOpen)

  // Filter visible announcements (not dismissed)
  const visibleAnnouncements = announcements.filter(ann => !dismissedAnnouncements[ann.id])

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {user?.fullName?.split(' ')[0] || authUser?.fullName?.split(' ')[0] || 'User'}</h1>
        <p className="welcome-date">{formatDate()}</p>
      </div>

      {/* HR Announcements - Dynamic from backend */}
      {visibleAnnouncements.map((announcement) => (
        <div 
          key={announcement.id} 
          className="alert-banner"
          style={{ borderLeftColor: getPriorityColor(announcement.priority) }}
        >
          <div className="alert-content">
            <div className="alert-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke={getPriorityColor(announcement.priority)} strokeWidth="2" fill="none" />
                <path
                  d="M10 6V10M10 14H10.01"
                  stroke={getPriorityColor(announcement.priority)}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="alert-text">
              <div className="alert-title">{announcement.title}</div>
              <div className="alert-message">{announcement.message}</div>
              {announcement.expiresAt && (
                <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                  Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <button
            className="alert-close"
            onClick={() => dismissAnnouncement(announcement.id)}
            aria-label="Dismiss announcement"
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
      ))}

      {/* Show warning if submission is closed */}
      {!isSubmissionOpen && !checkingCycle && (
        <div className="alert-banner" style={{ backgroundColor: '#FEE2E2', borderLeftColor: '#DC2626' }}>
          <div className="alert-content">
            <div className="alert-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#DC2626" strokeWidth="2" fill="#FEE2E2" />
                <path d="M10 6V10M10 14H10.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="alert-text">
              <div className="alert-title" style={{ color: '#DC2626' }}>Timesheet Submission Closed</div>
              <div className="alert-message" style={{ color: '#B91C1C' }}>
                The timesheet submission period for {currentMonth} has ended. Please contact HR for assistance.
              </div>
            </div>
          </div>
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
                <div className="overview-month">{currentMonth}</div>
                {currentMonthTimesheet ? (
                  <span className="status-badge">{currentMonthTimesheet.status}</span>
                ) : (
                  <span className="status-badge">Not started</span>
                )}
              </div>
            </div>
            {canCreateTimesheet && isSubmissionOpen && (
                <AppButton
                    to="/timesheet/create"
                    className="create-timesheet-btn"
                    label="Create Timesheet"
                />
            )}
            {!isSubmissionOpen && !checkingCycle && (
                <div className="timesheet-closed-message">
                    Timesheet submission for {currentMonth} is closed
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="timesheet-section">
        <h2 className="section-title">Recent Timesheet</h2>
        <div className="timesheet-card">
          <AppTable
            columns={recentColumns}
            data={timesheets.slice(0, 5)}
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