import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './EcewsTimesheetApproval.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { ecewsSupervisorService } from '../../services/api'
import { stripHtml } from '../../utils/stringUtils'

const entriesColumns = [
  { header: 'Date', accessor: 'date', key: 'date' },
  { header: 'Start Time', accessor: 'startTime', key: 'startTime' },
  { header: 'End Time', accessor: 'endTime', key: 'endTime' },
  {
    header: 'Total Hours',
    accessor: 'totalHours',
    key: 'totalHours',
    cellClassName: 'ecews-ta-hours-cell',
  },
  { header: 'Work Done', key: 'workDone', render: (row) => stripHtml(row.workDone) },
]

const EcewsTimesheetApproval = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [timesheet, setTimesheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isContractOpen, setIsContractOpen] = useState(false)
  const [contractRecommendation, setContractRecommendation] = useState('')
  const [contractReason, setContractReason] = useState('')
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [isDeclineClosing, setIsDeclineClosing] = useState(false)
  const [declineFeedback, setDeclineFeedback] = useState('')
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSuccessClosing, setIsSuccessClosing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTimesheetDetail()
  }, [id])

  const fetchTimesheetDetail = async () => {
    try {
      setLoading(true)
      const data = await ecewsSupervisorService.getTimesheetDetail(id)
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
      await ecewsSupervisorService.approveTimesheet(id, {
        contractRecommendation: contractRecommendation || null,
        reason: contractRecommendation ? contractReason : null,
      })
      setIsConfirmOpen(false)
      setSuccessMessage('Timesheet has been successfully approved')
      setIsSuccessOpen(true)
      await fetchTimesheetDetail()
    } catch (err) {
      setError(err.message || 'Failed to approve timesheet')
    } finally {
      setSubmitting(false)
    }
  }

  const closeDeclineModal = () => {
    if (isDeclineClosing) return
    setIsDeclineClosing(true)
    setTimeout(() => {
      setIsDeclineOpen(false)
      setIsDeclineClosing(false)
    }, 350)
  }

  const handleSendFeedback = async () => {
    if (!declineFeedback.trim()) return
    try {
      setSubmitting(true)
      await ecewsSupervisorService.declineTimesheet(id, declineFeedback)
      setIsDeclineClosing(true)
      setTimeout(async () => {
        setIsDeclineOpen(false)
        setIsDeclineClosing(false)
        setDeclineFeedback('')
        setSuccessMessage('Your feedback has been sent and staff notified.')
        setIsSuccessOpen(true)
        await fetchTimesheetDetail()
      }, 350)
    } catch (err) {
      setError(err.message || 'Failed to send feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const closeSuccessModal = () => {
    if (isSuccessClosing) return
    setIsSuccessClosing(true)
    setTimeout(() => {
      setIsSuccessOpen(false)
      setIsSuccessClosing(false)
    }, 350)
  }

  if (loading) {
    return (
      <div className="ecews-ta-page">
        <div className="ecews-ta-loading">Loading timesheet details...</div>
      </div>
    )
  }

  if (error && !timesheet) {
    return (
      <div className="ecews-ta-page">
        <div className="ecews-ta-error">{error}</div>
        <AppButton onClick={() => navigate('/ecews-supervisor/timesheet-review')}>
          Back to Review
        </AppButton>
      </div>
    )
  }

  if (!timesheet) return null

  const isPending = timesheet.status === 'Submitted'

  return (
    <div className="ecews-ta-page">
      <div className="ecews-ta-header">
        <div className="ecews-ta-header-left">
          <Link to="/ecews-supervisor/timesheet-review" className="ecews-ta-back-link">
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
          <h1 className="ecews-ta-title">Timesheet - {timesheet.monthYear}</h1>
          <p className="ecews-ta-user">{timesheet.staffName}</p>
        </div>
        <AppButton type="button" className="ecews-ta-download-btn">
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
        <div className="ecews-ta-toast-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <h2 className="ecews-ta-section-heading">Overview</h2>

      <div className="ecews-ta-overview-grid">
        <div className="ecews-ta-card ecews-ta-staff-card">
          <div className="ecews-ta-card-header">
            <h3 className="ecews-ta-card-title">Staff Information</h3>
          </div>
          <div className="ecews-ta-staff-grid">
            <div className="ecews-ta-staff-col">
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Full Name</span>
                <span className="ecews-ta-info-value">{timesheet.fullName}</span>
              </div>
              <div className="ecews-ta-info-item ecews-ta-info-status">
                <span className="ecews-ta-info-label">Facility Supervisor Status</span>
                <div className="ecews-ta-status-pills">
                  {timesheet.gonApproved && (
                    <span className="ecews-ta-status-pill ecews-ta-status-approved">Approved</span>
                  )}
                  {timesheet.gonFlagged && (
                    <span className="ecews-ta-status-pill ecews-ta-status-flagged">Flagged</span>
                  )}
                  {!timesheet.gonApproved && !timesheet.gonFlagged && (
                    <span className="ecews-ta-status-pill">Pending</span>
                  )}
                </div>
              </div>
            </div>
            <div className="ecews-ta-staff-col">
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Department</span>
                <span className="ecews-ta-info-value">{timesheet.department}</span>
              </div>
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Bank Name</span>
                <span className="ecews-ta-info-value">{timesheet.bankName}</span>
              </div>
            </div>
            <div className="ecews-ta-staff-col">
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Location</span>
                <span className="ecews-ta-info-value">{timesheet.location}</span>
              </div>
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Account Number</span>
                <span className="ecews-ta-info-value ecews-ta-info-strong">{timesheet.accountNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {isPending ? (
          <div className="ecews-ta-card ecews-ta-approval-card">
            <div className="ecews-ta-card-header">
              <h3 className="ecews-ta-card-title">Approval actions</h3>
            </div>
            <div className="ecews-ta-approval-actions">
              <AppButton
                type="button"
                className="ecews-ta-approve-btn"
                onClick={() => setIsConfirmOpen(true)}
              >
                <span className="ecews-ta-approve-icon">
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
              <AppButton
                type="button"
                className="ecews-ta-decline-btn"
                onClick={() => {
                  setIsDeclineClosing(false)
                  setIsDeclineOpen(true)
                }}
              >
                <span className="ecews-ta-decline-icon">
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
          </div>
        ) : (
          <div className="ecews-ta-card ecews-ta-approval-card">
            <div className="ecews-ta-card-header">
              <h3 className="ecews-ta-card-title">Approval actions</h3>
            </div>
            <div className="ecews-ta-approval-body">
              {timesheet.status === 'Rejected' ? (
                <>
                  <span className="ecews-ta-approval-status-icon ecews-ta-approval-status-icon--declined">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="19" stroke="#DC2626" strokeWidth="2" fill="none" />
                      <path
                        d="M15 15L25 25M25 15L15 25"
                        stroke="#DC2626"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="ecews-ta-approval-status-text">Returned for Correction</span>
                </>
              ) : (
                <>
                  <span className="ecews-ta-approval-status-icon ecews-ta-approval-status-icon--approved">
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
                  </span>
                  <span className="ecews-ta-approval-status-text">Approved &amp; Forwarded</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="ecews-ta-summary-bar">
        <span className="ecews-ta-summary-month">{timesheet.monthYear}</span>
        <span className="ecews-ta-summary-sep" />
        <span className="ecews-ta-summary-days">{timesheet.summaryInfo}</span>
        <span className="ecews-ta-summary-hours">{timesheet.totalHours} Total Hours</span>
      </div>

      <div className="ecews-ta-detail-card">
        <div className="ecews-ta-tabs">
          <button
            type="button"
            className={`ecews-ta-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Timesheet Details
          </button>
          <button
            type="button"
            className={`ecews-ta-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
            {timesheet.comments?.length > 0 && (
              <span className="ecews-ta-tab-badge">{timesheet.comments.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`ecews-ta-tab ${activeTab === 'concerns' ? 'active' : ''}`}
            onClick={() => setActiveTab('concerns')}
          >
            Concerns
            {timesheet.concerns?.length > 0 && (
              <span className="ecews-ta-tab-badge">{timesheet.concerns.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="ecews-ta-table-wrap">
            <AppTable columns={entriesColumns} data={timesheet.entries || []} tableClassName="ecews-ta-table" />
            <div className="ecews-ta-total-row">
              <span className="ecews-ta-total-label">Total Hours this month:</span>
              <span className="ecews-ta-total-value">{timesheet.totalHours} hours</span>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="ecews-ta-comments-panel">
            {timesheet.comments?.length > 0 ? (
              timesheet.comments.map((comment) => (
                <div key={comment.id} className="ecews-ta-comment-card">
                  <div className="ecews-ta-comment-header">
                    <div className="ecews-ta-comment-user">
                      <div className="ecews-ta-comment-avatar">{comment.authorAvatar}</div>
                      <div className="ecews-ta-comment-user-info">
                        <div className="ecews-ta-comment-name">{comment.authorName}</div>
                        <div className="ecews-ta-comment-role">{comment.authorRole}</div>
                      </div>
                    </div>
                    <div className="ecews-ta-comment-date">{comment.createdAt}</div>
                  </div>
                  <div className="ecews-ta-comment-text">{comment.commentText}</div>
                </div>
              ))
            ) : (
              <div className="ecews-ta-no-comments">No comments yet</div>
            )}
          </div>
        )}

        {activeTab === 'concerns' && (
          <div className="ecews-ta-concerns-panel">
            {timesheet.concerns?.length > 0 ? (
              timesheet.concerns.map((concern) => (
                <div key={concern.id} className="ecews-ta-concern-card">
                  <div className="ecews-ta-concern-header">
                    <div className="ecews-ta-concern-user">
                      <div className="ecews-ta-concern-avatar">{concern.authorAvatar}</div>
                      <div className="ecews-ta-concern-user-info">
                        <div className="ecews-ta-concern-name">{concern.authorName}</div>
                        <div className="ecews-ta-concern-role">{concern.authorRole}</div>
                      </div>
                    </div>
                    <div className="ecews-ta-concern-date">{concern.createdAt}</div>
                  </div>

                  <div className="ecews-ta-concern-text">{concern.concernText}</div>

                  <div className="ecews-ta-concern-meta">
                    <div className="ecews-ta-concern-meta-group">
                      <span className="ecews-ta-concern-meta-label">Severity:</span>
                      <span
                        className={`ecews-ta-concern-pill ecews-ta-concern-pill-${(concern.severity || '').toLowerCase()}`}
                      >
                        {concern.severity}
                      </span>
                    </div>
                    <div className="ecews-ta-concern-meta-group">
                      <span className="ecews-ta-concern-meta-label">Type:</span>
                      <span className="ecews-ta-concern-pill ecews-ta-concern-pill-type">{concern.type}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ecews-ta-no-comments">No concerns raised</div>
            )}
          </div>
        )}
      </div>

      {isConfirmOpen && (
        <div className="ecews-ta-modal-overlay" onClick={() => setIsConfirmOpen(false)}>
          <div className="ecews-ta-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ecews-ta-modal-header">
              <h3 className="ecews-ta-modal-title">Confirm Approval</h3>
              <button
                type="button"
                className="ecews-ta-modal-close"
                onClick={() => setIsConfirmOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="ecews-ta-modal-body">
              <p className="ecews-ta-modal-text">
                You are about to approve this timesheet.
                <br />
                If you want to make a contract advisory, continue below and provide the necessary
                details before proceeding.
              </p>

              <button
                type="button"
                className={`ecews-ta-contract-toggle ${isContractOpen ? 'open' : ''}`}
                onClick={() => setIsContractOpen((prev) => !prev)}
              >
                <span className="ecews-ta-contract-label">Contract Recommendation (Optional)</span>
                <span className="ecews-ta-contract-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isContractOpen && (
                <>
                  <p className="ecews-ta-contract-helper">
                    Use this option only if performance or contract status requires HR review.
                  </p>

                  <div className="ecews-ta-contract-options">
                    <label className="ecews-ta-radio-row">
                      <input
                        type="radio"
                        name="ecews-contract-recommendation"
                        checked={contractRecommendation === 'Renewal'}
                        onChange={() => setContractRecommendation('Renewal')}
                      />
                      <span className="ecews-ta-radio-label">Advice Renewal</span>
                    </label>
                    <label className="ecews-ta-radio-row">
                      <input
                        type="radio"
                        name="ecews-contract-recommendation"
                        checked={contractRecommendation === 'PIP'}
                        onChange={() => setContractRecommendation('PIP')}
                      />
                      <span className="ecews-ta-radio-label">Advice PIP</span>
                    </label>
                    <label className="ecews-ta-radio-row">
                      <input
                        type="radio"
                        name="ecews-contract-recommendation"
                        checked={contractRecommendation === 'Termination'}
                        onChange={() => setContractRecommendation('Termination')}
                      />
                      <span className="ecews-ta-radio-label">Advice Termination</span>
                    </label>
                  </div>

                  <textarea
                    className="ecews-ta-textarea ecews-ta-contract-textarea"
                    rows={3}
                    placeholder="Provide reason"
                    value={contractReason}
                    onChange={(e) => setContractReason(e.target.value)}
                  />
                </>
              )}
            </div>

            <div className="ecews-ta-modal-footer">
              <AppButton
                type="button"
                className="ecews-ta-modal-btn ecews-ta-modal-cancel"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="ecews-ta-modal-btn ecews-ta-modal-confirm"
                onClick={handleConfirmApprove}
                disabled={submitting}
              >
                {submitting ? 'Confirming...' : 'Confirm'}
              </AppButton>
            </div>
          </div>
        </div>
      )}
      {isDeclineOpen && (
        <div className="ecews-ta-modal-overlay" onClick={closeDeclineModal}>
          <div
            className={`ecews-ta-decline-modal ${isDeclineClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ecews-ta-decline-header">
              <h3 className="ecews-ta-decline-title">Return Timesheet with Feedback</h3>
              <button type="button" className="ecews-ta-decline-close" onClick={closeDeclineModal}>
                ✕
              </button>
            </div>
            <div className="ecews-ta-decline-body">
              <p className="ecews-ta-decline-text">
                Provide feedback to help the staff member correct their timesheet.
              </p>
              <label className="ecews-ta-decline-label">
                Feedback<span className="ecews-ta-decline-required">*</span>
              </label>
              <textarea
                className="ecews-ta-decline-textarea"
                rows={4}
                placeholder="Explain what needs to be corrected..."
                value={declineFeedback}
                onChange={(e) => setDeclineFeedback(e.target.value)}
              />
            </div>
            <div className="ecews-ta-decline-footer">
              <AppButton type="button" className="ecews-ta-decline-btn-cancel" onClick={closeDeclineModal}>
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="ecews-ta-decline-btn-send"
                onClick={handleSendFeedback}
                disabled={submitting || !declineFeedback.trim()}
              >
                {submitting ? 'Sending...' : 'Send Feedback'}
              </AppButton>
            </div>
          </div>
        </div>
      )}
      {isSuccessOpen && (
        <div className="ecews-ta-modal-overlay" onClick={closeSuccessModal}>
          <div
            className={`ecews-ta-success-modal ${isSuccessClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="ecews-ta-success-close" onClick={closeSuccessModal}>
              ✕
            </button>
            <div className="ecews-ta-success-body">
              <h3 className="ecews-ta-success-title">Done!</h3>
              <p className="ecews-ta-success-message">
                {successMessage || 'Timesheet has been successfully approved'}
              </p>
              <div className="ecews-ta-success-footer">
                <AppButton type="button" className="ecews-ta-success-ok-btn" onClick={closeSuccessModal}>
                  Okay
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EcewsTimesheetApproval
