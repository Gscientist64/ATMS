// src/HRIS/ETMS_HR/components/AncillaryGovernancePipDetail.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import HrisExecuteActionsPanel from '../../shared/HrisExecuteActionsPanel'
import { getGovernanceActionById } from '../../../services/api'
import './AncillaryGovernancePipDetail.css'
import AppButton from '../../../shared/AppButton'

const AncillaryGovernancePipDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [action, setAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchActionDetail()
  }, [id])

  const fetchActionDetail = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getGovernanceActionById(id)
      setAction(res.data || res)
    } catch (err) {
      console.error(err)
      setError('Failed to load action details')
    } finally {
      setLoading(false)
    }
  }

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return <div className="agov-pip-page"><div className="agov-pip-loading">Loading action details...</div></div>
  }

  if (error || !action) {
    return (
      <div className="agov-pip-page">
        <div className="agov-pip-error">{error || 'Action not found'}</div>
        <AppButton onClick={() => navigate('/hris/ancillary-staff/governance')}>Back to Governance</AppButton>
      </div>
    )
  }

  return (
    <div className="agov-pip-page">
      <header className="agov-pip-header">
        <div className="agov-pip-header-left">
          <button
            type="button"
            className="agov-pip-back"
            onClick={() => navigate('/hris/ancillary-staff/governance')}
          >
            <svg className="agov-pip-back-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="agov-pip-employee">{action.staffName}</h1>
          <p className="agov-pip-role">{action.staffRole || 'Staff'}</p>
        </div>
        <HrisExecuteActionsPanel
          showInitiatePip={false}
          publicId={action.publicId}
          employeeCode={action.employeeCode}
          staffName={action.staffName}
          staffEmail={action.staffEmail}
        />
      </header>

      <section className="agov-pip-section" aria-labelledby="agov-pip-section-title">
        <h2 id="agov-pip-section-title" className="agov-pip-section-title">
          {action.category === 'PIP Recommendation' ? 'PIP Recommendation Details' : 'Action Details'}
        </h2>

        <div className="agov-pip-card">
          <div className="agov-pip-card-top">
            <div className="agov-pip-avatar" aria-hidden="true">
              {action.raisedBy?.charAt(0) || 'S'}
            </div>
            <div className="agov-pip-card-head">
              <div>
                <div className="agov-pip-card-name">{action.raisedBy}</div>
                <div className="agov-pip-card-sub">Raised by</div>
              </div>
              <time className="agov-pip-card-time" dateTime={action.dateRaised}>
                {formatDate(action.dateRaised)}
              </time>
            </div>
          </div>
          <p className="agov-pip-card-body">{action.details || action.justification || 'No additional details provided.'}</p>
          <div className="agov-pip-card-footers">
            <span className="agov-pip-tagline">
              <span className="agov-pip-tag-label">Category</span>
              <span className="agov-pip-pill agov-pip-pill--orange">{action.category}</span>
            </span>
            <span className="agov-pip-tagline">
              <span className="agov-pip-tag-label">Status</span>
              <span className="agov-pip-pill agov-pip-pill--high">{action.status}</span>
            </span>
          </div>
        </div>

        {/* If there are additional comments or recommendations, map them here */}
        {action.comments && action.comments.length > 0 && (
          <div className="agov-pip-comments">
            <h3 className="agov-pip-section-subtitle">Comments</h3>
            {action.comments.map((comment, idx) => (
              <div key={idx} className="agov-pip-comment-card">
                <div className="agov-pip-comment-header">
                  <strong>{comment.author}</strong>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AncillaryGovernancePipDetail