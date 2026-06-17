import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './ActionCompletedToast.css'

export const DEFAULT_ACTION_COMPLETED_MESSAGE = 'Action Completed Successfully'

const AUTO_DISMISS_MS = 4000
const EXIT_ANIMATION_MS = 250

const ActionCompletedToastContext = createContext(null)

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const ActionCompletedToast = ({
  message = DEFAULT_ACTION_COMPLETED_MESSAGE,
  isExiting = false,
  onClose,
}) => (
  <div className="action-completed-toast-layer" role="presentation">
    <div
      className={`action-completed-toast ${isExiting ? 'is-exiting' : ''}`.trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="action-completed-toast-icon" aria-hidden="true">
        <IconCheck />
      </span>
      <p className="action-completed-toast-message">{message}</p>
      <button type="button" className="action-completed-toast-close" aria-label="Dismiss" onClick={onClose}>
        ×
      </button>
    </div>
  </div>
)

export const ActionCompletedToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null)
  const dismissTimeoutRef = useRef(null)
  const exitTimeoutRef = useRef(null)

  const clearTimers = useCallback(() => {
    if (dismissTimeoutRef.current) {
      window.clearTimeout(dismissTimeoutRef.current)
      dismissTimeoutRef.current = null
    }
    if (exitTimeoutRef.current) {
      window.clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }
  }, [])

  const dismissToast = useCallback(() => {
    if (dismissTimeoutRef.current) {
      window.clearTimeout(dismissTimeoutRef.current)
      dismissTimeoutRef.current = null
    }
    if (exitTimeoutRef.current) {
      window.clearTimeout(exitTimeoutRef.current)
      exitTimeoutRef.current = null
    }

    setToast((current) => {
      if (!current) return current
      return { ...current, isExiting: true }
    })

    exitTimeoutRef.current = window.setTimeout(() => {
      setToast(null)
      exitTimeoutRef.current = null
    }, EXIT_ANIMATION_MS)
  }, [])

  const showActionCompleted = useCallback(
    (message = DEFAULT_ACTION_COMPLETED_MESSAGE) => {
      clearTimers()
      setToast({ message, isExiting: false })

      dismissTimeoutRef.current = window.setTimeout(() => {
        dismissToast()
      }, AUTO_DISMISS_MS)
    },
    [clearTimers, dismissToast],
  )

  useEffect(() => () => clearTimers(), [clearTimers])

  const value = { showActionCompleted }

  return (
    <ActionCompletedToastContext.Provider value={value}>
      {children}
      {toast &&
        createPortal(
          <ActionCompletedToast
            message={toast.message}
            isExiting={toast.isExiting}
            onClose={dismissToast}
          />,
          document.body,
        )}
    </ActionCompletedToastContext.Provider>
  )
}

export const useActionCompletedToast = () => {
  const context = useContext(ActionCompletedToastContext)
  if (!context) {
    throw new Error('useActionCompletedToast must be used within ActionCompletedToastProvider')
  }
  return context
}

export default ActionCompletedToast