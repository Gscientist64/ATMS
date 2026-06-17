import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import '../../GonSupervisor/components/TimesheetReviewDetail.css'
import './ProgramsTimesheetDetail.css'
import { programsService } from '../../services/api'
import { stripHtml } from '../../utils/stringUtils'

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
  { header: 'Work Done', key: 'workDone', render: (row) => stripHtml(row.workDone) },
]

const ProgramsTimesheetDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [timesheet, setTimesheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isContractRecOpen, setIsContractRecOpen] = useState(false)
  const [contractRec, setContractRec] = useState('')
  const [contractReason, setContractReason] = useState('')
  const [declineFeedback, setDeclineFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleConfirmApprove = async () => {
    try {
      setSubmitting(true)
      await programsService.approveTimesheet(id, {
        contractRecommendation: contractRec || null,
        reason: contractRec ? contractReason : null,
      })
      setIsConfirmOpen(false)
      setIsContractRecOpen(false)
      setContractRec('')
      setContractReason('')
      setSuccessMessage('Timesheet has been successfully approved')
      setIsSuccessOpen(true)
      await fetchTimesheetDetail()
    } catch (err) {
      setError(err.message || 'Failed to approve timesheet')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendFeedback = async () => {
    if (!declineFeedback.trim()) return
    try {
      setSubmitting(true)
      await programsService.declineTimesheet(id, declineFeedback)
      setIsDeclineOpen(false)
      setDeclineFeedback('')
      setSuccessMessage('Your feedback has been sent and staff notified.')
      setIsSuccessOpen(true)
      await fetchTimesheetDetail()
    } catch (err) {
      setError(err.message || 'Failed to send feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="gon-tsd-page">
        <div className="gon-tsd-loading">Loading timesheet details...</div>
      </div>
    )
  }

  if (error && !timesheet) {
    return (
      <div className="gon-tsd-page">
        <div className="gon-tsd-error">{error}</div>
        <AppButton onClick={() => navigate('/programs/timesheet-review')}>
          Back to Review
        </AppButton>
      </div>
    )
  }

  if (!timesheet) return null

  const isPending = timesheet.status === 'Programs Review'

  return (
    <div className="gon-tsd-page">
      <div className="gon-tsd-header">
        <div className="gon-tsd-header-left">
          <Link to="/programs" className="gon-tsd-back-link">
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

      {error && (
        <div className="gon-tsd-toast-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

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
                <span className="gon-tsd-info-label">Facility Supervisor Status</span>
                <span className="pg-status-row">
                  {timesheet.gonApproved && (
                    <span className="pg-mini-pill pg-mini-pill-green">Approved</span>
                  )}
                  {timesheet.gonFlagged && (
                    <span className="pg-mini-pill pg-mini-pill-amber">Flagged</span>
                  )}
                  {!timesheet.gonApproved && !timesheet.gonFlagged && (
                    <span className="pg-mini-pill">Pending</span>
                  )}
                </span>
              </div>
              <div className="gon-tsd-info-item">
                <span className="gon-tsd-info-label">ECEWS Status</span>
                <span className={`pg-mini-pill ${timesheet.ecewsApproved ? 'pg-mini-pill-green' : ''}`}>
                  {timesheet.ecewsApproved ? 'Approved' : 'Pending'}
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
          {isPending ? (
            <div className="gon-aa-approval-actions">
              <AppButton type="button" className="gon-aa-approve-btn" onClick={() => setIsConfirmOpen(true)}>
                <span className="gon-aa-approve-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M4.5 8L7 10.5L11.5 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>Approve &amp; Forward</span>
              </AppButton>

              <AppButton type="button" className="gon-aa-decline-btn" onClick={() => setIsDeclineOpen(true)}>
                <span className="gon-aa-decline-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M5.5 5.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.5 5.5L5.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>Decline with Feedback</span>
              </AppButton>
            </div>
          ) : (
            <div className="gon-tsd-approval-body">
              <div className="gon-tsd-approval-text">
                {timesheet.status === 'Returned' ? 'Returned for Correction' : timesheet.status}
              </div>
            </div>
          )}
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
            Comments {timesheet.comments?.length > 0 && (
              <span className="gon-tsd-comments-badge">{timesheet.comments.length}</span>
            )}
          </AppButton>
          <AppButton
            type="button"
            className={`gon-tsd-tab ${activeTab === 'concerns' ? 'active' : ''}`}
            onClick={() => setActiveTab('concerns')}
          >
            Concerns {timesheet.concerns?.length > 0 && (
              <span className="gon-tsd-comments-badge">{timesheet.concerns.length}</span>
            )}
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
                      <span
                        className={`pg-concern-pill pg-concern-pill-${(concern.severity || '').toLowerCase()}`}
                      >
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
              <div className="gon-tsd-no-comments">No concerns raised</div>
            )}
          </div>
        )}
      </div>

      {isConfirmOpen && (
        <div className="gon-aa-modal-overlay" onClick={() => setIsConfirmOpen(false)}>
          <div className="gon-aa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gon-aa-modal-header">
              <h3 className="gon-aa-modal-title">Confirm Approval</h3>
              <AppButton type="button" className="gon-aa-modal-close" onClick={() => setIsConfirmOpen(false)}>
                ✕
              </AppButton>
            </div>
            <div className="gon-aa-modal-body">
              <p className="gon-aa-modal-text">
                You are about to approve this timesheet.
                <br />
                If you want to make a contract recommendation, continue below and provide the necessary
                details before proceeding.
              </p>

              <AppButton
                type="button"
                className={`pg-contract-toggle ${isContractRecOpen ? 'open' : ''}`}
                onClick={() => setIsContractRecOpen((v) => !v)}
              >
                <span className="pg-contract-toggle-label">Contract Recommendation (Optional)</span>
                <span className="pg-contract-toggle-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </AppButton>

              {isContractRecOpen && (
                <div className="pg-contract-body">
                  <div className="pg-contract-help">
                    Use this option only if performance or contract status requires HR review.
                  </div>

                  <label className="pg-contract-radio">
                    <input
                      type="radio"
                      name="contractRec"
                      value="Renewal"
                      checked={contractRec === 'Renewal'}
                      onChange={() => setContractRec('Renewal')}
                    />
                    <span>Recommend Renewal</span>
                  </label>

                  <label className="pg-contract-radio">
                    <input
                      type="radio"
                      name="contractRec"
                      value="PIP"
                      checked={contractRec === 'PIP'}
                      onChange={() => setContractRec('PIP')}
                    />
                    <span>Recommend PIP</span>
                  </label>

                  <label className="pg-contract-radio">
                    <input
                      type="radio"
                      name="contractRec"
                      value="Termination"
                      checked={contractRec === 'Termination'}
                      onChange={() => setContractRec('Termination')}
                    />
                    <span>Recommend Termination</span>
                  </label>

                  <textarea
                    className="pg-contract-reason"
                    rows={4}
                    placeholder="Provide reason"
                    value={contractReason}
                    onChange={(e) => setContractReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="gon-aa-modal-footer">
              <AppButton
                type="button"
                className="gon-aa-modal-btn gon-aa-modal-cancel"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="gon-aa-modal-btn gon-aa-modal-confirm"
                onClick={handleConfirmApprove}
                disabled={submitting}
              >
                {submitting ? 'Confirming...' : 'Confirm'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isSuccessOpen && (
        <div className="gon-aa-modal-overlay" onClick={() => setIsSuccessOpen(false)}>
          <div className="gon-aa-success-modal" onClick={(e) => e.stopPropagation()}>
            <AppButton type="button" className="gon-aa-success-close" onClick={() => setIsSuccessOpen(false)}>
              ✕
            </AppButton>
            <div className="gon-aa-success-body">
              <h3 className="gon-aa-success-title">Done!</h3>
              <p className="gon-aa-success-message">
                {successMessage || 'Timesheet has been successfully approved'}
              </p>
              <div className="gon-aa-success-footer">
                <AppButton type="button" className="gon-aa-success-ok-btn" onClick={() => setIsSuccessOpen(false)}>
                  Okay
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeclineOpen && (
        <div className="gon-aa-modal-overlay" onClick={() => setIsDeclineOpen(false)}>
          <div className="gon-aa-decline-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gon-aa-decline-header">
              <h3 className="gon-aa-decline-title">Return Timesheet with Feedback</h3>
              <AppButton type="button" className="gon-aa-decline-close" onClick={() => setIsDeclineOpen(false)}>
                ✕
              </AppButton>
            </div>
            <div className="gon-aa-decline-body">
              <p className="gon-aa-decline-text">
                Provide feedback to help the staff member correct their timesheet.
              </p>
              <label className="gon-aa-decline-label">
                Feedback<span className="gon-aa-decline-required">*</span>
              </label>
              <textarea
                className="gon-aa-decline-textarea"
                rows={4}
                placeholder="Explain what needs to be corrected..."
                value={declineFeedback}
                onChange={(e) => setDeclineFeedback(e.target.value)}
              />
            </div>
            <div className="gon-aa-decline-footer">
              <AppButton type="button" className="gon-aa-decline-btn-cancel" onClick={() => setIsDeclineOpen(false)}>
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="gon-aa-decline-btn-send"
                onClick={handleSendFeedback}
                disabled={submitting || !declineFeedback.trim()}
              >
                {submitting ? 'Sending...' : 'Send Feedback'}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgramsTimesheetDetail
