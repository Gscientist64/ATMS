import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './EcewsTimesheetApproval.css'
import AppButton from '../../shared/AppButton'

const EcewsTimesheetApproval = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('details')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isContractOpen, setIsContractOpen] = useState(false)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [isDeclineClosing, setIsDeclineClosing] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSuccessClosing, setIsSuccessClosing] = useState(false)

  const entries = [
    {
      date: '28-02-2026',
      startTime: '08:00',
      endTime: '05:00',
      totalHours: '9 hrs',
      workDone: 'Community sensitization on health programs',
    },
    {
      date: '28-02-2026',
      startTime: '08:00',
      endTime: '05:00',
      totalHours: '9 hrs',
      workDone: 'Data collection in Ikeja area',
    },
    {
      date: '28-02-2026',
      startTime: '08:00',
      endTime: '05:00',
      totalHours: '9 hrs',
      workDone: 'Follow-up visits to beneficiaries',
    },
  ]

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
          <h1 className="ecews-ta-title">Timesheet - January 2026</h1>
          <p className="ecews-ta-user">John Adeyemi</p>
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
                <span className="ecews-ta-info-value">John Adeyemi</span>
              </div>
              <div className="ecews-ta-info-item ecews-ta-info-status">
                <span className="ecews-ta-info-label">GON Status</span>
                <div className="ecews-ta-status-pills">
                  <span className="ecews-ta-status-pill ecews-ta-status-approved">Approved</span>
                  <span className="ecews-ta-status-pill ecews-ta-status-flagged">Flagged</span>
                </div>
              </div>
            </div>
            <div className="ecews-ta-staff-col">
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Department</span>
                <span className="ecews-ta-info-value">Field Operations</span>
              </div>
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Bank Name</span>
                <span className="ecews-ta-info-value">First Bank</span>
              </div>
            </div>
            <div className="ecews-ta-staff-col">
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Location</span>
                <span className="ecews-ta-info-value">Lagos State</span>
              </div>
              <div className="ecews-ta-info-item">
                <span className="ecews-ta-info-label">Account Number</span>
                <span className="ecews-ta-info-value ecews-ta-info-strong">1234567890</span>
              </div>
            </div>
          </div>
        </div>

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
      </div>

      <div className="ecews-ta-summary-bar">
        <span className="ecews-ta-summary-month">February 2026</span>
        <span className="ecews-ta-summary-sep" />
        <span className="ecews-ta-summary-days">Total working days: 20</span>
        <span className="ecews-ta-summary-hours">160 Total Hours</span>
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
            <span className="ecews-ta-tab-badge">2</span>
          </button>
          <button
            type="button"
            className={`ecews-ta-tab ${activeTab === 'concerns' ? 'active' : ''}`}
            onClick={() => setActiveTab('concerns')}
          >
            Concerns
            <span className="ecews-ta-tab-badge">1</span>
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="ecews-ta-table-wrap">
            <table className="ecews-ta-table">
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
                    <td className="ecews-ta-hours-cell">{entry.totalHours}</td>
                    <td>{entry.workDone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ecews-ta-total-row">
              <span className="ecews-ta-total-label">Total Hours this month:</span>
              <span className="ecews-ta-total-value">27 hours</span>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="ecews-ta-comments-panel">
            <div className="ecews-ta-comment-card">
              <div className="ecews-ta-comment-header">
                <div className="ecews-ta-comment-user">
                  <div className="ecews-ta-comment-avatar">AM</div>
                  <div className="ecews-ta-comment-user-info">
                    <div className="ecews-ta-comment-name">Amina Mohammed</div>
                    <div className="ecews-ta-comment-role">GON Supervisor</div>
                  </div>
                </div>
                <div className="ecews-ta-comment-date">28-02-2026 10:30</div>
              </div>
              <div className="ecews-ta-comment-text">
                Please provide more details on the survey activities and include all working days.
                Only 1 day is listed for the entire month.
              </div>
            </div>

            <div className="ecews-ta-comment-card">
              <div className="ecews-ta-comment-header">
                <div className="ecews-ta-comment-user">
                  <div className="ecews-ta-comment-avatar">MB</div>
                  <div className="ecews-ta-comment-user-info">
                    <div className="ecews-ta-comment-name">Mike Bolaji</div>
                    <div className="ecews-ta-comment-role">ECEWS Supervisor</div>
                  </div>
                </div>
                <div className="ecews-ta-comment-date">28-02-2026 10:30</div>
              </div>
              <div className="ecews-ta-comment-text">
                Please provide more details on the survey activities and include all working days.
                Only 1 day is listed for the entire month.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'concerns' && (
          <div className="ecews-ta-concerns-panel">
            <div className="ecews-ta-concern-card">
              <div className="ecews-ta-concern-header">
                <div className="ecews-ta-concern-user">
                  <div className="ecews-ta-concern-avatar">AM</div>
                  <div className="ecews-ta-concern-user-info">
                    <div className="ecews-ta-concern-name">Amina Mohammed</div>
                    <div className="ecews-ta-concern-role">GON Supervisor</div>
                  </div>
                </div>
                <div className="ecews-ta-concern-date">28-02-2026 10:30</div>
              </div>

              <div className="ecews-ta-concern-text">
                I would like to raise a concern regarding the staff member&apos;s recent performance. There have been
                recurring issues with meeting deadlines and maintaining expected quality standards. I recommend a review
                to assess performance expectations and provide necessary support for improvement.
              </div>

              <div className="ecews-ta-concern-meta">
                <div className="ecews-ta-concern-meta-group">
                  <span className="ecews-ta-concern-meta-label">Severity:</span>
                  <span className="ecews-ta-concern-pill ecews-ta-concern-pill-high">High</span>
                </div>
                <div className="ecews-ta-concern-meta-group">
                  <span className="ecews-ta-concern-meta-label">Type:</span>
                  <span className="ecews-ta-concern-pill ecews-ta-concern-pill-type">Incomplete work</span>
                </div>
              </div>
            </div>
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
                      <input type="radio" name="ecews-contract-recommendation" />
                      <span className="ecews-ta-radio-label">Advice Renewal</span>
                    </label>
                    <label className="ecews-ta-radio-row">
                      <input type="radio" name="ecews-contract-recommendation" />
                      <span className="ecews-ta-radio-label">Advice PIP</span>
                    </label>
                    <label className="ecews-ta-radio-row">
                      <input type="radio" name="ecews-contract-recommendation" />
                      <span className="ecews-ta-radio-label">Advice Termination</span>
                    </label>
                  </div>

                  <textarea
                    className="ecews-ta-textarea ecews-ta-contract-textarea"
                    rows={3}
                    placeholder="Provide reason"
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
                onClick={() => {
                  setIsConfirmOpen(false)
                  setSuccessMessage('Timesheet has been successfully approved')
                  setIsSuccessOpen(true)
                }}
              >
                Confirm
              </AppButton>
            </div>
          </div>
        </div>
      )}
      {isDeclineOpen && (
        <div
          className="ecews-ta-modal-overlay"
          onClick={() => {
            if (!isDeclineClosing) {
              setIsDeclineClosing(true)
              setTimeout(() => {
                setIsDeclineOpen(false)
                setIsDeclineClosing(false)
              }, 350)
            }
          }}
        >
          <div
            className={`ecews-ta-decline-modal ${isDeclineClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ecews-ta-decline-header">
              <h3 className="ecews-ta-decline-title">Return Timesheet with Feedback</h3>
              <button
                type="button"
                className="ecews-ta-decline-close"
                onClick={() => {
                  if (!isDeclineClosing) {
                    setIsDeclineClosing(true)
                    setTimeout(() => {
                      setIsDeclineOpen(false)
                      setIsDeclineClosing(false)
                    }, 350)
                  }
                }}
              >
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
              />
            </div>
            <div className="ecews-ta-decline-footer">
              <AppButton
                type="button"
                className="ecews-ta-decline-btn-cancel"
                onClick={() => {
                  if (!isDeclineClosing) {
                    setIsDeclineClosing(true)
                    setTimeout(() => {
                      setIsDeclineOpen(false)
                      setIsDeclineClosing(false)
                    }, 350)
                  }
                }}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="ecews-ta-decline-btn-send"
                onClick={() => {
                  if (!isDeclineClosing) {
                    setIsDeclineClosing(true)
                    setTimeout(() => {
                      setIsDeclineOpen(false)
                      setIsDeclineClosing(false)
                      setSuccessMessage('Your feedback has been sent and staff notified.')
                      setIsSuccessOpen(true)
                    }, 350)
                  }
                }}
              >
                Send Feedback
              </AppButton>
            </div>
          </div>
        </div>
      )}
      {isSuccessOpen && (
        <div
          className="ecews-ta-modal-overlay"
          onClick={() => {
            if (!isSuccessClosing) {
              setIsSuccessClosing(true)
              setTimeout(() => {
                setIsSuccessOpen(false)
                setIsSuccessClosing(false)
              }, 350)
            }
          }}
        >
          <div
            className={`ecews-ta-success-modal ${isSuccessClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ecews-ta-success-close"
              onClick={() => {
                if (!isSuccessClosing) {
                  setIsSuccessClosing(true)
                  setTimeout(() => {
                    setIsSuccessOpen(false)
                    setIsSuccessClosing(false)
                  }, 350)
                }
              }}
            >
              ✕
            </button>
            <div className="ecews-ta-success-body">
              <h3 className="ecews-ta-success-title">Done!</h3>
              <p className="ecews-ta-success-message">
                {successMessage || 'Timesheet has been successfully approved'}
              </p>
              <div className="ecews-ta-success-footer">
                <AppButton
                  type="button"
                  className="ecews-ta-success-ok-btn"
                  onClick={() => {
                    if (!isSuccessClosing) {
                      setIsSuccessClosing(true)
                      setTimeout(() => {
                        setIsSuccessOpen(false)
                        setIsSuccessClosing(false)
                      }, 350)
                    }
                  }}
                >
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

