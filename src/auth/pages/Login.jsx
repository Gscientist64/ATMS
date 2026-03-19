import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [isForgotSuccessOpen, setIsForgotSuccessOpen] = useState(false)
  const [forgotStaffId, setForgotStaffId] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const forgotDialogRef = useRef(null)

  const canSubmit = useMemo(() => staffId.trim().length > 0 && password.length > 0, [staffId, password])
  const canContinue = useMemo(
    () => forgotStaffId.trim().length > 0 && forgotEmail.trim().length > 0,
    [forgotStaffId, forgotEmail],
  )

  const onSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  useEffect(() => {
    if (!isForgotOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isForgotSuccessOpen) {
          setIsForgotSuccessOpen(false)
        } else {
          setIsForgotOpen(false)
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isForgotOpen, isForgotSuccessOpen])

  useEffect(() => {
    if (!isForgotOpen) return

    const id = window.setTimeout(() => {
      const input = forgotDialogRef.current?.querySelector('#forgotStaffId')
      input?.focus?.()
    }, 0)

    return () => window.clearTimeout(id)
  }, [isForgotOpen])

  const onForgotContinue = (e) => {
    e.preventDefault()
    setIsForgotSuccessOpen(true)
  }

  return (
    <div className="login-page">
      <div className="login-top">
        <img className="login-logo" src="/ecews-logo.png" alt="ECEWS" />
      </div>

      <h1 className="login-title">ATMS</h1>
      <p className="login-subtitle">Smart tracking for compliant work</p>

      <div className="login-card" role="region" aria-label="Sign in">
        <div className="login-card-header">
          <div className="login-card-title">Welcome</div>
          <div className="login-card-caption">Please sign in to your account</div>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label className="login-label" htmlFor="staffId">
            Staff ID
          </label>
          <div className="login-input-wrap">
            <span className="login-input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M4 20a8 8 0 0 1 16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              id="staffId"
              className="login-input"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Enter your staff ID"
              autoComplete="username"
              inputMode="text"
            />
          </div>
          <div className="login-hint">ie. 009123 or AKS/UYO/09475</div>

          <label className="login-label" htmlFor="password">
            Password
          </label>
          <div className="login-input-wrap">
            <span className="login-input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 10V8a5 5 0 0 1 10 0v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              id="password"
              className="login-input login-input-with-action"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
            />
            <AppButton
              type="button"
              className="login-input-action"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </AppButton>
          </div>

          <div className="login-warning" role="note">
            <span className="login-warning-dot" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path
                  d="M10.3 4.2 2.3 18.1A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.9L13.7 4.2a2 2 0 0 0-3.4 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Don&apos;t share your password with anyone</span>
          </div>

          <AppButton className="login-submit" type="submit" disabled={!canSubmit}>
            Sign In
          </AppButton>

          <div className="login-footer">
            <AppButton type="button" className="login-forgot" onClick={() => setIsForgotOpen(true)}>
              Forgot Password?
            </AppButton>
          </div>
        </form>
      </div>

      {isForgotOpen && (
        <div
          className="forgot-overlay"
          onClick={() => (isForgotSuccessOpen ? null : setIsForgotOpen(false))}
          role="presentation"
        >
          <div
            className="forgot-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Forgot Password"
            ref={forgotDialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            <AppButton
              type="button"
              className="forgot-close"
              onClick={() => {
                if (isForgotSuccessOpen) {
                  setIsForgotSuccessOpen(false)
                } else {
                  setIsForgotOpen(false)
                }
              }}
              aria-label="Close"
            >
              &times;
            </AppButton>

            {!isForgotSuccessOpen ? (
              <>
                <div className="forgot-header">
                  <div className="forgot-title">Forgot Password?</div>
                  <div className="forgot-subtitle">
                    Please provide the following details to reset your password.
                  </div>
                </div>

                <form className="forgot-form" onSubmit={onForgotContinue}>
                  <label className="forgot-label" htmlFor="forgotStaffId">
                    Staff ID
                  </label>
                  <div className="forgot-input-wrap">
                    <span className="forgot-input-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M4 20a8 8 0 0 1 16 0"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <input
                      id="forgotStaffId"
                      className="forgot-input"
                      value={forgotStaffId}
                      onChange={(e) => setForgotStaffId(e.target.value)}
                      placeholder="Enter your staff ID"
                    />
                  </div>
                  <div className="forgot-hint">i.e. AKS/UYO/09475</div>

                  <label className="forgot-label" htmlFor="forgotEmail">
                    Email
                  </label>
                  <div className="forgot-input-wrap">
                    <span className="forgot-input-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 10V8a5 5 0 0 1 10 0v2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </span>
                    <input
                      id="forgotEmail"
                      className="forgot-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      type="email"
                      autoComplete="email"
                    />
                  </div>

                  <div className="forgot-help">
                    You will receive an email with instructions to sign into your account
                  </div>

                  <div className="forgot-recaptcha" aria-label="reCAPTCHA placeholder">
                    <div className="forgot-recaptcha-left">
                      <div className="forgot-check" aria-hidden="true" />
                      <div>I&apos;m not a robot</div>
                    </div>
                    <div className="forgot-recaptcha-right" aria-hidden="true">
                      <div className="forgot-recaptcha-badge" />
                      <div className="forgot-recaptcha-meta">reCAPTCHA</div>
                      <div className="forgot-recaptcha-terms">Privacy - Terms</div>
                    </div>
                  </div>

                  <AppButton className="forgot-continue" type="submit" disabled={!canContinue}>
                    Continue
                  </AppButton>
                </form>
              </>
            ) : (
              <div className="forgot-success" role="dialog" aria-label="Success">
                <div className="forgot-success-icon" aria-hidden="true">
                  <svg width="92" height="64" viewBox="0 0 92 64" fill="none">
                    <path
                      d="M10 34L32 56L82 8"
                      stroke="#10B981"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="forgot-success-title">Success!</div>
                <div className="forgot-success-text">
                  Your password reset is being processed.
                  <br />
                  Please check your email for the next steps.
                </div>

                <AppButton
                  type="button"
                  className="forgot-success-done"
                  onClick={() => {
                    setIsForgotSuccessOpen(false)
                    setIsForgotOpen(false)
                  }}
                >
                  Done
                </AppButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login

