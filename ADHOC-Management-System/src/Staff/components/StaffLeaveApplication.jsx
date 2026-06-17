import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import AnimatedCheckmark from '../../shared/AnimatedCheckmark'
import { staffService } from '../../services/api'
import './StaffLeaveApplication.css'

const SUCCESS_MODAL_ANIMATION_MS = 500

const LEAVE_TYPE_OPTIONS = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'examination', label: 'Examination Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
  { value: 'compassionate', label: 'Compassionate/Casual Leave' },
]

const LEAVE_BALANCE_CATEGORIES = [
  { id: 'annual', label: 'Annual (Accrued)' },
  { id: 'sick', label: 'Sick' },
  { id: 'paternity', label: 'Paternity' },
  { id: 'examination', label: 'Examination' },
  { id: 'maternity', label: 'Maternity' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'compassionate', label: 'Compassionate/Casual' },
]

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="4" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 7h13" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 2.5v3M12 2.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function SidebarCalendarIcon() {
  return (
    <span className="staff-leave-app-sidebar-calendar" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="8" width="28" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M6 16H34" stroke="currentColor" strokeWidth="2" />
        <path d="M14 5V11M26 5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

const StaffLeaveApplicationSuccessModal = ({ isOpen, isVisible, onClose, onOkay }) => {
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
    <div
      className={`staff-leave-app-success-layer ${isVisible ? 'is-visible' : ''}`.trim()}
      role="presentation"
    >
      <div className="staff-leave-app-success-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`staff-leave-app-success-dialog ${isVisible ? 'is-visible' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-leave-app-success-title"
        onClick={(event) => event.stopPropagation()}
      >
        <AppButton
          type="button"
          className="staff-leave-app-success-close"
          aria-label="Close success message"
          onClick={onClose}
        >
          ×
        </AppButton>

        <div className="staff-leave-app-success-icon" aria-hidden="true">
          <AnimatedCheckmark size={80} strokeWidth={10} loop duration={2.2} />
        </div>

        <h2 id="staff-leave-app-success-title" className="staff-leave-app-success-title">
          Success!
        </h2>

        <p className="staff-leave-app-success-message">
          Your leave request has been submitted and your supervisor has been notified for review.
        </p>

        <AppButton type="button" className="staff-leave-app-success-okay-btn" onClick={onOkay}>
          Okay
        </AppButton>
      </div>
    </div>,
    document.body,
  )
}

const StaffLeaveApplication = () => {
  const navigate = useNavigate()
  const startDateRef = useRef(null)
  const endDateRef = useRef(null)

  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [contactPhone, setContactPhone] = useState('')
  const [backStopName, setBackStopName] = useState('')
  const [unitHeadName, setUnitHeadName] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)
  const [successVisible, setSuccessVisible] = useState(false)

  useEffect(() => {
    if (!successOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSuccessVisible(true))
    })

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
    }
  }, [successOpen])

  useEffect(() => {
    if (!successOpen) {
      setSuccessVisible(false)
    }
  }, [successOpen])

  const handleCancel = () => {
    navigate('/staff/leave')
  }

  const dismissSuccess = () => {
    setSuccessVisible(false)
    window.setTimeout(() => {
      setSuccessOpen(false)
      navigate('/staff/leave')
    }, SUCCESS_MODAL_ANIMATION_MS)
  }

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate) return
    try {
      await staffService.applyForLeave({
        leaveType,
        fromDate: startDate.toISOString(),
        toDate: endDate.toISOString(),
        reason: reason || null,
      })
      setSuccessOpen(true)
    } catch (err) {
      console.error('Error submitting leave:', err)
    }
  }

  return (
    <div className="staff-leave-app-page">
      <header className="staff-leave-app-header">
        <div className="staff-leave-app-header-text">
          <h1 className="staff-leave-app-title">Leave Application</h1>
          <p className="staff-leave-app-subtitle">Submit a new leave request for approval</p>
        </div>
        <AppButton type="button" className="staff-leave-app-cancel-btn" onClick={handleCancel}>
          Cancel
        </AppButton>
      </header>

      <div className="staff-leave-app-layout">
        <section className="staff-leave-app-form-card">
          <div className="staff-leave-app-field">
            <span className="staff-leave-app-label">Type of Leave</span>
            <AppDropdown
              value={leaveType}
              onChange={setLeaveType}
              options={LEAVE_TYPE_OPTIONS}
              placeholder="Your state of origin"
              className="staff-leave-app-dropdown"
              buttonClassName="staff-leave-app-dropdown-btn"
            />
          </div>

          <div className="staff-leave-app-row staff-leave-app-row--2">
            <label className="staff-leave-app-field">
              <span className="staff-leave-app-label">Start Date</span>
              <div className="staff-leave-app-date-wrap">
                <DatePicker
                  ref={startDateRef}
                  selected={startDate}
                  onChange={setStartDate}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="staff-leave-app-input staff-leave-app-input--date"
                  popperPlacement="bottom-start"
                  showPopperArrow={false}
                />
                <AppButton
                  type="button"
                  className="staff-leave-app-date-icon-btn"
                  onClick={() => startDateRef.current?.setOpen(true)}
                  aria-label="Open start date calendar"
                >
                  <span className="staff-leave-app-date-icon" aria-hidden="true">
                    <IconCalendar />
                  </span>
                </AppButton>
              </div>
            </label>

            <label className="staff-leave-app-field">
              <span className="staff-leave-app-label">End Date</span>
              <div className="staff-leave-app-date-wrap">
                <DatePicker
                  ref={endDateRef}
                  selected={endDate}
                  onChange={setEndDate}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="staff-leave-app-input staff-leave-app-input--date"
                  popperPlacement="bottom-start"
                  showPopperArrow={false}
                  minDate={startDate || undefined}
                />
                <AppButton
                  type="button"
                  className="staff-leave-app-date-icon-btn"
                  onClick={() => endDateRef.current?.setOpen(true)}
                  aria-label="Open end date calendar"
                >
                  <span className="staff-leave-app-date-icon" aria-hidden="true">
                    <IconCalendar />
                  </span>
                </AppButton>
              </div>
            </label>
          </div>

          <label className="staff-leave-app-field">
            <span className="staff-leave-app-label">Contact Person or Next of Kin Phone Number</span>
            <input
              className="staff-leave-app-input"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +234 803 **** ***"
            />
          </label>

          <div className="staff-leave-app-row staff-leave-app-row--2">
            <label className="staff-leave-app-field">
              <span className="staff-leave-app-label">Select Back Stop</span>
              <input
                className="staff-leave-app-input"
                type="text"
                value={backStopName}
                onChange={(e) => setBackStopName(e.target.value)}
                placeholder="Enter Backstop Name"
              />
            </label>
            <label className="staff-leave-app-field">
              <span className="staff-leave-app-label">Back-Stop Code (Auto filled)</span>
              <input
                className="staff-leave-app-input staff-leave-app-input--readonly"
                type="text"
                value="000000"
                readOnly
                tabIndex={-1}
                aria-readonly="true"
              />
            </label>
          </div>

          <div className="staff-leave-app-row staff-leave-app-row--2">
            <label className="staff-leave-app-field">
              <span className="staff-leave-app-label">Department/Unit Head</span>
              <input
                className="staff-leave-app-input"
                type="text"
                value={unitHeadName}
                onChange={(e) => setUnitHeadName(e.target.value)}
                placeholder="Enter Department/Unit Head Name"
              />
            </label>
            <label className="staff-leave-app-field">
              <span className="staff-leave-app-label">Department/Unit Head Code (Auto filled)</span>
              <input
                className="staff-leave-app-input staff-leave-app-input--readonly"
                type="text"
                value="000000"
                readOnly
                tabIndex={-1}
                aria-readonly="true"
              />
            </label>
          </div>

          <div className="staff-leave-app-form-footer">
            <AppButton type="button" className="staff-leave-app-submit-btn" onClick={handleSubmit}>
              Submit
            </AppButton>
          </div>
        </section>

        <aside className="staff-leave-app-sidebar">
          <div className="staff-leave-app-sidebar-head">
            <h2 className="staff-leave-app-sidebar-title">Leave Balance</h2>
            <SidebarCalendarIcon />
          </div>

          <ul className="staff-leave-app-balance-list">
            {LEAVE_BALANCE_CATEGORIES.map((category, index) => (
              <li
                key={category.id}
                className={`staff-leave-app-balance-item${index > 0 ? ' staff-leave-app-balance-item--bordered' : ''}`}
              >
                <h3 className="staff-leave-app-balance-category">{category.label}</h3>
                <div className="staff-leave-app-balance-metrics">
                  <div className="staff-leave-app-balance-metric">
                    <span className="staff-leave-app-balance-metric-value">0</span>
                    <span className="staff-leave-app-balance-metric-label">Available Days</span>
                  </div>
                  <div className="staff-leave-app-balance-metric">
                    <span className="staff-leave-app-balance-metric-value">0</span>
                    <span className="staff-leave-app-balance-metric-label">Taken</span>
                  </div>
                  <div className="staff-leave-app-balance-metric">
                    <span className="staff-leave-app-balance-metric-value">0</span>
                    <span className="staff-leave-app-balance-metric-label">Balance</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <StaffLeaveApplicationSuccessModal
        isOpen={successOpen}
        isVisible={successVisible}
        onClose={dismissSuccess}
        onOkay={dismissSuccess}
      />
    </div>
  )
}

export default StaffLeaveApplication
