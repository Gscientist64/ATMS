import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')
        
        try {
            const response = await fetch('http://localhost:5087/api/Auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await response.json()
            setMessage(data.message)
            setEmail('')
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Reset Password</h1>
                    <p className="login-subtitle">Enter your email to receive a password reset link</p>
                </div>

                {message && <div className="login-success">{message}</div>}
                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <input
                            type="email"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="login-footer">
                    <Link to="/login" className="login-link">Back to Login</Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword