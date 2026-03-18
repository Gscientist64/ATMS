import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './TimesheetDetail.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const TimesheetDetail = () => {
  useParams()
  const [activeTab, setActiveTab] = useState('details')

  const entries = [
    { date: '28-02-2026', startTime: '08:00', endTime: '05:00', totalHours: '9 hrs', workDone: 'Community sensitization on health programs' },
    { date: '28-02-2026', startTime: '08:00', endTime: '05:00', totalHours: '9 hrs', workDone: 'Data collection in Ikeja area' },
    { date: '28-02-2026', startTime: '08:00', endTime: '05:00', totalHours: '9 hrs', workDone: 'Follow-up visits to beneficiaries' },
  ]

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
    { header: 'Work Done', accessor: 'workDone', key: 'workDone' },
  ]

  const stages = [
    { name: 'Draft', completed: true },
    { name: 'Submitted', completed: true },
    { name: 'GON Review', completed: true },
    { name: 'ECEWS Review', completed: false, current: true },
    { name: 'Programs Team', completed: false },
    { name: 'HR', completed: false },
    { name: 'Processed', completed: false },
  ]

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
          <h1 className="ts-detail-title">Timesheet - January 2026</h1>
          <p className="ts-detail-user">John Adeyemi</p>
        </div>
        <AppButton type="button" className="ts-download-pdf-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V11M8 11L10 14L12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 14V16C4 16.5523 4.44772 17 5 17H15C15.5523 17 16 16.5523 16 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Download PDF
        </AppButton>
      </div>

      <div className="ts-detail-workflow">
        <div className="ts-workflow-tracker">
          {stages.map((stage, index) => (
            <span key={stage.name} style={{ display: 'contents' }}>
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
            </span>
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
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="ts-detail-content">
            <div className="ts-employee-info">
              <div className="ts-info-item">
                <span className="ts-info-label">Full Name</span>
                <span className="ts-info-value">John Adeyemi</span>
              </div>
              <div className="ts-info-item">
                <span className="ts-info-label">Location</span>
                <span className="ts-info-value">Lagos State</span>
              </div>
              <div className="ts-info-item">
                <span className="ts-info-label">Department</span>
                <span className="ts-info-value">Field Operations</span>
              </div>
              <div className="ts-info-item">
                <span className="ts-info-label">Status</span>
                <span className="ts-detail-status-badge ts-status-review">GON Review</span>
              </div>
            </div>

            <div className="ts-entries-table-container">
              <AppTable columns={entriesColumns} data={entries} tableClassName="ts-entries-table" />
              <div className="ts-total-hours-row">
                <span className="ts-total-label">Total Hours this month:</span>
                <span className="ts-total-value">27 hours</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="ts-comments-content">
            <div className="ts-comment-card">
              <div className="ts-comment-header">
                <div className="ts-comment-user">
                  <div className="ts-comment-avatar">AM</div>
                  <div className="ts-comment-user-info">
                    <div className="ts-comment-name">Amina Mohammed</div>
                    <div className="ts-comment-role">GON Supervisor</div>
                  </div>
                </div>
                <div className="ts-comment-date">28-02-2026 10:30</div>
              </div>
              <div className="ts-comment-text">
                Please provide more details on the survey activities and include all working days. Only 1 day is listed for the entire month.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimesheetDetail
