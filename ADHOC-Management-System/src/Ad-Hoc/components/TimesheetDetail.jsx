// src/Ad-Hoc/components/TimesheetDetail.jsx
import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './TimesheetDetail.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { adHocService } from '../../services/api'
import { stripHtml, truncateText } from '../../utils/stringUtils'

const TimesheetDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [timesheet, setTimesheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [expandedEntries, setExpandedEntries] = useState({})

  useEffect(() => {
    fetchTimesheet()
  }, [id])

  const fetchTimesheet = async () => {
    try {
      setLoading(true)
      const data = await adHocService.getTimesheet(id)
      setTimesheet(data)
      setError('')
    } catch (err) {
      setError('Failed to load timesheet details. Please try again.')
      console.error('Error fetching timesheet:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const blob = await adHocService.downloadTimesheet(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Timesheet_${timesheet.monthYear}_${timesheet.userName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading timesheet:', err);
      setError('Failed to download timesheet');
    }
  };

  const handleEditDraft = () => {
    navigate(`/timesheet/edit/${id}`)
  }

  const getWorkflowStages = (status) => {
    const allStages = [
      { name: 'Draft', completed: false, current: false },
      { name: 'Submitted', completed: false, current: false },
    //  { name: 'GON Review', completed: false, current: false },
      { name: 'ECEWS Review', completed: false, current: false },
      { name: 'Programs Team', completed: false, current: false },
      { name: 'HR', completed: false, current: false },
      { name: 'Processed', completed: false, current: false },
    ]

    const statusIndex = {
      'Draft': 0,
      'Submitted': 1,
      //  'GONReview': 2,
      'ECEWSReview': 3,
      'ProgramsTeam': 4,
      'HR': 5,
      'Processed': 6
    }

    const currentIndex = statusIndex[status] || 0
    return allStages.map((stage, idx) => ({
      ...stage,
      completed: idx < currentIndex,
      current: idx === currentIndex
    }))
  }

  const toggleExpand = (entryId) => {
    setExpandedEntries(prev => ({ ...prev, [entryId]: !prev[entryId] }))
  }

  const entriesColumns = [
    { header: 'Date', accessor: 'date', key: 'date' },
    { header: 'Start Time', accessor: 'startTime', key: 'startTime' },
    { header: 'End Time', accessor: 'endTime', key: 'endTime' },
    {
      header: 'Total Hours',
      accessor: 'totalHours',
      key: 'totalHours',
      cellClassName: 'ts-hours-cell',
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
            <div>{displayText}</div>
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
  ]

  if (loading) {
    return (
      <div className="ts-detail-page">
        <div className="ts-detail-loading">Loading timesheet details...</div>
      </div>
    )
  }

  if (error || !timesheet) {
    return (
      <div className="ts-detail-page">
        <div className="ts-detail-error">{error || 'Timesheet not found'}</div>
        <AppButton onClick={() => navigate('/timesheet')} className="ts-back-btn">
          Back to Timesheets
        </AppButton>
      </div>
    )
  }

  const stages = timesheet.workflowStages || getWorkflowStages(timesheet.status)
  const isDraft = timesheet.status === 'Draft'

  return (
    <div className="ts-detail-page">
      <div className="ts-detail-header">
        <div className="ts-detail-header-left">
          <Link to="/timesheet" className="ts-back-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Timesheet
          </Link>
          <h1 className="ts-detail-title">Timesheet - {timesheet.monthYear}</h1>
          <p className="ts-detail-user">{timesheet.userName}</p>
        </div>
        <div className="ts-detail-header-right">
          {isDraft && (
            <AppButton
              type="button"
              className="ts-edit-draft-btn"
              onClick={handleEditDraft}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M12 2L16 6L6 16H2V12L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              Edit Draft
            </AppButton>
          )}
          <AppButton type="button" className="ts-download-pdf-btn" onClick={handleDownloadPDF}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V11M8 11L10 14L12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 14V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Download PDF
          </AppButton>
        </div>
      </div>

      <div className="ts-detail-workflow">
        <div className="ts-workflow-tracker">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.name}>
              <div className="ts-workflow-step">
                <div className={`ts-workflow-stage ${stage.completed ? 'completed' : ''} ${stage.current ? 'current' : ''}`}>
                  {stage.completed ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#096D49" />
                      <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="ts-workflow-number">{index + 1}</span>
                  )}
                </div>
                <span className={`ts-workflow-label ${stage.current ? 'current' : ''}`}>
                  {stage.name}
                </span>
              </div>
              {index < stages.length - 1 && <div className="ts-workflow-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="ts-detail-card">
        <div className="ts-detail-tabs">
          <button
            className={`ts-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Timesheet Details
          </button>
          <button
            className={`ts-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
            {timesheet.comments?.length > 0 && (
              <span className="ts-tab-badge">{timesheet.comments.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="ts-detail-content">
            <div className="ts-employee-info">
              <div className="ts-info-item">
                <span className="ts-info-label">Full Name</span>
                <span className="ts-info-value">{timesheet.fullName}</span>
              </div>
              <div className="ts-info-item">
                <span className="ts-info-label">Location</span>
                <span className="ts-info-value">{timesheet.location || 'Not specified'}</span>
              </div>
              <div className="ts-info-item">
                <span className="ts-info-label">Department</span>
                <span className="ts-info-value">{timesheet.department || 'Not specified'}</span>
              </div>
              <div className="ts-info-item">
                <span className="ts-info-label">Status</span>
                <span className={`ts-detail-status-badge ts-status-${timesheet.statusType}`}>
                  {timesheet.status}
                </span>
              </div>
            </div>

            <div className="ts-entries-table-container">
              <AppTable
                columns={entriesColumns}
                data={timesheet.entries || []}
                tableClassName="ts-entries-table"
              />
              <div className="ts-total-hours-row">
                <span className="ts-total-label">Total Hours this month:</span>
                <span className="ts-total-value">{timesheet.totalHours} hours</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="ts-comments-content">
            {timesheet.comments?.length > 0 ? (
              timesheet.comments.map((comment) => (
                <div key={comment.id} className="ts-comment-card">
                  <div className="ts-comment-header">
                    <div className="ts-comment-user">
                      <div className="ts-comment-avatar">{comment.userAvatar}</div>
                      <div className="ts-comment-user-info">
                        <div className="ts-comment-name">{comment.userName}</div>
                        <div className="ts-comment-role">{comment.userRole}</div>
                      </div>
                    </div>
                    <div className="ts-comment-date">{comment.createdAt}</div>
                  </div>
                  <div className="ts-comment-text">{comment.commentText}</div>
                </div>
              ))
            ) : (
              <div className="ts-no-comments">No comments yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimesheetDetail