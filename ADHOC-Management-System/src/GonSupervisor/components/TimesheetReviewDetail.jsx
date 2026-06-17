import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './TimesheetReviewDetail.css'
import AppButton from '../../shared/AppButton'
import { gonSupervisorService } from '../../services/api'

const TimesheetReviewDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [timesheet, setTimesheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    fetchTimesheetDetail()
  }, [id])

  const fetchTimesheetDetail = async () => {
    try {
      setLoading(true)
      const data = await gonSupervisorService.getTimesheetDetail(id)
      setTimesheet(data)
    } catch (err) {
      setError('Failed to load timesheet details')
      console.error('Error fetching timesheet:', err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  if (loading) {
    return (
      <div className="gon-tsd-page">
        <div className="gon-tsd-loading">Loading timesheet details...</div>
      </div>
    )
  }

  if (error || !timesheet) {
    return (
      <div className="gon-tsd-page">
        <div className="gon-tsd-error">{error || 'Timesheet not found'}</div>
        <AppButton onClick={() => navigate('/gon-supervisor/timesheet-review')}>
          Back to Review
        </AppButton>
      </div>
    )
  }

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
            Back to Review
          </Link>
          <h1 className="gon-tsd-title">Timesheet - {timesheet.monthYear}</h1>
          <p className="gon-tsd-user">{timesheet.staffName}</p>
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
                <span className="gon-tsd-info-value">{timesheet.fullName}</span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Status</span>
                <span className={`gon-tsd-status-pill gon-tsd-status-${timesheet.statusPill}`}>
                  {timesheet.status}
                </span>
              </div>
            </div>
            <div className="gon-tsd-staff-col">
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Department</span>
                <span className="gon-tsd-info-value">{timesheet.department}</span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Bank Name</span>
                <span className="gon-tsd-info-value">{timesheet.bankName}</span>
              </div>
            </div>
            <div className="gon-tsd-staff-col">
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Location</span>
                <span className="gon-tsd-info-value">{timesheet.location}</span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">Account Number</span>
                <span className="gon-tsd-info-value gon-tsd-info-strong">{timesheet.accountNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {timesheet.status === 'Approved' ? (
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
        ) : (
          <div className="gon-tsd-card gon-tsd-approval-card">
            <div className="gon-tsd-card-header">
              <h3 className="gon-tsd-card-title">Approval actions</h3>
            </div>
            <div className="gon-tsd-approval-actions">
              <AppButton
                type="button"
                className="gon-tsd-approve-btn"
                onClick={() => navigate(`/gon-supervisor/approval-action/${id}`)}
              >
                <span>Review & Approve</span>
              </AppButton>
            </div>
          </div>
        )}
      </div>

      <div className="gon-tsd-summary-bar">
        <span className="gon-tsd-summary-month">{timesheet.monthYear}</span>
        <span className="gon-tsd-summary-sep" />
        <span className="gon-tsd-summary-days">{timesheet.summaryInfo}</span>
        <span className="gon-tsd-summary-hours">{timesheet.totalHours} Total Hours</span>
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
            {timesheet.comments?.length > 0 && (
              <span className="gon-tsd-comments-badge">{timesheet.comments.length}</span>
            )}
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
                {timesheet.entries?.map((entry, index) => (
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
              <span className="gon-tsd-total-value">{timesheet.totalHours} hours</span>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="gon-tsd-comments-panel">
            {timesheet.comments?.length > 0 ? (
              timesheet.comments.map((comment) => (
                <div key={comment.id} className="gon-tsd-comment-card">
                  <div className="gon-tsd-comment-header">
                    <div className="gon-tsd-comment-user">
                      <div className="gon-tsd-comment-avatar">{comment.authorAvatar}</div>
                      <div className="gon-tsd-comment-user-info">
                        <div className="gon-tsd-comment-name">{comment.authorName}</div>
                        <div className="gon-tsd-comment-role">{comment.authorRole}</div>
                      </div>
                    </div>
                    <div className="gon-tsd-comment-date">{comment.createdAt}</div>
                  </div>
                  <div className="gon-tsd-comment-text">{comment.commentText}</div>
                </div>
              ))
            ) : (
              <div className="gon-tsd-no-comments">No comments yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimesheetReviewDetail