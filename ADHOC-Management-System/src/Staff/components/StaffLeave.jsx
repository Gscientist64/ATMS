import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { staffService } from '../../services/api'
import './StaffLeave.css'

const CANCEL_MODAL_ANIMATION_MS = 500

function LeaveBalanceCalendarIcon() {
  return (
    <span className="staff-leave-balance-calendar" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="8" width="28" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M6 16H34" stroke="currentColor" strokeWidth="2" />
        <path d="M14 5V11M26 5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="staff-leave-balance-calendar-day">8</span>
    </span>
  )
}

function CancelRequestIcon() {
  return (
    <span className="staff-leave-cancel-icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

const renderStatus = (status) => {
  if (!status) {
    return <span className="staff-leave-status staff-leave-status--pending">-</span>
  }
  return <span className="staff-leave-status staff-leave-status--approved">{status}</span>
}

const StaffLeaveCancelModal = ({ isOpen, isVisible, onClose, onContinue }) => {
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
      className={`staff-leave-cancel-modal-layer ${isVisible ? 'is-visible' : ''}`.trim()}
      role="presentation"
    >
      <div className="staff-leave-cancel-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`staff-leave-cancel-modal-dialog ${isVisible ? 'is-visible' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-leave-cancel-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="staff-leave-cancel-modal-header">
          <h2 id="staff-leave-cancel-modal-title" className="staff-leave-cancel-modal-title">
            Cancel leave request?
          </h2>
          <AppButton
            type="button"
            className="staff-leave-cancel-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </AppButton>
        </div>

        <p className="staff-leave-cancel-modal-message">
          Cancelling this leave request will remove it from the approval process. Do you want to
          continue?
        </p>

        <div className="staff-leave-cancel-modal-actions">
          <AppButton type="button" className="staff-leave-cancel-modal-continue-btn" onClick={onContinue}>
            Continue
          </AppButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const StaffLeave = () => {
  const navigate = useNavigate()
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [leaveHistory, setLeaveHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [pendingCancelId, setPendingCancelId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceData, historyData] = await Promise.all([
          staffService.getLeaveBalance(),
          staffService.getLeaveHistory()
        ])
        setLeaveBalance(balanceData)
        setLeaveHistory(Array.isArray(historyData) ? historyData : [])
      } catch (err) {
        console.error('Error fetching leave data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleApplyLeave = () => {
    navigate('/staff/leave/apply')
  }

  useEffect(() => {
    if (!cancelModalOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setCancelModalVisible(true))
    })

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
    }
  }, [cancelModalOpen])

  useEffect(() => {
    if (!cancelModalOpen) {
      setCancelModalVisible(false)
    }
  }, [cancelModalOpen])

  const dismissCancelModal = () => {
    setCancelModalVisible(false)
    window.setTimeout(() => {
      setCancelModalOpen(false)
      setPendingCancelId(null)
    }, CANCEL_MODAL_ANIMATION_MS)
  }

  const openCancelModal = (requestId) => {
    setPendingCancelId(requestId)
    setCancelModalOpen(true)
  }

  const handleCancelContinue = async () => {
    if (pendingCancelId) {
      try {
        await staffService.cancelLeave(pendingCancelId, {})
        setLeaveHistory((prev) => prev.filter((row) => row.id !== pendingCancelId))
        // Refresh balance
        const balanceData = await staffService.getLeaveBalance()
        setLeaveBalance(balanceData)
      } catch (err) {
        console.error('Error cancelling leave:', err)
      }
    }
    dismissCancelModal()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const historyColumns = useMemo(
    () => [
      { key: 'from', header: 'From', accessor: (r) => formatDate(r.from) },
      { key: 'to', header: 'To', accessor: (r) => formatDate(r.to) },
      { key: 'leaveType', header: 'Type', accessor: 'leaveType' },
      { key: 'totalDays', header: 'Total Days', accessor: 'totalDays' },
      {
        key: 'supervisorStatus',
        header: 'Supervisor Status',
        accessor: (r) => renderStatus(r.supervisorStatus),
      },
      {
        key: 'hrStatus',
        header: 'HR Status',
        accessor: (r) => renderStatus(r.hrStatus),
      },
      {
        key: 'action',
        header: 'Action',
        accessor: (r) =>
          r.canCancel ? (
            <AppButton
              type="button"
              className="staff-leave-cancel-request"
              onClick={() => openCancelModal(r.id)}
            >
              <CancelRequestIcon />
              Cancel Request
            </AppButton>
          ) : null,
      },
    ],
    [],
  )

  if (loading) return <div className="staff-leave-page">Loading...</div>

  return (
    <div className="staff-leave-page">
      <header className="staff-leave-header">
        <div className="staff-leave-header-text">
          <h1 className="staff-leave-title">Leave Management</h1>
          <p className="staff-leave-subtitle">Apply for time off from work.</p>
        </div>
        <AppButton type="button" className="staff-leave-apply-btn" onClick={handleApplyLeave}>
          Apply for Leave
        </AppButton>
      </header>

      <section className="staff-leave-card staff-leave-balance-card">
        <div className="staff-leave-balance-head">
          <div className="staff-leave-balance-head-text">
            <h2 className="staff-leave-card-title">Leave Balance</h2>
            <p className="staff-leave-balance-year">{leaveBalance?.year || new Date().getFullYear()} Allocation</p>
          </div>
          <LeaveBalanceCalendarIcon />
        </div>

        <div className="staff-leave-balance-stats">
          <div className="staff-leave-balance-stat">
            <span className="staff-leave-balance-stat-value">{leaveBalance?.remainingDays ?? 0}</span>
            <span className="staff-leave-balance-stat-label">Remaining</span>
          </div>
          <div className="staff-leave-balance-stat">
            <span className="staff-leave-balance-stat-value">{leaveBalance?.takenDays ?? 0}</span>
            <span className="staff-leave-balance-stat-label">Taken</span>
          </div>
          <div className="staff-leave-balance-stat">
            <span className="staff-leave-balance-stat-value">{leaveBalance?.totalDays ?? 0}</span>
            <span className="staff-leave-balance-stat-label">Total</span>
          </div>
          <div className="staff-leave-balance-stat">
            <span className="staff-leave-balance-stat-value">{leaveBalance?.carryoverDays ?? 0}</span>
            <span className="staff-leave-balance-stat-label">Carryover</span>
          </div>
        </div>
      </section>

      <section className="staff-leave-card">
        <h2 className="staff-leave-card-title">Leave history</h2>
        <AppTable
          columns={historyColumns}
          data={leaveHistory}
          rowKey="id"
          containerClassName="staff-leave-table-wrap"
          tableClassName="staff-leave-table"
        />
      </section>

      <StaffLeaveCancelModal
        isOpen={cancelModalOpen}
        isVisible={cancelModalVisible}
        onClose={dismissCancelModal}
        onContinue={handleCancelContinue}
      />
    </div>
  )
}

export default StaffLeave
