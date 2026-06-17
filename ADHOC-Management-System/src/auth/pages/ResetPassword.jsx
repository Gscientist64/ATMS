import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Login.css'

const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [token, setToken] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const tokenParam = searchParams.get('token')
        if (tokenParam) {
            setToken(tokenParam)
        } else {
            setError('Invalid or missing reset token')
        }
    }, [searchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }
        
        setLoading(true)
        setError('')
        setMessage('')
        
        try {
            const response = await fetch('http://localhost:5087/api/Auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            })
            const data = await response.json()
            
            if (response.ok) {
                setMessage(data.message)
                setTimeout(() => navigate('/login'), 3000)
            } else {
                setError(data.message)
            }
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
                    <h1 className="login-title">Create New Password</h1>
                    <p className="login-subtitle">Enter your new password below</p>
                </div>

                {message && <div className="login-success">{message}</div>}
                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <input
                            type="password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <input
                            type="password"
                            className="login-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="login-footer">
                    <Link to="/login" className="login-link">Back to Login</Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword