import { useMemo, useState } from 'react'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import './ProgramsTimesheetReview.css'

const allRows = [
  {
    id: 1,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Programs Review',
    contractStatus: 'Active',
    tab: 'pending',
  },
  {
    id: 2,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Programs Review',
    contractStatus: 'Active',
    tab: 'pending',
  },
  {
    id: 3,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Programs Review',
    contractStatus: 'Active',
    tab: 'pending',
  },
  {
    id: 4,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Programs Review',
    contractStatus: 'On PIP',
    tab: 'pending',
  },
  {
    id: 5,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Programs Review',
    contractStatus: 'Expiring soon',
    tab: 'pending',
  },
  {
    id: 6,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Programs Review',
    contractStatus: 'Expiring soon',
    tab: 'pending',
  },
  {
    id: 7,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Programs Review',
    contractStatus: 'Active',
    tab: 'pending',
  },
  {
    id: 101,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Approved',
    contractStatus: 'Active',
    tab: 'approved',
  },
  {
    id: 102,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Approved',
    contractStatus: 'Active',
    tab: 'approved',
  },
  {
    id: 103,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Approved',
    contractStatus: 'Active',
    tab: 'approved',
  },
  {
    id: 104,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Approved',
    contractStatus: 'On PIP',
    tab: 'approved',
  },
  {
    id: 105,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Approved',
    contractStatus: 'Expiring soon',
    tab: 'approved',
  },
  {
    id: 106,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Approved',
    contractStatus: 'Expiring soon',
    tab: 'approved',
  },
  {
    id: 107,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Approved',
    contractStatus: 'Active',
    tab: 'approved',
  },
  {
    id: 201,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Returned',
    contractStatus: 'Active',
    tab: 'returned',
  },
  {
    id: 202,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Returned',
    contractStatus: 'On PIP',
    tab: 'returned',
  },
  {
    id: 203,
    staffName: 'John Adeyemi',
    submissionDate: '05-02-2026',
    timesheetStatus: 'Returned',
    contractStatus: 'Expiring soon',
    tab: 'returned',
  },
]

const ProgramsTimesheetReview = () => {
  const [activeTab, setActiveTab] = useState('pending')

  const rows = useMemo(() => allRows.filter((r) => r.tab === activeTab), [activeTab])

  const columns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    {
      header: 'Timesheet Status',
      key: 'timesheetStatus',
      render: (row) => (
        <span
          className={`pgtr-pill ${
            row.timesheetStatus === 'Approved'
              ? 'pgtr-pill-approved'
              : row.timesheetStatus === 'Returned'
              ? 'pgtr-pill-returned'
              : 'pgtr-pill-purple'
          }`}
        >
          {row.timesheetStatus}
        </span>
      ),
    },
    {
      header: 'Contract Status',
      key: 'contractStatus',
      render: (row) => {
        const key = row.contractStatus.toLowerCase().replace(/\s+/g, '')
        const className =
          key === 'active'
            ? 'pgtr-pill-green'
            : key === 'onpip'
            ? 'pgtr-pill-amber'
            : key === 'expiringsoon'
            ? 'pgtr-pill-red'
            : 'pgtr-pill-gray'

        return <span className={`pgtr-pill ${className}`}>{row.contractStatus}</span>
      },
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton
          to={activeTab === 'pending' ? `/programs/timesheet/${row.id}` : `/programs/timesheet/view/${row.id}`}
          className={activeTab === 'pending' ? 'pgtr-review-btn' : 'pgtr-view-btn'}
        >
          {activeTab === 'pending' ? 'Review' : 'View'}
        </AppButton>
      ),
    },
  ]

  return (
    <div className="pgtr-page">
      <div className="pgtr-header">
        <h1 className="pgtr-title">Review Timesheets</h1>
        <p className="pgtr-subtitle">Track submitted timesheets</p>
      </div>

      <div className="pgtr-card">
        <div className="pgtr-card-header">
          <h2 className="pgtr-card-title">All Timesheet</h2>
        </div>

        <div className="pgtr-tabs-row">
          <div className="pgtr-tabs">
            <AppButton
              type="button"
              className={`pgtr-tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </AppButton>
            <AppButton
              type="button"
              className={`pgtr-tab ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved
            </AppButton>
            <AppButton
              type="button"
              className={`pgtr-tab ${activeTab === 'returned' ? 'active' : ''}`}
              onClick={() => setActiveTab('returned')}
            >
              Returned
            </AppButton>
          </div>

          {activeTab === 'approved' && (
            <AppButton type="button" className="pgtr-export-btn">
              Export All
            </AppButton>
          )}
        </div>

        <div className="pgtr-table-container">
          <AppTable columns={columns} data={rows} rowKey="id" tableClassName="pgtr-table" />
        </div>
      </div>
    </div>
  )
}

export default ProgramsTimesheetReview

