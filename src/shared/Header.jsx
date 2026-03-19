import { useState, useEffect, useRef } from 'react'
import './Header.css'
import AppButton from './AppButton'
import ChangePasswordModal from './ChangePasswordModal'
import FeedbackModal from './FeedbackModal'

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isChangePasswordClosing, setIsChangePasswordClosing] = useState(false)
  const [isPasswordSuccessOpen, setIsPasswordSuccessOpen] = useState(false)
  const [isPasswordSuccessClosing, setIsPasswordSuccessClosing] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isFeedbackClosing, setIsFeedbackClosing] = useState(false)
  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)

  const toggleMobileMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('openSidebar'))
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
    setIsNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    setIsDropdownOpen(false)
  }

  const openChangePassword = () => {
    setIsChangePasswordOpen(true)
    setIsChangePasswordClosing(false)
    setIsDropdownOpen(false)
  }

  const closeChangePassword = () => {
    setIsChangePasswordClosing(true)
    setTimeout(() => {
      setIsChangePasswordOpen(false)
      setIsChangePasswordClosing(false)
    }, 250)
  }

  const closePasswordSuccess = () => {
    setIsPasswordSuccessClosing(true)
    setTimeout(() => {
      setIsPasswordSuccessOpen(false)
      setIsPasswordSuccessClosing(false)
    }, 250)
  }

  const handleChangePasswordContinue = () => {
    setIsChangePasswordClosing(true)
    setTimeout(() => {
      setIsChangePasswordOpen(false)
      setIsChangePasswordClosing(false)
      setIsPasswordSuccessClosing(false)
      setIsPasswordSuccessOpen(true)
    }, 250)
  }

  const openFeedback = () => {
    setIsFeedbackOpen(true)
    setIsFeedbackClosing(false)
    setIsDropdownOpen(false)
  }

  const closeFeedback = () => {
    setIsFeedbackClosing(true)
    setTimeout(() => {
      setIsFeedbackOpen(false)
      setIsFeedbackClosing(false)
    }, 250)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }

    if (isDropdownOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, isNotificationsOpen])

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6H21M3 12H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="header-right">
          <div className="notification-wrapper">
            <button
              className="notification-btn"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 0 0 6 8C6 11.09 4.5 13.5 4.5 13.5H19.5C19.5 13.5 18 11.09 18 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="notification-badge">4</span>
            </button>
            {isNotificationsOpen && (
              <div className="notifications-dropdown" ref={notificationsRef}>
                <div className="notifications-header">
                  <div className="notifications-title">Notifications</div>
                  <button
                    className="notifications-close"
                    onClick={() => setIsNotificationsOpen(false)}
                    aria-label="Close notifications"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="notifications-list">
                  <div className="notification-item">
                    <div className="notification-dot notification-dot-green"></div>
                    <div className="notification-content">
                      <div className="notification-text">
                        Your timesheet for December 2025 has been approved
                      </div>
                      <div className="notification-time">1 month ago</div>
                    </div>
                  </div>
                  <div className="notification-divider"></div>
                  <div className="notification-item">
                    <div className="notification-dot notification-dot-orange"></div>
                    <div className="notification-content">
                      <div className="notification-text">
                        Reminder: Submit your timesheet for March by 26th.
                      </div>
                      <div className="notification-time">1 month ago</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="user-info">
            <div className="user-avatar">M</div>
            <div className="user-details">
              <div className="user-name">John Adeyemi</div>
              <div className="user-email">jadeyemi@ecews.org</div>
            </div>
          </div>
          <button
            className="user-menu-btn"
            onClick={toggleDropdown}
            aria-label="User menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6H21M3 12H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="user-dropdown" ref={dropdownRef}>
              <div className="dropdown-title">Menu</div>
              <AppButton type="button" className="dropdown-item" onClick={openChangePassword}>
                <span>Change Password</span>
              </AppButton>
              <AppButton type="button" className="dropdown-item" onClick={openFeedback}>
                <span>Send Feedback</span>
              </AppButton>
              <AppButton type="button" className="dropdown-item logout-item">
                <span>Logout</span>
              </AppButton>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        isClosing={isChangePasswordClosing}
        onClose={closeChangePassword}
        onContinue={handleChangePasswordContinue}
      />

      {isPasswordSuccessOpen && (
        <div className="header-modal-overlay" onClick={closePasswordSuccess}>
          <div
            className={`header-modal header-password-success-modal ${
              isPasswordSuccessClosing ? 'header-modal-closing' : 'header-modal-opening'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="header-modal-close header-modal-close-top-right"
              onClick={closePasswordSuccess}
              aria-label="Close success"
            >
              &times;
            </button>

            <div className="header-success-icon-wrapper">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                className="header-success-check"
              >
                <path
                  d="M16 34L27 45L48 20"
                  stroke="#16A34A"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="header-success-text">
              <h2 className="header-success-title">Success!</h2>
              <p className="header-success-message">
                Your password has been changed successfully.
              </p>
            </div>

            <div className="header-success-footer">
              <AppButton
                type="button"
                className="header-modal-btn header-modal-btn-primary"
                onClick={closePasswordSuccess}
              >
                Done
              </AppButton>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        isClosing={isFeedbackClosing}
        onClose={closeFeedback}
      />
    </>
  )
}

export default Header

