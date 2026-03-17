import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './TimesheetReviewDetail.css'
import AppButton from '../../shared/AppButton'

const TimesheetReviewDetail = () => {
  useParams()
  const [activeTab, setActiveTab] = useState('details')

  const entries = [
    { date: '28-02-2026', startTime: '08:00', endTime: '05:00', totalHours: '9 hrs', workDone: 'Community sensitization on health programs' },
    { date: '28-02-2026', startTime: '08:00', endTime: '05:00', totalHours: '9 hrs', workDone: 'Data collection in Ikeja area' },
    { date: '28-02-2026', startTime: '08:00', endTime: '05:00', totalHours: '9 hrs', workDone: 'Follow-up visits to beneficiaries' },
  ]

  return (
    <div className="gon-tsd-page">
      <div className="gon-tsd-header">
        <div className="gon-tsd-header-left">
          <Link to="/gon-supervisor/timesheet-review" className="gon-tsd-back-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 4L6 10L12 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="gon-tsd-title">Timesheet - January 2026</h1>
          <p className="gon-tsd-user">John Adeyemi</p>
        </div>
        <AppButton type="button" className="gon-tsd-download-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4V11M8 11L10 14L12 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 14V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Download PDF
        </AppButton>
      </div>

      <h2 className="gon-tsd-section-heading">Overview</h2>

      <div className="gon-tsd-overview-grid">
        <div className="gon-tsd-card gon-tsd-staff-card">
          <div className="gon-tsd-card-header">
            <h3 className="gon-tsd-card-title">Staff Information</h3>
          </div>
          <div className="gon-tsd-staff-grid">
            <div className="gon-tsd-staff-col">
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Full Name</span>
                <span className="gon-tsd-info-value">John Adeyemi</span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Status</span>
                <span className="gon-tsd-status-pill">GON Review</span>
              </div>
            </div>
            <div className="gon-tsd-staff-col">
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Department</span>
                <span className="gon-tsd-info-value">Field Operations</span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Bank Name</span>
                <span className="gon-tsd-info-value">First Bank</span>
              </div>
            </div>
            <div className="gon-tsd-staff-col">
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Location</span>
                <span className="gon-tsd-info-value">Lagos State</span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Account Number</span>
                <span className="gon-tsd-info-value gon-tsd-info-strong">1234567890</span>
              </div>
            </div>
          </div>
        </div>

        <div className="gon-tsd-card gon-tsd-approval-card">
          <div className="gon-tsd-card-header">
            <h3 className="gon-tsd-card-title">Approval actions</h3>
          </div>
          <div className="gon-tsd-approval-body">
            <div className="gon-tsd-approval-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" stroke="#10B981" strokeWidth="2" fill="none" />
                <path
                  d="M13 20L18 25L27 16"
                  stroke="#10B981"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="gon-tsd-approval-text">Approved &amp; Forwarded</div>
          </div>
        </div>
      </div>

      <div className="gon-tsd-summary-bar">
        <span className="gon-tsd-summary-month">February 2026</span>
        <span className="gon-tsd-summary-sep" />
        <span className="gon-tsd-summary-days">Total working days: 20</span>
        <span className="gon-tsd-summary-hours">160 Total Hours</span>
      </div>

      <div className="gon-tsd-detail-card">
        <div className="gon-tsd-tabs">
          <button
            type="button"
            className={`gon-tsd-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Timesheet Details
          </button>
          <button
            type="button"
            className={`gon-tsd-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
            <span className="gon-tsd-comments-badge">2</span>
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="gon-tsd-table-wrap">
            <table className="gon-tsd-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Total Hours</th>
                  <th>Work Done</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.date}</td>
                    <td>{entry.startTime}</td>
                    <td>{entry.endTime}</td>
                    <td className="gon-tsd-hours-cell">{entry.totalHours}</td>
                    <td>{entry.workDone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="gon-tsd-total-row">
              <span className="gon-tsd-total-label">Total Hours this month:</span>
              <span className="gon-tsd-total-value">27 hours</span>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="gon-tsd-comments-panel">
            <div className="gon-tsd-comment-card">
              <div className="gon-tsd-comment-header">
                <div className="gon-tsd-comment-user">
                  <div className="gon-tsd-comment-avatar">AM</div>
                  <div className="gon-tsd-comment-user-info">
                    <div className="gon-tsd-comment-name">Amina Mohammed</div>
                    <div className="gon-tsd-comment-role">GON Supervisor</div>
                  </div>
                </div>
                <div className="gon-tsd-comment-date">28-02-2026 10:30</div>
              </div>
              <div className="gon-tsd-comment-text">
                Please provide more details on the survey activities and include all working days. Only 1 day is listed for the entire month.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimesheetReviewDetail

