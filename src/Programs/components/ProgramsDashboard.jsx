import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import './ProgramsDashboard.css'

const ProgramsDashboard = () => {
  const rows = [
    {
      id: 1,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      timesheetStatus: 'Programs Review',
      contractStatus: 'Active',
    },
    {
      id: 2,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      timesheetStatus: 'Programs Review',
      contractStatus: 'Active',
    },
    {
      id: 3,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      timesheetStatus: 'Programs Review',
      contractStatus: 'Active',
    },
    {
      id: 4,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      timesheetStatus: 'Programs Review',
      contractStatus: 'On PIP',
    },
    {
      id: 5,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      timesheetStatus: 'Programs Review',
      contractStatus: 'Expiring soon',
    },
    {
      id: 6,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      timesheetStatus: 'Programs Review',
      contractStatus: 'Active',
    },
  ]

  const columns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    {
      header: 'Timesheet Status',
      accessor: 'timesheetStatus',
      render: (row) => <span className="pg-pill pg-pill-purple">{row.timesheetStatus}</span>,
    },
    {
      header: 'Contract Status',
      accessor: 'contractStatus',
      render: (row) => {
        const key = row.contractStatus.toLowerCase().replace(/\s+/g, '')
        const className =
          key === 'active'
            ? 'pg-pill-green'
            : key === 'onpip'
            ? 'pg-pill-amber'
            : key === 'expiringsoon'
            ? 'pg-pill-red'
            : 'pg-pill-gray'

        return <span className={`pg-pill ${className}`}>{row.contractStatus}</span>
      },
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton to={`/programs/timesheet/${row.id}`} className="pg-review-btn">
          Review
        </AppButton>
      ),
    },
  ]

  return (
    <div className="pg-page">
      <div className="pg-header">
        <h1 className="pg-title">State Programs Team Dashboard</h1>
        <div className="pg-subtitle">Oversight and supervisor management</div>
      </div>

      <div className="pg-section-title">Overview</div>

      <div className="pg-overview-grid">
        <div className="pg-card pg-metric-card">
          <div className="pg-metric-icon pg-icon-warm" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 7v5l3 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="pg-metric-label">Pending Timesheets</div>
          <div className="pg-metric-value">6</div>
          <div className="pg-metric-foot">Awaiting your review</div>
        </div>

        <div className="pg-card pg-metric-card">
          <div className="pg-metric-icon pg-icon-cool" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 12l3 3 5-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="pg-metric-label">Approved this month</div>
          <div className="pg-metric-value">2</div>
          <div className="pg-metric-foot">January 2026</div>
        </div>

        <div className="pg-card pg-metric-card">
          <div className="pg-metric-icon pg-icon-pink" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 8v5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M12 16h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pg-metric-label">PIP Recommended</div>
          <div className="pg-metric-value">1</div>
          <div className="pg-metric-foot">Active PIPs</div>
        </div>

        <div className="pg-overview-right">
          <div className="pg-card pg-wide-card">
            <div className="pg-wide-left">
              <div className="pg-wide-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 3h10v18H7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 7h6M9 11h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="pg-wide-text">
                <div className="pg-wide-title">Contract Review Required</div>
              </div>
            </div>
            <div className="pg-wide-value">1</div>
          </div>

          <div className="pg-card pg-wide-card">
            <div className="pg-wide-left">
              <div className="pg-wide-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 21a8 8 0 0 1 16 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="pg-wide-text">
                <div className="pg-wide-title">Supervisees</div>
              </div>
            </div>
            <div className="pg-wide-value">10</div>
          </div>
        </div>
      </div>

      <div className="pg-card pg-table-card">
        <div className="pg-table-title">Active Timesheet</div>
        <AppTable
          columns={columns}
          data={rows}
          rowKey="id"
          containerClassName="pg-table-container"
          tableClassName="pg-table"
        />
      </div>
    </div>
  )
}

export default ProgramsDashboard

