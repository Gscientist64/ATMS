import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './TimesheetReviewDetail.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { gonSupervisorService } from '../../services/api'
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

const ApprovalAction = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [timesheet, setTimesheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [flagConcern, setFlagConcern] = useState(false)
  const [concernDescription, setConcernDescription] = useState('')
  const [declineFeedback, setDeclineFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleConfirmApprove = async () => {
    try {
      setSubmitting(true)
      await gonSupervisorService.approveTimesheet(id, {
        flagConcern,
        concernDescription: flagConcern ? concernDescription : null,
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

  const handleSendFeedback = async () => {
    if (!declineFeedback.trim()) return
    try {
      setSubmitting(true)
      await gonSupervisorService.declineTimesheet(id, declineFeedback)
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
        <AppButton onClick={() => navigate('/gon-supervisor/timesheet-review')}>
          Back to Review
        </AppButton>
      </div>
    )
  }

  if (!timesheet) return null

  const isPending = timesheet.status === 'Facility Supervisor Review'

  return (
    <div className="gon-tsd-page">
      <div className="gon-tsd-header">
        <div className="gon-tsd-header-left">
          <Link to="/gon-supervisor" className="gon-tsd-back-link">
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

        <div className="gon-tsd-card gon-tsd-approval-card">
          <div className="gon-tsd-card-header">
            <h3 className="gon-tsd-card-title">Approval actions</h3>
          </div>
          {isPending ? (
            <div className="gon-aa-approval-actions">
              <AppButton
                type="button"
                className="gon-aa-approve-btn"
                onClick={() => setIsConfirmOpen(true)}
              >
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
              <AppButton
                type="button"
                className="gon-aa-decline-btn"
                onClick={() => setIsDeclineOpen(true)}
              >
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
                {timesheet.status === 'Rejected' ? 'Returned for Correction' : timesheet.status}
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
        <div className="gon-tsd-table-wrap">
          <AppTable columns={entriesColumns} data={timesheet.entries || []} tableClassName="gon-tsd-table" />
          <div className="gon-tsd-total-row">
            <span className="gon-tsd-total-label">Total Hours this month:</span>
            <span className="gon-tsd-total-value">{timesheet.totalHours} hours</span>
          </div>
        </div>
      </div>

      {isConfirmOpen && (
        <div className="gon-aa-modal-overlay" onClick={() => setIsConfirmOpen(false)}>
          <div className="gon-aa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gon-aa-modal-header">
              <h3 className="gon-aa-modal-title">Confirm Approval</h3>
              <button
                type="button"
                className="gon-aa-modal-close"
                onClick={() => setIsConfirmOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="gon-aa-modal-body">
              <p className="gon-aa-modal-text">
                You are about to approve this timesheet.
                <br />
                If you have any concerns, please enable the &quot;Flag Concern&quot; toggle below and
                provide the necessary details before proceeding.
              </p>
              <div className="gon-aa-flag-row">
                <button
                  type="button"
                  className={`gon-aa-toggle ${flagConcern ? 'on' : ''}`}
                  onClick={() => setFlagConcern((prev) => !prev)}
                >
                  <span className="gon-aa-toggle-knob" />
                </button>
                <span className="gon-aa-flag-label">Flag Concern</span>
              </div>
              {flagConcern && (
                <textarea
                  className="gon-aa-textarea"
                  rows={4}
                  placeholder="State your concern"
                  value={concernDescription}
                  onChange={(e) => setConcernDescription(e.target.value)}
                />
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
            <button
              type="button"
              className="gon-aa-success-close"
              onClick={() => setIsSuccessOpen(false)}
            >
              ✕
            </button>
            <div className="gon-aa-success-body">
              <h3 className="gon-aa-success-title">Done!</h3>
              <p className="gon-aa-success-message">
                {successMessage || 'Timesheet has been successfully approved'}
              </p>
              <div className="gon-aa-success-footer">
                <AppButton
                  type="button"
                  className="gon-aa-success-ok-btn"
                  onClick={() => setIsSuccessOpen(false)}
                >
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
              <button
                type="button"
                className="gon-aa-decline-close"
                onClick={() => setIsDeclineOpen(false)}
              >
                ✕
              </button>
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
              <AppButton
                type="button"
                className="gon-aa-decline-btn-cancel"
                onClick={() => setIsDeclineOpen(false)}
              >
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

export default ApprovalAction
