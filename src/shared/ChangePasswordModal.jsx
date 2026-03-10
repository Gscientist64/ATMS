import React, { useState } from 'react'
import AppButton from './AppButton'

const ChangePasswordModal = ({ isOpen, isClosing, onClose, onContinue }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  if (!isOpen) return null

  const handleContinueClick = () => {
    onContinue?.()
    setCurrentPassword('')
    setNewPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
  }

  const handleClose = () => {
    onClose?.()
    setCurrentPassword('')
    setNewPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
  }

  return (
    <div className="header-modal-overlay" onClick={handleClose}>
      <div
        className={`header-modal header-change-password-modal ${
          isClosing ? 'header-modal-closing' : 'header-modal-opening'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="header-modal-header">
          <h2 className="header-modal-title">Change Password?</h2>
          <AppButton
            type="button"
            className="header-modal-close"
            onClick={handleClose}
            aria-label="Close change password"
          >
            &times;
          </AppButton>
        </div>

        <p className="header-modal-subtitle">
          Please provide the following details to change your password.
        </p>

        <div className="header-modal-body">
          <div className="header-modal-field">
            <label className="header-modal-label">Current Password</label>
            <div className="header-modal-input-wrapper header-modal-input-with-icons">
              <span className="header-modal-input-icon-left" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="9"
                    rx="2"
                    stroke="black"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9 10V8C9 5.79 10.79 4 13 4C15.21 4 17 5.79 17 8V10"
                    stroke="black"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="header-modal-input"
                placeholder="Enter your password"
              />
              <AppButton
                type="button"
                className="header-modal-input-icon-right"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12C4.5 8 8 5 12 5C16 5 19.5 8 21 12C19.5 16 16 19 12 19C8 19 4.5 16 3 12Z"
                    stroke="black"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="black"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {showCurrentPassword && (
                    <path
                      d="M4 4L20 20"
                      stroke="black"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </AppButton>
            </div>
          </div>

          <div className="header-modal-field">
            <label className="header-modal-label">New Password</label>
            <div className="header-modal-input-wrapper header-modal-input-with-icons">
              <span className="header-modal-input-icon-left" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="9"
                    rx="2"
                    stroke="black"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9 10V8C9 5.79 10.79 4 13 4C15.21 4 17 5.79 17 8V10"
                    stroke="black"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="header-modal-input"
                placeholder="Enter your password"
              />
              <AppButton
                type="button"
                className="header-modal-input-icon-right"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12C4.5 8 8 5 12 5C16 5 19.5 8 21 12C19.5 16 16 19 12 19C8 19 4.5 16 3 12Z"
                    stroke="black"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="black"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {showNewPassword && (
                    <path
                      d="M4 4L20 20"
                      stroke="black"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </AppButton>
            </div>
          </div>
        </div>

        <div className="header-modal-footer header-modal-footer-full">
          <AppButton
            type="button"
            className="header-modal-btn header-modal-btn-primary header-modal-btn-full"
            onClick={handleContinueClick}
          >
            Continue
          </AppButton>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal

