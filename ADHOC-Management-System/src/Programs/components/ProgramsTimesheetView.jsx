import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import '../../GonSupervisor/components/TimesheetReviewDetail.css'
import './ProgramsTimesheetDetail.css'
import { programsService } from '../../services/api'

const ProgramsTimesheetView = () => {
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
      const data = await programsService.getTimesheetDetail(id)
      setTimesheet(data)
    } catch (err) {
      setError('Failed to load timesheet details')
      console.error('Error fetching timesheet:', err)
    } finally {
      setLoading(false)
    }
  }

  const entriesColumns = [
    { header: 'Date', accessor: 'date', key: 'date' },
    { header: 'Start Time', accessor: 'startTime', key: 'startTime' },
    { header: 'End Time', accessor: 'endTime', key: 'endTime' },
    {
      header: 'Total Hours',
      accessor: 'totalHours',
      key: 'totalHours',
      cellClassName: 'gon-tsd-hours-cell',
    },
    { header: 'Work Done', accessor: 'workDone', key: 'workDone' },
  ]

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
        <AppButton onClick={() => navigate('/programs/timesheet-review')}>
          Back to Review
        </AppButton>
      </div>
    )
  }

  return (
    <div className="gon-tsd-page" data-timesheet-id={id}>
      <div className="gon-tsd-header">
        <div className="gon-tsd-header-left">
          <Link to="/programs/timesheet-review" className="gon-tsd-back-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 4L6 10L12 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
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
                
                <span className="pg-status-row">
                  {timesheet.gonApproved && (
                    <span className="pg-mini-pill pg-mini-pill-green">Approved</span>
                  )}
                  {timesheet.gonFlagged && (
                    <span className="pg-mini-pill pg-mini-pill-amber">Flagged</span>
                  )}
                </span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">ECEWS Status</span>
                {timesheet.ecewsApproved ? (
                  <span className="pg-mini-pill pg-mini-pill-green">Approved</span>
                ) : (
                  <span className="pg-mini-pill pg-mini-pill-gray">Pending</span>
                )}
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
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">GON Supervisor Name</span>
                <span className="gon-tsd-info-value">{timesheet.gonSupervisorName}</span>
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
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">ECEWS Supervisor Name</span>
                <span className="gon-tsd-info-value">{timesheet.ecewsSupervisorName}</span>
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
            <div className="gon-tsd-approval-text">Approved</div>
          </div>
        </div>
      </div>

      <div className="gon-tsd-summary-bar">
        <span className="gon-tsd-summary-month">{timesheet.monthYear}</span>
        <span className="gon-tsd-summary-sep" />
        <span className="gon-tsd-summary-days">{timesheet.summaryInfo}</span>
        <span className="gon-tsd-summary-hours">{timesheet.totalHours} Total Hours</span>
      </div>

      <div className="gon-tsd-detail-card">
        <div className="gon-tsd-tabs">
          <AppButton
            type="button"
            className={`gon-tsd-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Timesheet Details
          </AppButton>
          <AppButton
            type="button"
            className={`gon-tsd-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments {timesheet.comments?.length > 0 && <span className="gon-tsd-comments-badge">{timesheet.comments.length}</span>}
          </AppButton>
          <AppButton
            type="button"
            className={`gon-tsd-tab ${activeTab === 'concerns' ? 'active' : ''}`}
            onClick={() => setActiveTab('concerns')}
          >
            Concerns {timesheet.concerns?.length > 0 && <span className="gon-tsd-comments-badge">{timesheet.concerns.length}</span>}
          </AppButton>
        </div>

        {activeTab === 'details' && (
          <div className="gon-tsd-table-wrap">
            <AppTable columns={entriesColumns} data={timesheet.entries || []} tableClassName="gon-tsd-table" />
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

        {activeTab === 'concerns' && (
          <div className="pg-concerns-panel">
            {timesheet.concerns?.length > 0 ? (
              timesheet.concerns.map((concern) => (
                <div key={concern.id} className="pg-concern-card">
                  <div className="pg-concern-header">
                    <div className="pg-concern-user">
                      <div className="pg-concern-avatar">{concern.authorAvatar}</div>
                      <div className="pg-concern-user-info">
                        <div className="pg-concern-name">{concern.authorName}</div>
                        <div className="pg-concern-role">{concern.authorRole}</div>
                      </div>
                    </div>
                    <div className="pg-concern-date">{concern.createdAt}</div>
                  </div>

                  <div className="pg-concern-text">{concern.concernText}</div>

                  <div className="pg-concern-meta">
                    <div className="pg-concern-meta-group">
                      <span className="pg-concern-meta-label">Severity:</span>
                      <span className={`pg-concern-pill pg-concern-pill-${concern.severity?.toLowerCase()}`}>
                        {concern.severity}
                      </span>
                    </div>
                    <div className="pg-concern-meta-group">
                      <span className="pg-concern-meta-label">Type:</span>
                      <span className="pg-concern-pill pg-concern-pill-type">{concern.type}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="pg-no-concerns">No concerns raised</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgramsTimesheetView