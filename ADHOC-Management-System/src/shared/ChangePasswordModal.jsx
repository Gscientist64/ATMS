// ADHOC-Management-System/src/shared/ChangePasswordModal.jsx

import React, { useState } from 'react'
import AppButton from './AppButton'
import { authService } from '../services/api'

const ChangePasswordModal = ({ isOpen, isClosing, onClose, onContinue }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      length: password.length >= 6,
      upperCase: hasUpperCase,
      lowerCase: hasLowerCase,
      number: hasNumbers,
      specialChar: hasSpecialChar,
      isValid: password.length >= 6 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    }
  }

  const passwordValidation = validatePassword(newPassword)

  const handleContinueClick = async () => {
    // Validate all fields are filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('Password does not meet the requirements')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      await authService.changePassword(currentPassword, newPassword)
      
      // Reset form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      
      // Call onContinue to show success modal
      onContinue?.()
    } catch (err) {
      setError(err.message || 'Failed to change password. Please check your current password.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setError('')
    setLoading(false)
    onClose?.()
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
          <h2 className="header-modal-title">Change Password</h2>
          <AppButton
            type="button"
            className="header-modal-close"
            onClick={handleClose}
            aria-label="Close change password"
            disabled={loading}
          >
            &times;
          </AppButton>
        </div>

        <p className="header-modal-subtitle">
          Please provide your current password and choose a new strong password.
        </p>

        {error && (
          <div className="header-modal-error">
            {error}
          </div>
        )}

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
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9 10V8C9 5.79 10.79 4 13 4C15.21 4 17 5.79 17 8V10"
                    stroke="currentColor"
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
                placeholder="Enter current password"
                disabled={loading}
              />
              <AppButton
                type="button"
                className="header-modal-input-icon-right"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12C4.5 8 8 5 12 5C16 5 19.5 8 21 12C19.5 16 16 19 12 19C8 19 4.5 16 3 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {!showCurrentPassword && (
                    <path
                      d="M4 4L20 20"
                      stroke="currentColor"
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
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9 10V8C9 5.79 10.79 4 13 4C15.21 4 17 5.79 17 8V10"
                    stroke="currentColor"
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
                placeholder="Enter new password"
                disabled={loading}
              />
              <AppButton
                type="button"
                className="header-modal-input-icon-right"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12C4.5 8 8 5 12 5C16 5 19.5 8 21 12C19.5 16 16 19 12 19C8 19 4.5 16 3 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {!showNewPassword && (
                    <path
                      d="M4 4L20 20"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </AppButton>
            </div>
            
            {/* Password requirements */}
            {newPassword && (
              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={passwordValidation.length ? 'valid' : ''}>
                    {passwordValidation.length ? '✓' : '○'} At least 6 characters
                  </li>
                  <li className={passwordValidation.upperCase ? 'valid' : ''}>
                    {passwordValidation.upperCase ? '✓' : '○'} One uppercase letter
                  </li>
                  <li className={passwordValidation.lowerCase ? 'valid' : ''}>
                    {passwordValidation.lowerCase ? '✓' : '○'} One lowercase letter
                  </li>
                  <li className={passwordValidation.number ? 'valid' : ''}>
                    {passwordValidation.number ? '✓' : '○'} One number
                  </li>
                  <li className={passwordValidation.specialChar ? 'valid' : ''}>
                    {passwordValidation.specialChar ? '✓' : '○'} One special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="header-modal-field">
            <label className="header-modal-label">Confirm New Password</label>
            <div className="header-modal-input-wrapper header-modal-input-with-icons">
              <span className="header-modal-input-icon-left" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="9"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9 10V8C9 5.79 10.79 4 13 4C15.21 4 17 5.79 17 8V10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="header-modal-input"
                placeholder="Confirm new password"
                disabled={loading}
              />
              <AppButton
                type="button"
                className="header-modal-input-icon-right"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12C4.5 8 8 5 12 5C16 5 19.5 8 21 12C19.5 16 16 19 12 19C8 19 4.5 16 3 12Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {!showConfirmPassword && (
                    <path
                      d="M4 4L20 20"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </AppButton>
            </div>
            {confirmPassword && newPassword && (
              <div className={`password-match-indicator ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>
        </div>

        <div className="header-modal-footer header-modal-footer-full">
          <AppButton
            type="button"
            className="header-modal-btn header-modal-btn-primary header-modal-btn-full"
            onClick={handleContinueClick}
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </AppButton>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal