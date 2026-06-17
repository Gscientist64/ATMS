import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HrisExecuteActionsPanel from '../../HRIS/shared/HrisExecuteActionsPanel'
import { programsService } from '../../services/api'
import './ProgramsGovernanceAdvisoryDetail.css'

const ProgramsGovernanceAdvisoryDetail = () => {
  const { id } = useParams()
  const [advisory, setAdvisory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdvisory()
  }, [id])

  const fetchAdvisory = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await programsService.getGovernanceAdvisoryDetail(id)
      setAdvisory(data)
    } catch (err) {
      setError(err.message || 'Failed to load advisory details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="pgad-page">
        <div className="pgad-loading">Loading advisory details...</div>
      </div>
    )
  }

  if (error || !advisory) {
    return (
      <div className="pgad-page">
        <div className="pgad-error">{error || 'Advisory not found'}</div>
        <Link to="/programs/governance" className="pgad-back">
          Back to Governance
        </Link>
      </div>
    )
  }

  return (
    <div className="pgad-page">
      <div className="pgad-topbar">
        <Link to="/programs/governance" className="pgad-back" aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back</span>
        </Link>
      </div>

      <header className="pgad-header">
        <div className="pgad-header-left">
          <h1 className="pgad-name">{advisory.staffName}</h1>
          <p className="pgad-role">{advisory.staffRole}</p>
        </div>
        <HrisExecuteActionsPanel
          showRenewContract={false}
          publicId={advisory.staffPublicId}
          employeeCode={advisory.employeeCode}
          staffName={advisory.staffName}
          staffEmail={advisory.staffEmail}
        />
      </header>

      <section className="pgad-card" aria-labelledby="pgad-advisory-title">
        <h2 id="pgad-advisory-title" className="pgad-card-title">
          {advisory.advisoryTitle}
        </h2>
        <div className="pgad-divider" />
        <div className="pgad-meta">
          <div className="pgad-meta-item">
            <span className="pgad-meta-label">Submitted by</span>
            <span className="pgad-meta-value">{advisory.submittedBy}</span>
          </div>
          <div className="pgad-meta-item">
            <span className="pgad-meta-label">Date submitted</span>
            <span className="pgad-meta-value">{advisory.dateSubmitted}</span>
          </div>
          <div className="pgad-meta-item">
            <span className="pgad-meta-label">Status</span>
            <span className="pgad-meta-value pgad-meta-strong">{advisory.status}</span>
          </div>
        </div>
        <div className="pgad-justification">
          <p className="pgad-just-text">{advisory.justification}</p>
        </div>
      </section>
    </div>
  )
}

export default ProgramsGovernanceAdvisoryDetail
