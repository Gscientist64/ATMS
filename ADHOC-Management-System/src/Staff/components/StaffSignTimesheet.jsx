import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AnimatedCheckmark from '../../shared/AnimatedCheckmark'
import './StaffSignTimesheet.css'

const TIMESHEET_MONTH = 'February'
const TIMESHEET_YEAR = '2026'
const WORKING_DAYS = 20
const CONFIRM_SHEET_ANIMATION_MS = 500

const DAYS_PER_WEEK = 7
const WEEKDAY_SLOTS = 5

const INITIAL_WEEKS = [
  {
    id: 'week-1',
    label: 'Week 1',
    days: [
      { id: 'w1-d1', date: '26-Jan', hours: '0' },
      { id: 'w1-d2', date: '27-Jan', hours: '0' },
      { id: 'w1-d3', date: '28-Jan', hours: '0' },
      { id: 'w1-d4', date: '29-Jan', hours: '0' },
      { id: 'w1-d5', date: '30-Jan', hours: '0' },
      { id: 'w1-d6', date: '31-Jan', hours: '0' },
      { id: 'w1-d7', date: '01-Jan', hours: '0' },
    ],
  },
  {
    id: 'week-2',
    label: 'Week 2',
    days: [
      { id: 'w2-d1', date: '02-Feb', hours: '0' },
      { id: 'w2-d2', date: '03-Feb', hours: '0' },
      { id: 'w2-d3', date: '04-Feb', hours: '0' },
      { id: 'w2-d4', date: '05-Feb', hours: '0' },
      { id: 'w2-d5', date: '06-Feb', hours: '0' },
      { id: 'w2-d6', date: '07-Feb', hours: '0' },
      { id: 'w2-d7', date: '08-Feb', hours: '0' },
    ],
  },
  {
    id: 'week-3',
    label: 'Week 3',
    days: [
      { id: 'w3-d1', date: '09-Feb', hours: '0' },
      { id: 'w3-d2', date: '10-Feb', hours: '0' },
      { id: 'w3-d3', date: '11-Feb', hours: '0' },
      { id: 'w3-d4', date: '12-Feb', hours: '0' },
      { id: 'w3-d5', date: '13-Feb', hours: '0' },
      { id: 'w3-d6', date: '14-Feb', hours: '0' },
      { id: 'w3-d7', date: '15-Feb', hours: '0' },
    ],
  },
  {
    id: 'week-4',
    label: 'Week 4',
    days: [
      { id: 'w4-d1', date: '16-Feb', hours: '0' },
      { id: 'w4-d2', date: '17-Feb', hours: '0' },
      { id: 'w4-d3', date: '18-Feb', hours: '0' },
      { id: 'w4-d4', date: '19-Feb', hours: '0' },
      { id: 'w4-d5', date: '20-Feb', hours: '0' },
      { id: 'w4-d6', date: '21-Feb', hours: '0' },
      { id: 'w4-d7', date: '22-Feb', hours: '0' },
    ],
  },
  {
    id: 'week-5',
    label: 'Week 5',
    days: [
      { id: 'w5-d1', date: '23-Feb', hours: '0' },
      { id: 'w5-d2', date: '24-Feb', hours: '0' },
      { id: 'w5-d3', date: '25-Feb', hours: '0' },
    ],
  },
]

const formatSummaryHours = (hours) =>
  Number.isInteger(hours) ? String(hours) : hours.toFixed(1)

const StaffTimesheetConfirmModal = ({
  isOpen,
  isVisible,
  onClose,
  onSubmit,
  staffId,
  totalDays,
  totalHours,
}) => {
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
      className={`staff-ts-confirm-layer ${isVisible ? 'is-visible' : ''}`.trim()}
      role="presentation"
    >
      <div className="staff-ts-confirm-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`staff-ts-confirm-dialog ${isVisible ? 'is-visible' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-ts-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="staff-ts-confirm-header">
          <h2 id="staff-ts-confirm-title" className="staff-ts-confirm-title">
            Confirm Timesheet Submission
          </h2>
          <AppButton
            type="button"
            className="staff-ts-confirm-close"
            aria-label="Close confirmation"
            onClick={onClose}
          >
            ×
          </AppButton>
        </div>

        <p className="staff-ts-confirm-message">
          Are you sure you want to submit your timesheet? This action cannot be reversed once
          performed. Only continue if you are sure of it.
        </p>

        <div className="staff-ts-confirm-summary">
          <h3 className="staff-ts-confirm-summary-title">Timesheet Summary</h3>
          <ul className="staff-ts-confirm-summary-list">
            <li>
              <strong>Staff ID -</strong> {staffId}
            </li>
            <li>
              <strong>Total Days -</strong> {totalDays}
            </li>
            <li>
              <strong>Hours -</strong> {formatSummaryHours(totalHours)}
            </li>
            <li>
              <strong>Month -</strong> {TIMESHEET_MONTH}
            </li>
            <li>
              <strong>Year -</strong> {TIMESHEET_YEAR}
            </li>
          </ul>
        </div>

        <div className="staff-ts-confirm-actions">
          <AppButton type="button" className="staff-ts-confirm-cancel-btn" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="button" className="staff-ts-confirm-submit-btn" onClick={onSubmit}>
            Submit
          </AppButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const StaffTimesheetSuccessModal = ({ isOpen, isVisible, onClose, onOkay }) => {
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
      className={`staff-ts-success-layer ${isVisible ? 'is-visible' : ''}`.trim()}
      role="presentation"
    >
      <div className="staff-ts-success-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`staff-ts-success-dialog ${isVisible ? 'is-visible' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-ts-success-title"
        onClick={(event) => event.stopPropagation()}
      >
        <AppButton
          type="button"
          className="staff-ts-success-close"
          aria-label="Close success message"
          onClick={onClose}
        >
          ×
        </AppButton>

        <div className="staff-ts-success-icon" aria-hidden="true">
          <AnimatedCheckmark size={80} strokeWidth={10} loop duration={2.2} />
        </div>

        <h2 id="staff-ts-success-title" className="staff-ts-success-title">
          Success!
        </h2>

        <p className="staff-ts-success-message">
          Your timesheet has been submitted and your supervisor has been notified for approval.
        </p>

        <AppButton type="button" className="staff-ts-success-okay-btn" onClick={onOkay}>
          Okay
        </AppButton>
      </div>
    </div>,
    document.body,
  )
}

const StaffSignTimesheet = ({ staffName = 'Mike Tyson', staffId = '09123' }) => {
  const navigate = useNavigate()
  const [selectAll, setSelectAll] = useState(false)
  const [weeks, setWeeks] = useState(INITIAL_WEEKS)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [successVisible, setSuccessVisible] = useState(false)

  const totalHours = weeks.reduce((sum, week) => {
    return (
      sum +
      week.days.reduce((weekSum, day) => {
        const value = parseFloat(day.hours)
        return weekSum + (Number.isNaN(value) ? 0 : value)
      }, 0)
    )
  }, 0)

  const handleHoursChange = (weekId, dayId, value) => {
    const sanitized = value.replace(/[^\d.]/g, '')
    setSelectAll(false)
    setWeeks((prev) =>
      prev.map((week) =>
        week.id !== weekId
          ? week
          : {
              ...week,
              days: week.days.map((day) =>
                day.id === dayId ? { ...day, hours: sanitized } : day
              ),
            }
      )
    )
  }

  const handleSelectAll = (checked) => {
    setSelectAll(checked)
    setWeeks((prev) =>
      prev.map((week) => ({
        ...week,
        days: week.days.map((day, dayIndex) =>
          dayIndex < WEEKDAY_SLOTS ? { ...day, hours: checked ? '8' : '0' } : day
        ),
      }))
    )
  }

  const handleCancel = () => {
    navigate('/staff/timesheet')
  }

  useEffect(() => {
    const modalOpen = confirmOpen || successOpen
    if (!modalOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [confirmOpen, successOpen])

  useEffect(() => {
    if (!confirmOpen) {
      setConfirmVisible(false)
      return undefined
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setConfirmVisible(true))
    })

    return () => cancelAnimationFrame(frame)
  }, [confirmOpen])

  useEffect(() => {
    if (!successOpen) {
      setSuccessVisible(false)
      return undefined
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSuccessVisible(true))
    })

    return () => cancelAnimationFrame(frame)
  }, [successOpen])

  const closeConfirm = () => {
    setConfirmVisible(false)
    window.setTimeout(() => setConfirmOpen(false), CONFIRM_SHEET_ANIMATION_MS)
  }

  const handleContinue = () => {
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = () => {
    setConfirmVisible(false)
    window.setTimeout(() => {
      setConfirmOpen(false)
      setSuccessOpen(true)
    }, CONFIRM_SHEET_ANIMATION_MS)
  }

  const dismissSuccess = () => {
    setSuccessVisible(false)
    window.setTimeout(() => {
      setSuccessOpen(false)
      navigate('/staff/timesheet')
    }, CONFIRM_SHEET_ANIMATION_MS)
  }

  const padWeekDays = (days) => {
    const padded = [...days]
    while (padded.length < DAYS_PER_WEEK) {
      padded.push(null)
    }
    return padded
  }

  return (
    <div className="staff-sign-timesheet-page">
      <header className="staff-sign-timesheet-header">
        <div className="staff-sign-timesheet-user">
          <h1 className="staff-sign-timesheet-name">{staffName}</h1>
          <p className="staff-sign-timesheet-id">{staffId}</p>
        </div>
        <AppButton type="button" className="staff-sign-timesheet-cancel" onClick={handleCancel}>
          Cancel
        </AppButton>
      </header>

      <section className="staff-sign-timesheet-card">
        <h2 className="staff-sign-timesheet-card-title">Current Timesheet</h2>
        <div className="staff-sign-timesheet-summary">
          <div className="staff-sign-timesheet-summary-info">
            <div className="staff-sign-timesheet-period">February 2026</div>
            <div className="staff-sign-timesheet-working-days">Total working days: 20</div>
          </div>
          <span className="staff-sign-timesheet-hours-badge">
            {Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)} Total Hours
          </span>
        </div>
      </section>

      <section className="staff-sign-timesheet-card staff-sign-timesheet-card--grid">
        <label className="staff-sign-timesheet-select-all">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span>Select All</span>
        </label>

        <div className="staff-sign-timesheet-grid" role="table" aria-label="Timesheet weeks">
          {weeks.map((week) => (
            <div key={week.id} className="staff-sign-timesheet-grid-row" role="row">
              <div className="staff-sign-timesheet-week-label" role="rowheader">
                {week.label}
              </div>
              {padWeekDays(week.days).map((day, index) =>
                day ? (
                  <div key={day.id} className="staff-sign-timesheet-day-cell" role="cell">
                    <span className="staff-sign-timesheet-day-date">{day.date}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="staff-sign-timesheet-day-hours-input"
                      value={day.hours}
                      onChange={(e) => handleHoursChange(week.id, day.id, e.target.value)}
                      aria-label={`Hours for ${day.date}`}
                    />
                  </div>
                ) : (
                  <div
                    key={`${week.id}-empty-${index}`}
                    className="staff-sign-timesheet-day-cell staff-sign-timesheet-day-cell--empty"
                    role="cell"
                    aria-hidden="true"
                  />
                )
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="staff-sign-timesheet-footer">
        <AppButton
          type="button"
          className="staff-sign-timesheet-continue-btn"
          onClick={handleContinue}
        >
          Continue
        </AppButton>
      </div>

      <StaffTimesheetConfirmModal
        isOpen={confirmOpen}
        isVisible={confirmVisible}
        onClose={closeConfirm}
        onSubmit={handleConfirmSubmit}
        staffId={staffId}
        totalDays={WORKING_DAYS}
        totalHours={totalHours}
      />

      <StaffTimesheetSuccessModal
        isOpen={successOpen}
        isVisible={successVisible}
        onClose={dismissSuccess}
        onOkay={dismissSuccess}
      />
    </div>
  )
}

export default StaffSignTimesheet
