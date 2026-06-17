import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import { staffService } from '../../services/api'
import './StaffDashboard.css'

function IconCalendar({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconClock({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconDocument({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M16 4v4h4M10 13h8M10 17h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

const StaffWelcomeModal = ({ isOpen, onClose, onProceed, userName = 'Mike' }) => {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="staff-welcome-modal-layer" role="presentation">
      <div className="staff-welcome-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="staff-welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-welcome-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="staff-welcome-modal-header">
          <div className="staff-welcome-modal-header-main">
            <span className="staff-welcome-modal-wave" aria-hidden="true">
              👋
            </span>
            <div className="staff-welcome-modal-headings">
              <h2 id="staff-welcome-modal-title" className="staff-welcome-modal-title">
                Welcome to ECEWS HRIS
              </h2>
              <p className="staff-welcome-modal-subtitle">Good to have you here, {userName}!</p>
            </div>
          </div>
          <AppButton
            type="button"
            className="staff-welcome-modal-close"
            aria-label="Close welcome message"
            onClick={onClose}
          >
            ×
          </AppButton>
        </div>

        <div className="staff-welcome-modal-body">
          <div className="staff-welcome-modal-info-heading">
            <span className="staff-welcome-modal-info-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="10" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </span>
            <span className="staff-welcome-modal-info-title">Important Information</span>
          </div>

          <p className="staff-welcome-modal-intro">
            Welcome to the Employee Time Management System (ETMS), your platform for managing
            timesheets, leave requests, and other work-related activities.
          </p>

          <div className="staff-welcome-modal-highlight">
            As part of your onboarding, you are required to complete the Staff Onboarding Form and
            upload the documents requested by the Human Resources (HR) team. The form can be saved
            and continued within <strong>7 days</strong>, allowing you to pause and return later if
            needed while still having access to the platform.
          </div>

          <p className="staff-welcome-modal-note">
            <strong>Note:</strong> Please ensure that all information provided is accurate and
            complete, as it will be used for your official employee records.
          </p>
        </div>

        <div className="staff-welcome-modal-footer">
          <AppButton type="button" className="staff-welcome-modal-proceed" onClick={onProceed}>
            Got it, let&apos;s proceed!
          </AppButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const StaffDashboard = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [onboardingStatus, setOnboardingStatus] = useState(null)
  const [alertVisible, setAlertVisible] = useState(true)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, onboardingData] = await Promise.all([
          staffService.getProfile(),
          staffService.getOnboardingStatus().catch(() => null)
        ])
        setProfile(profileData)
        setOnboardingStatus(onboardingData)
        // Show welcome modal if onboarding not started
        if (!onboardingData || onboardingData.status === 'NotStarted') {
          setIsWelcomeOpen(true)
        }
      } catch (err) {
        console.error('Error fetching staff data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleWelcomeProceed = () => {
    setIsWelcomeOpen(false)
    navigate('/staff/onboarding')
  }

  const formatDate = () => {
    const date = new Date()
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const userName = profile?.fullName?.split(' ')[0] || 'Staff'

  if (loading) return <div className="staff-dashboard">Loading...</div>

  return (
    <>
      <StaffWelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onProceed={handleWelcomeProceed}
        userName={userName}
      />

      <div className="staff-dashboard">
      <div className="staff-welcome">
        <h1 className="staff-welcome-title">Welcome back, {userName}</h1>
        <p className="staff-welcome-date">{formatDate()}</p>
      </div>

      {alertVisible && (
        <div className="staff-alert staff-alert--info">
          <div className="staff-alert-content">
            <div className="staff-alert-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                <path
                  d="M10 6V10M10 14H10.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="staff-alert-text">
              <div className="staff-alert-title">Timesheet Submission!</div>
              <p className="staff-alert-message">
                Reminder! All timesheets must be submitted on time. Late
                submission may delay payroll processing.
              </p>
            </div>
          </div>
          <AppButton
            type="button"
            className="staff-alert-close"
            onClick={() => setAlertVisible(false)}
            aria-label="Close alert"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </AppButton>
        </div>
      )}

      <div className="staff-onboarding-banner">
        <div className="staff-onboarding-left">
          <span className="staff-onboarding-icon" aria-hidden="true">
            <IconDocument />
          </span>
          <span className="staff-onboarding-label">Complete onboarding requirements</span>
        </div>
        <div className="staff-onboarding-actions">
          <div className="staff-onboarding-progress" aria-label="Onboarding progress 12%">
            <svg className="staff-onboarding-progress-ring" viewBox="0 0 36 36" aria-hidden="true">
              <circle className="staff-onboarding-progress-bg" cx="18" cy="18" r="15.5" />
              <circle className="staff-onboarding-progress-fill" cx="18" cy="18" r="15.5" />
            </svg>
            <span className="staff-onboarding-progress-text">12%</span>
          </div>
          <AppButton
            type="button"
            className="staff-onboarding-btn"
            onClick={() => navigate('/staff/onboarding', { state: { openWizard: true } })}
          >
            Continue Onboarding
          </AppButton>
        </div>
      </div>

      <div className="staff-tracking-card">
        <div className="staff-tracking-main">
          <span className="staff-tracking-icon" aria-hidden="true">
            <IconCalendar className="staff-tracking-icon-svg" />
          </span>
          <div className="staff-tracking-text">
            <div className="staff-tracking-label">Timesheet Tracking</div>
            <div className="staff-tracking-month">February 2026</div>
            <span className="staff-status-badge staff-status-badge--muted">Closed for submission</span>
          </div>
        </div>
        <AppButton type="button" className="staff-submit-btn" disabled>
          Submit Timesheet
        </AppButton>
      </div>

      <section className="staff-work-status">
        <h2 className="staff-work-status-title">My Work Status</h2>
        <div className="staff-work-status-grid">
          <article className="staff-status-card">
            <div className="staff-status-card-top">
              <div className="staff-status-card-heading">
                <div className="staff-status-card-label">Timesheet</div>
                <div className="staff-status-card-sub">February 2026</div>
                <span className="staff-status-badge staff-status-badge--pending">Pending</span>
              </div>
              <span className="staff-status-card-icon staff-status-card-icon--clock" aria-hidden="true">
                <IconClock />
              </span>
            </div>
            <div className="staff-status-card-footer">
              Total payable hours: <strong>176</strong>
            </div>
          </article>

          <article className="staff-status-card">
            <div className="staff-status-card-top">
              <div className="staff-status-card-heading">
                <div className="staff-status-card-label">Leave Balance</div>
                <div className="staff-status-card-sub">2026 Allocation</div>
              </div>
              <span className="staff-status-card-icon staff-status-card-icon--calendar" aria-hidden="true">
                <IconCalendar />
              </span>
            </div>
            <div className="staff-leave-stats">
              <div className="staff-leave-stat">
                <div className="staff-leave-stat-value">18</div>
                <div className="staff-leave-stat-label">Remaining</div>
              </div>
              <div className="staff-leave-stat">
                <div className="staff-leave-stat-value">7</div>
                <div className="staff-leave-stat-label">Taken</div>
              </div>
              <div className="staff-leave-stat">
                <div className="staff-leave-stat-value">25</div>
                <div className="staff-leave-stat-label">Total</div>
              </div>
            </div>
          </article>
        </div>
      </section>
      </div>
    </>
  )
}

export default StaffDashboard
