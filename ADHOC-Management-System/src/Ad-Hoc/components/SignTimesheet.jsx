import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './SignTimesheet.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { adHocService, authService, getActiveWorkCycles } from '../../services/api'
import { stripHtml, truncateText } from '../../utils/stringUtils'

const SignTimesheet = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [staffExpanded, setStaffExpanded] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isExistingTimesheet, setIsExistingTimesheet] = useState(false)
  const [existingTimesheetId, setExistingTimesheetId] = useState(null)
  const [entries, setEntries] = useState([
    { id: 1, date: '', startTime: '', endTime: '', totalHours: '0.0', workDone: '' },
  ])
  const [expandedEntries, setExpandedEntries] = useState({})
  const [entryModalOpen, setEntryModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [entryForm, setEntryForm] = useState({ date: '', startTime: '', endTime: '', workDone: '' })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true)
  const [checkingCycle, setCheckingCycle] = useState(true)
  const [submissionClosedMessage, setSubmissionClosedMessage] = useState('')

  const [timesheetData, setTimesheetData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    weekStarting: '',
    weekEnding: ''
  })

  useEffect(() => {
    fetchUserData()
    checkWorkCycleStatus()
    if (id) {
      loadExistingTimesheet()
    }
  }, [id])

  const checkWorkCycleStatus = async () => {
    try {
      setCheckingCycle(true)
      const cycles = await getActiveWorkCycles()
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      const activeCycle = cycles.find(cycle => cycle.monthYear === currentMonth)
      
      if (activeCycle) {
        const now = new Date()
        const endDate = new Date(activeCycle.endDate)
        const isOpen = now <= endDate
        setIsSubmissionOpen(isOpen)
        if (!isOpen) {
          setSubmissionClosedMessage(`Timesheet submission for ${currentMonth} closed on ${endDate.toLocaleDateString()}. Please contact HR for assistance.`)
        }
      } else {
        setIsSubmissionOpen(true)
        setSubmissionClosedMessage('')
      }
    } catch (error) {
      console.error('Error checking work cycle:', error)
      setIsSubmissionOpen(true)
      setSubmissionClosedMessage('')
    } finally {
      setCheckingCycle(false)
    }
  }

  const fetchUserData = async () => {
    try {
      const userData = await adHocService.getProfile()
      setUser(userData)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const loadExistingTimesheet = async () => {
    try {
      const timesheet = await adHocService.getTimesheet(id)
      if (timesheet && timesheet.status === 'Draft') {
        setIsExistingTimesheet(true)
        setExistingTimesheetId(timesheet.id)
        
        const [month, year] = timesheet.monthYear.split(' ')
        setTimesheetData({
          month: month,
          year: parseInt(year),
          weekStarting: timesheet.weekStarting || '',
          weekEnding: timesheet.weekEnding || ''
        })
        
        if (timesheet.entries && timesheet.entries.length > 0) {
          const loadedEntries = timesheet.entries.map((entry, index) => ({
            id: index + 1,
            date: entry.date.split('-').reverse().join('-'),
            startTime: entry.startTime,
            endTime: entry.endTime,
            totalHours: entry.totalHours.replace(' hrs', ''),
            workDone: entry.workDone
          }))
          setEntries(loadedEntries)
        }
        
        setSuccessMessage('Editing saved draft. Make your changes and save again or submit.')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Error loading timesheet:', error)
    }
  }

  const openEntryModal = (entry) => {
    setEditingEntry(entry)
    setEntryForm({
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      workDone: entry.workDone,
    })
    setEntryModalOpen(true)
  }

  const closeEntryModal = () => {
    setEntryModalOpen(false)
    setEditingEntry(null)
    setEntryForm({ date: '', startTime: '', endTime: '', workDone: '' })
  }

  const handleEntryDone = () => {
    if (editingEntry) {
      if (entryForm.startTime && entryForm.endTime) {
        const start = entryForm.startTime.split(':')
        const end = entryForm.endTime.split(':')
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1])
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1])
        const totalHours = ((endMinutes - startMinutes) / 60).toFixed(1)
        
        setEntries(entries.map((e) =>
          e.id === editingEntry.id
            ? {
                ...e,
                date: entryForm.date,
                startTime: entryForm.startTime,
                endTime: entryForm.endTime,
                workDone: entryForm.workDone,
                totalHours: totalHours
              }
            : e
        ))
      } else {
        setEntries(entries.map((e) =>
          e.id === editingEntry.id
            ? {
                ...e,
                date: entryForm.date,
                startTime: entryForm.startTime,
                endTime: entryForm.endTime,
                workDone: entryForm.workDone,
                totalHours: '0.0'
              }
            : e
        ))
      }
    }
    closeEntryModal()
  }

  const addEntry = () => {
    const newId = Math.max(...entries.map((e) => e.id), 0) + 1
    setEntries([
      ...entries,
      { id: newId, date: '', startTime: '', endTime: '', totalHours: '0.0', workDone: '' },
    ])
  }

  const removeEntry = (id) => {
    if (entries.length > 1) {
      setEntries(entries.filter((e) => e.id !== id))
    }
  }

  const calculateTotalHours = () => {
    return entries.reduce((sum, entry) => sum + parseFloat(entry.totalHours || 0), 0).toFixed(1)
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'dd/mm/yyyy'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB')
  }

  const prepareEntriesForSubmit = () => {
    return entries
      .filter(e => e.date && e.startTime && e.endTime && e.workDone)
      .map(e => ({
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        workDone: e.workDone,
        lga: user?.lga || '',
        ward: '',
        healthFacility: user?.healthFacility || ''
      }))
  }

  const handleSaveDraft = async () => {
    if (!isSubmissionOpen) {
      setError(submissionClosedMessage || 'Timesheet submission is currently closed.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const validEntries = prepareEntriesForSubmit()
      
      if (validEntries.length === 0) {
        setError('Please add at least one complete entry')
        return
      }

      const createDto = {
        month: timesheetData.month,
        year: timesheetData.year,
        weekStarting: timesheetData.weekStarting || new Date().toISOString().split('T')[0],
        weekEnding: timesheetData.weekEnding || new Date().toISOString().split('T')[0],
        entries: validEntries
      }

      let result
      if (isExistingTimesheet && existingTimesheetId) {
        result = await adHocService.updateTimesheet(existingTimesheetId, createDto)
      } else {
        result = await adHocService.createTimesheet(createDto)
      }
      
      setSuccessMessage('Draft saved successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      navigate(`/timesheet/${result.id}`)
    } catch (err) {
      setError(err.message || 'Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!isSubmissionOpen) {
      setError(submissionClosedMessage || 'Timesheet submission is currently closed.')
      return
    }

    const validEntries = prepareEntriesForSubmit()
    if (validEntries.length === 0) {
      setError('Please add at least one complete entry')
      return
    }
    setShowConfirmModal(true)
  }

  const confirmSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      setShowConfirmModal(false)
      
      const validEntries = prepareEntriesForSubmit()
      
      const createDto = {
        month: timesheetData.month,
        year: timesheetData.year,
        weekStarting: timesheetData.weekStarting || new Date().toISOString().split('T')[0],
        weekEnding: timesheetData.weekEnding || new Date().toISOString().split('T')[0],
        entries: validEntries
      }

      let result
      if (isExistingTimesheet && existingTimesheetId) {
        result = await adHocService.updateTimesheet(existingTimesheetId, createDto)
        await adHocService.submitTimesheet(result.id, '')
      } else {
        result = await adHocService.createTimesheet(createDto)
        await adHocService.submitTimesheet(result.id, '')
      }
      
      setSuccessMessage('Timesheet submitted successfully!')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      navigate(`/timesheet/${result.id}`)
    } catch (err) {
      setError(err.message || 'Failed to submit timesheet')
    } finally {
      setLoading(false)
    }
  }

  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const getWorkingDays = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let workingDays = 0
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i).getDay()
      if (day !== 0 && day !== 6) workingDays++
    }
    return workingDays
  }

  const toggleExpand = (entryId) => {
    setExpandedEntries(prev => ({ ...prev, [entryId]: !prev[entryId] }))
  }

  const entriesColumns = [
    {
      header: 'Date',
      key: 'date',
      render: (entry) => (
        <span className={`sign-cell-value ${!entry.date ? 'sign-cell-placeholder' : ''}`}>
          {formatDateDisplay(entry.date)}
        </span>
      ),
    },
    {
      header: 'Start Time',
      key: 'startTime',
      render: (entry) => (
        <span className={`sign-cell-value sign-cell-value-sm ${!entry.startTime ? 'sign-cell-placeholder' : ''}`}>
          {entry.startTime || '--:--'}
        </span>
      ),
    },
    {
      header: 'End Time',
      key: 'endTime',
      render: (entry) => (
        <span className={`sign-cell-value sign-cell-value-sm ${!entry.endTime ? 'sign-cell-placeholder' : ''}`}>
          {entry.endTime || '--:--'}
        </span>
      ),
    },
    {
      header: 'Total Hours',
      key: 'totalHours',
      render: (entry) => <span className="sign-hours-display">{entry.totalHours} hrs</span>,
    },
    {
      header: 'Work Done',
      key: 'workDone',
      render: (entry) => {
        const plainText = stripHtml(entry.workDone || '');
        const isExpanded = expandedEntries[entry.id];
        const displayText = isExpanded ? plainText : truncateText(plainText, 150);
        const hasMore = plainText.length > 150;
        return (
          <div>
            <div className="sign-work-done-text">{displayText}</div>
            {hasMore && (
              <button
                className="view-more-btn"
                onClick={() => toggleExpand(entry.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2c7da0',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  marginTop: '0.25rem',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                {isExpanded ? 'View less' : 'View more'}
              </button>
            )}
          </div>
        );
      }
    },
    {
      header: 'Action',
      key: 'action',
      render: (entry) => (
        <div className="sign-action-icons">
          <button type="button" className="sign-icon-btn" aria-label="Edit" onClick={() => openEntryModal(entry)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="sign-icon-btn" aria-label="Delete" onClick={() => removeEntry(entry.id)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="sign-timesheet-page">
      <div className="sign-timesheet-header">
        <Link to="/dashboard" className="sign-back-link">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="sign-timesheet-title">Sign Your Timesheet</h1>
        <p className="sign-timesheet-subtitle">Fill in your timesheet details for the month</p>
      </div>

      {error && <div className="sign-error">{error}</div>}
      {showSuccess && <div className="sign-success">{successMessage}</div>}
      
      {!isSubmissionOpen && !checkingCycle && (
        <div className="sign-closed-warning">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#dc2626" strokeWidth="2" fill="#fee2e2" />
            <path d="M10 6V10M10 14H10.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{submissionClosedMessage}</span>
        </div>
      )}

      <div className="sign-staff-card">
        <div
          className="sign-section-header"
          onClick={() => setStaffExpanded(!staffExpanded)}
          role="button"
          tabIndex={0}
        >
          <h2 className="sign-section-title">Staff Information</h2>
          <svg className={`sign-expand-icon ${!staffExpanded ? 'collapsed' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {staffExpanded && (
          <div className="sign-staff-info">
            <div className="sign-staff-col">
              <div className="sign-info-item">
                <span className="sign-info-label">Full Name</span>
                <span className="sign-info-value">{user?.fullName || 'Loading...'}</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Month</span>
                <span className="sign-info-value">{timesheetData.month}</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Account Number</span>
                <span className="sign-info-value">{user?.accountNumber || 'Not provided'}</span>
              </div>
            </div>
            <div className="sign-staff-col">
              <div className="sign-info-item">
                <span className="sign-info-label">Department</span>
                <span className="sign-info-value">{user?.department || 'Not specified'}</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Year</span>
                <span className="sign-info-value">{timesheetData.year}</span>
              </div>
            </div>
            <div className="sign-staff-col">
              <div className="sign-info-item">
                <span className="sign-info-label">Location</span>
                <span className="sign-info-value">{user?.state || 'Not specified'}</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Bank Name</span>
                <span className="sign-info-value">{user?.bankName || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sign-summary-bar">
        <span className="sign-summary-month">{timesheetData.month} {timesheetData.year}</span>
        <span className="sign-summary-sep" />
        <span className="sign-summary-days">Total working days: {getWorkingDays()}</span>
        <span className="sign-summary-hours">{getWorkingDays() * 8} Total Hours</span>
      </div>

      <div className="sign-entries-card">
        <div className="sign-entries-header">
          <h2 className="sign-section-title">Timesheet Entries</h2>
          <AppButton type="button" className="sign-add-entry-btn" onClick={addEntry}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Entry
          </AppButton>
        </div>
        <AppTable
          columns={entriesColumns}
          data={entries}
          rowKey="id"
          containerClassName="sign-entries-table-container"
          tableClassName="sign-entries-table"
        />
        <div className="sign-total-row">
          <span className="sign-total-label">Total Hours this month:</span>
          <span className="sign-total-value">{calculateTotalHours()} hours</span>
        </div>
      </div>

      {entryModalOpen && (
        <div className="entry-modal-overlay" onClick={closeEntryModal}>
          <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="entry-modal-header">
              <h3 className="entry-modal-title">Entry Details</h3>
              <button type="button" className="entry-modal-close" onClick={closeEntryModal} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="entry-modal-body">
              <div className="entry-modal-row">
                <div className="entry-modal-field">
                  <label className="entry-modal-label">Date</label>
                  <div className="entry-modal-input-wrap">
                    <input
                      type="date"
                      className="entry-modal-input entry-modal-date-input"
                      value={entryForm.date}
                      onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                    />
                    <svg className="entry-modal-calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="entry-modal-field">
                  <label className="entry-modal-label">Start Time</label>
                  <input
                    type="time"
                    className="entry-modal-input"
                    value={entryForm.startTime}
                    onChange={(e) => setEntryForm({ ...entryForm, startTime: e.target.value })}
                  />
                </div>
                <div className="entry-modal-field">
                  <label className="entry-modal-label">End Time</label>
                  <input
                    type="time"
                    className="entry-modal-input"
                    value={entryForm.endTime}
                    onChange={(e) => setEntryForm({ ...entryForm, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="entry-modal-field">
                <label className="entry-modal-label">Work done</label>
                <div className="entry-modal-editor">
                  <ReactQuill
                    theme="snow"
                    value={entryForm.workDone}
                    onChange={(value) => setEntryForm({ ...entryForm, workDone: value })}
                    placeholder="Enter description"
                    className="entry-modal-quill"
                    modules={{
                      toolbar: [
                        [{ font: [] }],
                        [{ size: ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ color: [] }, { background: [] }],
                        ['link', 'image'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ align: [] }],
                        [{ indent: '-1' }, { indent: '+1' }],
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="entry-modal-footer">
              <AppButton type="button" className="entry-modal-done-btn" onClick={handleEntryDone}>
                Done
              </AppButton>
            </div>
          </div>
        </div>
      )}

      <div className="sign-actions">
        <AppButton 
          type="button" 
          className="sign-save-draft-btn" 
          onClick={handleSaveDraft} 
          disabled={loading || !isSubmissionOpen}
          style={!isSubmissionOpen ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Save as Draft
        </AppButton>
        <AppButton 
          type="button" 
          className="sign-submit-btn" 
          onClick={handleSubmit} 
          disabled={loading || !isSubmissionOpen}
          style={!isSubmissionOpen ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
        >
          {loading ? 'Submitting...' : 'Submit Timesheet'}
        </AppButton>
      </div>

      {showConfirmModal && (
        <div className="sign-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="sign-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sign-confirm-header">
              <h3>Confirm Submission</h3>
              <button className="sign-confirm-close" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div className="sign-confirm-body">
              <p>Once you submit this timesheet, you will not be able to edit it again.</p>
              <p>Are you sure you want to proceed?</p>
            </div>
            <div className="sign-confirm-footer">
              <AppButton type="button" className="sign-confirm-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </AppButton>
              <AppButton type="button" className="sign-confirm-submit" onClick={confirmSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Yes, Submit'}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignTimesheet