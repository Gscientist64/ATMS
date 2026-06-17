// ADHOC-Management-System/src/Programs/components/ProgramsPipManagement.jsx

import React, { useState, useEffect } from 'react'
import AppButton from '../../shared/AppButton'
import { getAllActivePips, getPipById, updatePip, endPip } from '../../services/api'
import './ProgramsPipManagement.css'

const contractStatusPillClass = (status) => {
  switch ((status || '').toLowerCase().replace(/\s+/g, '')) {
    case 'onpip': return 'prog-pip-pill-onpip'
    case 'terminated': return 'prog-pip-pill-terminated'
    case 'terminationpending': return 'prog-pip-pill-terminationpending'
    default: return 'prog-pip-pill-active'
  }
}

const ProgramsPipManagement = () => {
  const [pips, setPips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPip, setSelectedPip] = useState(null)
  const [editPipOpen, setEditPipOpen] = useState(false)
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false)
  const [saveSuccessExiting, setSaveSuccessExiting] = useState(false)
  const [endPipOpen, setEndPipOpen] = useState(false)
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editObjective, setEditObjective] = useState('')
  const [editActionPlan, setEditActionPlan] = useState('')
  const [endOutcome, setEndOutcome] = useState('')
  const [endChecklist, setEndChecklist] = useState({
    reviewCompleted: false,
    evaluationDocumented: false,
    supervisorFeedback: false,
    hrReviewCompleted: false,
  })
  const [processing, setProcessing] = useState(false)

  // Load active PIPs on mount
  useEffect(() => {
    fetchActivePips()
  }, [])

  const fetchActivePips = async () => {
    try {
      setLoading(true)
      const res = await getAllActivePips()
      setPips(Array.isArray(res) ? res : (res.data || []));
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load active PIPs')
    } finally {
      setLoading(false)
    }
  }

  const fetchPipDetail = async (pipId) => {
    try {
      const res = await getPipById(pipId)
      setSelectedPip(res.data || res)
    } catch (err) {
      console.error(err)
      setError('Failed to load PIP details')
    }
  }

  const openDetail = (pip) => {
    fetchPipDetail(pip.id)
  }

  const closeDetail = () => {
    setSelectedPip(null)
    setEditPipOpen(false)
    setSaveSuccessOpen(false)
    setSaveSuccessExiting(false)
    setEndPipOpen(false)
  }

  // Edit PIP
  const openEditPipModal = () => {
    if (!selectedPip) return
    setEditStartDate(selectedPip.startDate?.split('T')[0] || '')
    setEditEndDate(selectedPip.endDate?.split('T')[0] || '')
    setEditObjective(selectedPip.objective || '')
    // Strip HTML tags when loading into the edit form
    const plainText = selectedPip.actionPlan ? selectedPip.actionPlan.replace(/<[^>]*>/g, '') : ''
    setEditActionPlan(plainText)
    setEditPipOpen(true)
  }

  const handleEditPip = async () => {
    setProcessing(true)
    try {
      await updatePip(selectedPip.id, {
        startDate: editStartDate,
        endDate: editEndDate,
        objective: editObjective,
        actionPlan: editActionPlan,
      })
      // Refresh detail
      await fetchPipDetail(selectedPip.id)
      await fetchActivePips()
      setEditPipOpen(false)
      setSaveSuccessOpen(true)
      setSaveSuccessExiting(false)
      setTimeout(() => setSaveSuccessExiting(true), 2000)
      setTimeout(() => setSaveSuccessOpen(false), 2500)
    } catch (err) {
      console.error(err)
      setError('Failed to update PIP')
    } finally {
      setProcessing(false)
    }
  }

  // End PIP
  const openEndPipModal = () => {
    setEndOutcome('')
    setEndChecklist({
      reviewCompleted: false,
      evaluationDocumented: false,
      supervisorFeedback: false,
      hrReviewCompleted: false,
    })
    setEndPipOpen(true)
  }

  const handleEndPip = async () => {
    if (!endOutcome) {
      setError('Please select an outcome')
      return
    }
    setProcessing(true)
    try {
      await endPip(selectedPip.id, {
        outcome: endOutcome,
        reviewCompleted: endChecklist.reviewCompleted,
        evaluationDocumented: endChecklist.evaluationDocumented,
        supervisorFeedbackProvided: endChecklist.supervisorFeedback,
        hrReviewCompleted: endChecklist.hrReviewCompleted,
      })
      // Refresh list and close detail
      await fetchActivePips()
      closeDetail()
    } catch (err) {
      console.error(err)
      setError('Failed to end PIP')
    } finally {
      setProcessing(false)
    }
  }

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB') // dd-mm-yyyy
  }

  if (loading) {
    return <div className="prog-pip-page"><div className="prog-pip-loading">Loading PIPs...</div></div>
  }

  if (error && pips.length === 0) {
    return (
      <div className="prog-pip-page">
        <div className="prog-pip-error">{error}</div>
        <AppButton onClick={fetchActivePips}>Retry</AppButton>
      </div>
    )
  }

  // ---------- Detail View (when a PIP is selected) ----------
  if (selectedPip) {
    return (
      <div className="prog-pip-page">
        <header className="prog-pip-detail-head">
          <button type="button" className="prog-pip-back" onClick={closeDetail}>
            <svg className="prog-pip-back-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="prog-pip-detail-name">{selectedPip.userFullName}</h1>
          <p className="prog-pip-detail-role">{selectedPip.userDesignation || 'Staff'}</p>
        </header>

        <section className="prog-pip-profile-card">
          <div className="prog-pip-profile-row">
            <div className="prog-pip-profile-main">
              <h2 className="prog-pip-profile-name">{selectedPip.userFullName}</h2>
              <hr className="prog-pip-profile-divider" />
              <div className="prog-pip-meta-grid">
                <div>
                  <p className="prog-pip-meta-label">Contract Status</p>
                  <span className={contractStatusPillClass(selectedPip.userContractStatus)}>{selectedPip.userContractStatus || 'Active'}</span>
                </div>
                <div>
                  <p className="prog-pip-meta-label">Designation</p>
                  <p className="prog-pip-meta-value">{selectedPip.userDesignation || '—'}</p>
                </div>
                <div>
                  <p className="prog-pip-meta-label">Employee Code</p>
                  <p className="prog-pip-meta-value">{selectedPip.userEmployeeCode || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="prog-pip-detail-grid">
          <section className="prog-pip-block">
            <h3 className="prog-pip-block-title">PIP Details</h3>
            <div className="prog-pip-plan-meta">
              <div>
                <p className="prog-pip-meta-label">Start Date</p>
                <p className="prog-pip-meta-strong">{formatDate(selectedPip.startDate)}</p>
              </div>
              <div>
                <p className="prog-pip-meta-label">End Date</p>
                <p className="prog-pip-meta-strong">{formatDate(selectedPip.endDate)}</p>
              </div>
              <div>
                <p className="prog-pip-meta-label">Duration</p>
                <p className="prog-pip-meta-strong">{selectedPip.duration}</p>
              </div>
            </div>
            <article className="prog-pip-plan-card">
              <p className="prog-pip-plan-label">Objective</p>
              <p className="prog-pip-plan-text">{selectedPip.objective}</p>

              <p className="prog-pip-plan-label">Action Plan</p>
              <div className="prog-pip-plan-text" dangerouslySetInnerHTML={{ __html: selectedPip.actionPlan }} />

              {selectedPip.status === 'Active' && (
                <div className="prog-pip-plan-actions">
                  <AppButton type="button" className="prog-pip-edit-btn" onClick={openEditPipModal}>
                    <span className="prog-pip-edit-icon">✎</span> Edit
                  </AppButton>
                  <AppButton type="button" className="prog-pip-end-btn" onClick={openEndPipModal}>
                    End PIP
                  </AppButton>
                </div>
              )}
            </article>
          </section>

          {selectedPip.reviews?.length > 0 && (
            <section className="prog-pip-block">
              <h3 className="prog-pip-block-title">Reviews & Comments</h3>
              {selectedPip.reviews.map((review) => (
                <article key={review.id} className="prog-pip-concern-card">
                  <div className="prog-pip-concern-top">
                    <div className="prog-pip-concern-avatar">{review.reviewerName?.charAt(0) || 'R'}</div>
                    <div className="prog-pip-concern-head">
                      <div>
                        <p className="prog-pip-concern-name">{review.reviewerName}</p>
                        <p className="prog-pip-concern-role">{review.reviewerRole}</p>
                      </div>
                      <time className="prog-pip-concern-time">{new Date(review.reviewDate).toLocaleString()}</time>
                    </div>
                  </div>
                  <p className="prog-pip-concern-body">{review.comments}</p>
                  {review.rating && (
                    <div className="prog-pip-concern-footer">
                      <span className="prog-pip-tagline">
                        <span className="prog-pip-tag-label">Rating</span>
                        <span className="prog-pip-tag">{review.rating}</span>
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}
        </div>

        {/* Edit PIP Modal */}
        {editPipOpen && (
          <div className="prog-pip-modal-overlay" role="presentation" onClick={() => setEditPipOpen(false)}>
            <div className="prog-pip-modal" role="dialog" aria-modal="true" aria-label="Edit PIP" onClick={e => e.stopPropagation()}>
              <button type="button" className="prog-pip-modal-close" aria-label="Close" onClick={() => setEditPipOpen(false)}>×</button>
              <div className="prog-pip-modal-title">Edit PIP</div>
              <p className="prog-pip-modal-subtitle">Update the Performance Improvement Plan details.</p>

              {error && <div className="prog-pip-error-msg">{error}</div>}

              <div className="prog-pip-modal-body">
                <div className="prog-pip-modal-row">
                  <div className="prog-pip-modal-field">
                    <label className="prog-pip-modal-label">Start Date</label>
                    <input type="date" className="prog-pip-modal-input" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                  </div>
                  <div className="prog-pip-modal-field">
                    <label className="prog-pip-modal-label">End Date</label>
                    <input type="date" className="prog-pip-modal-input" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="prog-pip-modal-field">
                  <label className="prog-pip-modal-label">Objective</label>
                  <input className="prog-pip-modal-input" value={editObjective} onChange={(e) => setEditObjective(e.target.value)} />
                </div>
                <div className="prog-pip-modal-field">
                  <label className="prog-pip-modal-label">Action Plan</label>
                  <textarea className="prog-pip-modal-textarea" rows={5} value={editActionPlan} onChange={(e) => setEditActionPlan(e.target.value)} />
                </div>
              </div>
              <div className="prog-pip-modal-actions">
                <button type="button" className="prog-pip-modal-cancel" onClick={() => setEditPipOpen(false)}>Cancel</button>
                <button type="button" className="prog-pip-modal-save" onClick={handleEditPip} disabled={processing}>{processing ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}

        {/* End PIP Modal */}
        {endPipOpen && (
          <div className="prog-pip-modal-overlay" role="presentation" onClick={() => setEndPipOpen(false)}>
            <div className="prog-pip-modal" role="dialog" aria-modal="true" aria-label="End PIP" onClick={e => e.stopPropagation()}>
              <button type="button" className="prog-pip-modal-close" aria-label="Close" onClick={() => setEndPipOpen(false)}>×</button>
              <div className="prog-pip-modal-title">End PIP Process</div>
              <p className="prog-pip-modal-subtitle">Confirm all clearance items before proceeding.</p>

              {error && <div className="prog-pip-error-msg">{error}</div>}

              <div className="prog-pip-modal-body">
                <div className="prog-pip-end-section">
                  <p className="prog-pip-end-section-title">PIP Completion Checklist</p>
                  <div className="prog-pip-end-checklist">
                    <label className="prog-pip-end-check-label">
                      <input type="checkbox" checked={endChecklist.reviewCompleted} onChange={e => setEndChecklist({...endChecklist, reviewCompleted: e.target.checked})} />
                      <span>Performance Review Completed</span>
                    </label>
                    <label className="prog-pip-end-check-label">
                      <input type="checkbox" checked={endChecklist.evaluationDocumented} onChange={e => setEndChecklist({...endChecklist, evaluationDocumented: e.target.checked})} />
                      <span>Final Evaluation Documented</span>
                    </label>
                    <label className="prog-pip-end-check-label">
                      <input type="checkbox" checked={endChecklist.supervisorFeedback} onChange={e => setEndChecklist({...endChecklist, supervisorFeedback: e.target.checked})} />
                      <span>Supervisor Feedback Provided</span>
                    </label>
                    <label className="prog-pip-end-check-label">
                      <input type="checkbox" checked={endChecklist.hrReviewCompleted} onChange={e => setEndChecklist({...endChecklist, hrReviewCompleted: e.target.checked})} />
                      <span>HR Review Completed</span>
                    </label>
                  </div>
                </div>

                <div className="prog-pip-end-section">
                  <p className="prog-pip-end-section-title">Outcome Selection</p>
                  <div className="prog-pip-end-outcome">
                    <label className="prog-pip-end-radio-label">
                      <input type="radio" name="outcome" value="success" onChange={() => setEndOutcome('success')} />
                      <span>Successfully Completed</span>
                    </label>
                    <label className="prog-pip-end-radio-label">
                      <input type="radio" name="outcome" value="extend" onChange={() => setEndOutcome('extend')} />
                      <span>Extend PIP Period</span>
                    </label>
                    <label className="prog-pip-end-radio-label">
                      <input type="radio" name="outcome" value="unsuccessful" onChange={() => setEndOutcome('unsuccessful')} />
                      <span>Unsuccessful (Further Action Required)</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="prog-pip-modal-actions">
                <button type="button" className="prog-pip-modal-cancel" onClick={() => setEndPipOpen(false)}>Cancel</button>
                <button type="button" className="prog-pip-modal-save" onClick={handleEndPip} disabled={processing}>{processing ? 'Processing...' : 'Complete Termination'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Success modal */}
        {saveSuccessOpen && (
          <div className={`prog-pip-success-overlay ${saveSuccessExiting ? 'exiting' : ''}`} onClick={() => { setSaveSuccessExiting(true); setTimeout(() => setSaveSuccessOpen(false), 500); }}>
            <div className={`prog-pip-success-modal ${saveSuccessExiting ? 'exiting' : ''}`}>
              <div className="prog-pip-success-title">Done!</div>
              <p>PIP updated successfully.</p>
              <AppButton onClick={() => { setSaveSuccessExiting(true); setTimeout(() => setSaveSuccessOpen(false), 500); }}>Okay</AppButton>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---------- Table View (list of active PIPs) ----------
  return (
    <div className="prog-pip-page">
      <div className="prog-pip-head">
        <h1 className="prog-pip-title">PIP Management</h1>
        <p className="prog-pip-subtitle">Monitor Performance Improvement Plans</p>
      </div>

      <section className="prog-pip-card">
        <h2 className="prog-pip-card-title">Staff on Performance Improvement Plan</h2>
        <div className="prog-pip-table-wrap">
          <table className="prog-pip-table">
            <thead>
              <tr>
                <th>Staff name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Objective</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {pips && pips.length > 0 ? (
              pips.map((pip) => (
                <tr key={pip.id}>
                  <td>{pip.userFullName}</td>
                  <td>{formatDate(pip.startDate)}</td>
                  <td>{formatDate(pip.endDate)}</td>
                  <td>{pip.duration}</td>
                  <td>
                    <span className={`prog-pip-status prog-pip-status--${pip.status === 'Active' ? 'pip' : 'completed'}`}>
                      {pip.status === 'Active' ? 'On PIP' : 'Completed'}
                    </span>
                  </td>
                  <td className="prog-pip-objective">{pip.objective?.substring(0, 60)}...</td>
                  <td className="prog-pip-action">
                    <AppButton type="button" className="prog-pip-review-btn" onClick={() => openDetail(pip)}>
                      Review
                    </AppButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No active PIPs found</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default ProgramsPipManagement