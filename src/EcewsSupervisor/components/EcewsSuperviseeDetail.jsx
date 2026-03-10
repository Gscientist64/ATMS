import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './EcewsSuperviseeDetail.css'
import AppButton from '../../shared/AppButton'

const EcewsSuperviseeDetail = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false)
  const [isAdvisoryClosing, setIsAdvisoryClosing] = useState(false)
  const [isAdvSuccessOpen, setIsAdvSuccessOpen] = useState(false)
  const [isAdvSuccessClosing, setIsAdvSuccessClosing] = useState(false)

  return (
    <div className="ecews-sd-page" data-supervisee-id={id}>
      <div className="ecews-sd-header">
        <Link to="/ecews-supervisor/supervisees" className="ecews-sd-back-link">
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
        <h1 className="ecews-sd-title">John Adeyemi</h1>
      </div>

      <div className="ecews-sd-tabs">
        <button
          type="button"
          className={`ecews-sd-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`ecews-sd-tab ${activeTab === 'concerns' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerns')}
        >
          GON Concerns
          <span className="ecews-sd-tab-badge">1</span>
        </button>
        <button
          type="button"
          className={`ecews-sd-tab ${activeTab === 'advisories' ? 'active' : ''}`}
          onClick={() => setActiveTab('advisories')}
        >
          Advisories &amp; Actions
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="ecews-sd-card">
          <div className="ecews-sd-card-header">
            <h2 className="ecews-sd-card-title">Staff Information</h2>
          </div>
          <div className="ecews-sd-info-grid">
            <div className="ecews-sd-info-row">
              <div className="ecews-sd-info-item">
                <span className="ecews-sd-info-label">Full Name</span>
                <span className="ecews-sd-info-value ecews-sd-info-strong">John Adeyemi</span>
              </div>
              <div className="ecews-sd-info-item">
                <span className="ecews-sd-info-label">Department</span>
                <span className="ecews-sd-info-value">Field Operations</span>
              </div>
              <div className="ecews-sd-info-item">
                <span className="ecews-sd-info-label">Location</span>
                <span className="ecews-sd-info-value">Lagos State</span>
              </div>
            </div>

            <div className="ecews-sd-divider" />

            <div className="ecews-sd-info-row">
              <div className="ecews-sd-info-item">
                <span className="ecews-sd-info-label">Contract Status</span>
                <span className="ecews-sd-status-pill ecews-sd-status-active">Active</span>
              </div>
              <div className="ecews-sd-info-item">
                <span className="ecews-sd-info-label">Bank Name</span>
                <span className="ecews-sd-info-value ecews-sd-info-strong">First Bank</span>
              </div>
              <div className="ecews-sd-info-item">
                <span className="ecews-sd-info-label">Account Number</span>
                <span className="ecews-sd-info-value ecews-sd-info-strong">1234567890</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'concerns' && (
        <div className="ecews-sd-gon-concerns">
          <div className="ecews-sd-gon-header">
            <h2 className="ecews-sd-gon-title">GON Supervisor Concerns</h2>
          </div>

          <div className="ecews-sd-gon-card">
            <div className="ecews-sd-gon-card-inner">
              <div className="ecews-sd-gon-main">
                <div className="ecews-sd-gon-user-block">
                  <div className="ecews-sd-gon-avatar">AM</div>
                  <div className="ecews-sd-gon-user-info">
                    <div className="ecews-sd-gon-name">Amina Mohammed</div>
                    <div className="ecews-sd-gon-role">GON Supervisor</div>
                  </div>
                </div>
                <p className="ecews-sd-gon-text">
                  I would like to raise a concern regarding the staff member&apos;s recent performance. There have
                  been recurring issues with meeting deadlines and maintaining expected quality standards. I recommend
                  a review to assess performance expectations and provide necessary support for improvement.
                </p>
              </div>
              <div className="ecews-sd-gon-date">28-02-2026 10:30</div>
            </div>

            <div className="ecews-sd-gon-meta">
              <div className="ecews-sd-gon-meta-group">
                <span className="ecews-sd-gon-meta-label">Severity:</span>
                <span className="ecews-sd-gon-pill ecews-sd-gon-pill-high">High</span>
              </div>
              <div className="ecews-sd-gon-meta-group">
                <span className="ecews-sd-gon-meta-label">Type:</span>
                <span className="ecews-sd-gon-pill ecews-sd-gon-pill-type">Incomplete work</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advisories' && (
        <div className="ecews-sd-adv-section">
          <div className="ecews-sd-adv-header">
            <h2 className="ecews-sd-adv-title">Advisory History</h2>
            <AppButton
              type="button"
              className="ecews-sd-adv-btn"
              onClick={() => {
                setIsAdvisoryClosing(false)
                setIsAdvisoryOpen(true)
              }}
            >
              Send Advisory
            </AppButton>
          </div>

          <div className="ecews-sd-gon-card">
            <div className="ecews-sd-gon-card-inner">
              <div className="ecews-sd-gon-main">
                <div className="ecews-sd-gon-user-block">
                  <div className="ecews-sd-gon-avatar">MB</div>
                  <div className="ecews-sd-gon-user-info">
                    <div className="ecews-sd-gon-name">Mike Bolaji</div>
                    <div className="ecews-sd-gon-role">ECEWS Supervisor</div>
                  </div>
                </div>
                <p className="ecews-sd-gon-text">
                  I would like to raise a concern regarding the staff member&apos;s recent performance. There have
                  been recurring issues with meeting deadlines and maintaining expected quality standards. I recommend
                  a review to assess performance expectations and provide necessary support for improvement.
                </p>
              </div>
              <div className="ecews-sd-gon-date">28-02-2026 10:30</div>
            </div>

            <div className="ecews-sd-gon-meta">
              <div className="ecews-sd-gon-meta-group">
                <span className="ecews-sd-gon-meta-label">Severity:</span>
                <span className="ecews-sd-gon-pill ecews-sd-gon-pill-high">High</span>
              </div>
              <div className="ecews-sd-gon-meta-group">
                <span className="ecews-sd-gon-meta-label">Type:</span>
                <span className="ecews-sd-gon-pill ecews-sd-gon-pill-type">Incomplete work</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {isAdvisoryOpen && (
        <div
          className="ecews-sd-modal-overlay"
          onClick={() => {
            if (!isAdvisoryClosing) {
              setIsAdvisoryClosing(true)
              setTimeout(() => {
                setIsAdvisoryOpen(false)
                setIsAdvisoryClosing(false)
              }, 350)
            }
          }}
        >
          <div
            className={`ecews-sd-modal ${isAdvisoryClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ecews-sd-modal-header">
              <h3 className="ecews-sd-modal-title">Send Advisory to Programs Team</h3>
              <button
                type="button"
                className="ecews-sd-modal-close"
                onClick={() => {
                  if (!isAdvisoryClosing) {
                    setIsAdvisoryClosing(true)
                    setTimeout(() => {
                      setIsAdvisoryOpen(false)
                      setIsAdvisoryClosing(false)
                    }, 350)
                  }
                }}
              >
                ✕
              </button>
            </div>

            <div className="ecews-sd-modal-body">
              <div className="ecews-sd-modal-section">
                <div className="ecews-sd-modal-section-label">Advisory Type</div>
                <div className="ecews-sd-modal-radio-group">
                  <label className="ecews-sd-modal-radio-row">
                    <input type="radio" name="ecews-adv-type" />
                    <span className="ecews-sd-modal-radio-label">Advice Renewal</span>
                  </label>
                  <label className="ecews-sd-modal-radio-row">
                    <input type="radio" name="ecews-adv-type" />
                    <span className="ecews-sd-modal-radio-label">Advice PIP</span>
                  </label>
                  <label className="ecews-sd-modal-radio-row">
                    <input type="radio" name="ecews-adv-type" />
                    <span className="ecews-sd-modal-radio-label">Advice Termination</span>
                  </label>
                  <label className="ecews-sd-modal-radio-row">
                    <input type="radio" name="ecews-adv-type" />
                    <span className="ecews-sd-modal-radio-label">Other Issue</span>
                  </label>
                </div>
              </div>

              <div className="ecews-sd-modal-section">
                <div className="ecews-sd-modal-section-label">Justification</div>
                <textarea
                  className="ecews-sd-modal-textarea"
                  rows={4}
                  placeholder="Provide reason"
                />
              </div>
            </div>

            <div className="ecews-sd-modal-footer">
              <AppButton
                type="button"
                className="ecews-sd-modal-btn ecews-sd-modal-cancel"
                onClick={() => {
                  if (!isAdvisoryClosing) {
                    setIsAdvisoryClosing(true)
                    setTimeout(() => {
                      setIsAdvisoryOpen(false)
                      setIsAdvisoryClosing(false)
                    }, 350)
                  }
                }}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="ecews-sd-modal-btn ecews-sd-modal-submit"
                onClick={() => {
                  if (!isAdvisoryClosing) {
                    setIsAdvisoryClosing(true)
                    setTimeout(() => {
                      setIsAdvisoryOpen(false)
                      setIsAdvisoryClosing(false)
                      setIsAdvSuccessClosing(false)
                      setIsAdvSuccessOpen(true)
                    }, 350)
                  }
                }}
              >
                Submit Advisory
              </AppButton>
            </div>
          </div>
        </div>
      )}
      {isAdvSuccessOpen && (
        <div
          className="ecews-sd-modal-overlay"
          onClick={() => {
            if (!isAdvSuccessClosing) {
              setIsAdvSuccessClosing(true)
              setTimeout(() => {
                setIsAdvSuccessOpen(false)
                setIsAdvSuccessClosing(false)
              }, 350)
            }
          }}
        >
          <div
            className={`ecews-sd-success-modal ${isAdvSuccessClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ecews-sd-success-close"
              onClick={() => {
                if (!isAdvSuccessClosing) {
                  setIsAdvSuccessClosing(true)
                  setTimeout(() => {
                    setIsAdvSuccessOpen(false)
                    setIsAdvSuccessClosing(false)
                  }, 350)
                }
              }}
            >
              ✕
            </button>
            <div className="ecews-sd-success-body">
              <h3 className="ecews-sd-success-title">Done!</h3>
              <p className="ecews-sd-success-message">
                Your advisory has been successfully sent
              </p>
              <div className="ecews-sd-success-footer">
                <AppButton
                  type="button"
                  className="ecews-sd-success-ok-btn"
                  onClick={() => {
                    if (!isAdvSuccessClosing) {
                      setIsAdvSuccessClosing(true)
                      setTimeout(() => {
                        setIsAdvSuccessOpen(false)
                        setIsAdvSuccessClosing(false)
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

export default EcewsSuperviseeDetail

