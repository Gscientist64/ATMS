// src/HRIS/ETMS_HR/components/AncillaryGovernance.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../../shared/AppButton'
import { getGovernanceActions } from '../../../services/api'
import './AncillaryGovernance.css'

const AncillaryGovernance = () => {
  const navigate = useNavigate()
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchActions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getGovernanceActions()
      setActions(res.data || res)
    } catch (err) {
      console.error(err)
      setError('Failed to load governance actions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActions()
  }, [])

  const getCategoryClass = (category) => {
    if (category === 'PIP Recommendation' || category === 'Active PIP' || category === 'PIP Advisory') return 'is-pip'
    if (category === 'Termination' || category === 'Termination Advisory') return 'is-termination'
    return 'is-renewal'
  }

  const getActionPath = (action) => {
    if (action.category === 'PIP Recommendation') return `/hris/ancillary-staff/governance/pip/${action.id}`
    if (action.category === 'Contract Renewal') return `/hris/ancillary-staff/governance/renew/${action.id}`
    if (action.category === 'Termination') return `/hris/ancillary-staff/governance/termination/${action.id}`
    return `/hris/ancillary-staff/governance/renew/${action.id}`
  }

  const getButtonLabel = (category) => {
    if (category === 'PIP Recommendation') return 'Review PIP'
    if (category === 'Contract Renewal') return 'Renew'
    if (category === 'Termination') return 'Process'
    return 'Review'
  }

  if (loading) {
    return <div className="agov-page"><div className="agov-loading">Loading governance actions...</div></div>
  }

  return (
    <div className="agov-page">
      <header className="agov-header">
        <h1 className="agov-title">Governance</h1>
        <p className="agov-subtitle">Review and manage concerns raised by Programs Team</p>
      </header>

      <div className="agov-card">
        <h2 className="agov-card-title">Governance Actions</h2>

        {error && <div className="agov-error">{error} <button onClick={fetchActions}>Retry</button></div>}

        <div className="agov-table-wrap">
          <table className="agov-table">
            <thead>
              <tr>
                <th scope="col">Staff name</th>
                <th scope="col">Raised by</th>
                <th scope="col">Date</th>
                <th scope="col">Category</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id}>
                  <td>{action.staffName}</td>
                  <td>{action.raisedBy}</td>
                  <td>{new Date(action.dateRaised).toLocaleDateString('en-GB')}</td>
                  <td>
                    <span className={`agov-badge ${getCategoryClass(action.category)}`}>
                      {action.category}
                    </span>
                  </td>
                  <td>
                    <AppButton
                      type="button"
                      className="agov-review-btn"
                      onClick={() => navigate(getActionPath(action))}
                    >
                      {getButtonLabel(action.category)}
                    </AppButton>
                  </td>
                </tr>
              ))}
              {actions.length === 0 && !loading && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No governance actions pending</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AncillaryGovernance