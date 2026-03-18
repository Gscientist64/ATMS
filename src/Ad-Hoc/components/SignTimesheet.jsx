import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './SignTimesheet.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const SignTimesheet = () => {
  const [staffExpanded, setStaffExpanded] = useState(false)
  const [entries, setEntries] = useState([
    { id: 1, date: '', startTime: '', endTime: '', totalHours: '0.0 hrs', workDone: '' },
  ])
  const [entryModalOpen, setEntryModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [entryForm, setEntryForm] = useState({ date: '', startTime: '', endTime: '', workDone: '' })

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
  }

  const handleEntryDone = () => {
    if (editingEntry) {
      setEntries(entries.map((e) =>
        e.id === editingEntry.id
          ? {
              ...e,
              date: entryForm.date,
              startTime: entryForm.startTime,
              endTime: entryForm.endTime,
              workDone: entryForm.workDone,
              totalHours: e.totalHours,
            }
          : e
      ))
    }
    closeEntryModal()
  }

  const addEntry = () => {
    const newId = Math.max(...entries.map((e) => e.id), 0) + 1
    setEntries([
      ...entries,
      { id: newId, date: '', startTime: '', endTime: '', totalHours: '0.0 hrs', workDone: '' },
    ])
  }

  const removeEntry = (id) => {
    if (entries.length > 1) {
      setEntries(entries.filter((e) => e.id !== id))
    }
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'dd/mm/yyyy'
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-')
      return `${d}/${m}/${y}`
    }
    return dateStr
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
        <span
          className={`sign-cell-value sign-cell-value-sm ${!entry.startTime ? 'sign-cell-placeholder' : ''}`}
        >
          {entry.startTime || '--:--'}
        </span>
      ),
    },
    {
      header: 'End Time',
      key: 'endTime',
      render: (entry) => (
        <span
          className={`sign-cell-value sign-cell-value-sm ${!entry.endTime ? 'sign-cell-placeholder' : ''}`}
        >
          {entry.endTime || '--:--'}
        </span>
      ),
    },
    {
      header: 'Total Hours',
      key: 'totalHours',
      render: (entry) => <span className="sign-hours-display">{entry.totalHours}</span>,
    },
    {
      header: 'Work Done',
      key: 'workDone',
      render: (entry) => (
        <span
          className={`sign-cell-value sign-cell-value-wide ${!entry.workDone ? 'sign-cell-placeholder' : ''}`}
        >
          {entry.workDone || 'Describe work done...'}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (entry) => (
        <div className="sign-action-icons">
          <button
            type="button"
            className="sign-icon-btn"
            aria-label="Edit"
            onClick={() => openEntryModal(entry)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="sign-icon-btn"
            aria-label="Delete"
            onClick={() => removeEntry(entry.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6H5H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

      <div className="sign-staff-card">
        <div
          className="sign-section-header"
          onClick={() => setStaffExpanded(!staffExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setStaffExpanded(!staffExpanded)}
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
                <span className="sign-info-value">John Adeyemi</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Month</span>
                <span className="sign-info-value">February</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Account Number</span>
                <span className="sign-info-value">1234567890</span>
              </div>
            </div>
            <div className="sign-staff-col">
              <div className="sign-info-item">
                <span className="sign-info-label">Department</span>
                <span className="sign-info-value">Field Operations</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Year</span>
                <span className="sign-info-value">2026</span>
              </div>
            </div>
            <div className="sign-staff-col">
              <div className="sign-info-item">
                <span className="sign-info-label">Location</span>
                <span className="sign-info-value">Lagos State</span>
              </div>
              <div className="sign-info-item">
                <span className="sign-info-label">Bank Name</span>
                <span className="sign-info-value">First Bank</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sign-summary-bar">
        <span className="sign-summary-month">February 2026</span>
        <span className="sign-summary-sep" />
        <span className="sign-summary-days">Total working days: 20</span>
        <span className="sign-summary-hours">160 Total Hours</span>
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
          <span className="sign-total-value">0.0 hours</span>
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
        <AppButton type="button" className="sign-save-draft-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Save as Draft
        </AppButton>
        <AppButton type="button" className="sign-submit-btn" disabled>
          Submit Timesheet
        </AppButton>
      </div>
    </div>
  )
}

export default SignTimesheet
