import { useNavigate } from 'react-router-dom'
import './GonSupervisorDashboard.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'

const GonSupervisorDashboard = () => {
  const navigate = useNavigate()

  const overviewCards = [
    {
      id: 'pending',
      label: 'Pending Timesheets',
      value: 6,
      detail: 'Awaiting your review',
      iconBg: '#FFF7E6',
      iconColor: '#F59E0B',
    },
    {
      id: 'approved',
      label: 'Approved this month',
      value: 2,
      detail: 'January 2026',
      iconBg: '#ECFDF3',
      iconColor: '#16A34A',
    },
    {
      id: 'returned',
      label: 'Returned for correction',
      value: 1,
      detail: 'Requires resubmission',
      iconBg: '#FEF2F2',
      iconColor: '#E11D48',
    },
    {
      id: 'supervisees',
      label: 'Supervisees',
      value: 10,
      detail: 'No of Subordinates',
      iconBg: '#E5E7EB',
      iconColor: '#4B5563',
    },
  ]

  const activeTimesheets = [
    { id: 1, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review' },
    { id: 2, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review' },
    { id: 3, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review' },
    { id: 4, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review' },
    { id: 5, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review' },
    { id: 6, staffName: 'John Adeyemi', department: 'Field Operations', month: 'January 2026', submissionDate: '05-02-2026', status: 'GON Review' },
  ]

  const activeTimesheetColumns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Department', accessor: 'department' },
    { header: 'Month', accessor: 'month' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <span className="gon-status-badge">{row.status}</span>,
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton
          type="button"
          className="gon-review-btn"
          onClick={() => navigate(`/gon-supervisor/approval-action/${row.id}`)}
        >
          Review
        </AppButton>
      ),
    },
  ]

  return (
    <div className="gon-dashboard">
      <div className="gon-header">
        <h1 className="gon-title">GON Supervisor</h1>
        <p className="gon-subtitle">Review and approve staff timesheets</p>
      </div>

      <section className="gon-section">
        <h2 className="gon-section-title">Overview</h2>
        <div className="gon-overview-grid">
          {overviewCards.map((card) => (
            <div key={card.id} className="gon-overview-card">
              <div
                className="gon-overview-icon-wrapper"
                style={{ backgroundColor: card.iconBg, color: card.iconColor }}
              >
                {card.id === 'pending' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 8V12L14.5 14.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.id === 'approved' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {card.id === 'returned' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M9 9L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15 9L9 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {card.id === 'supervisees' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M6 19C6 15.6863 8.68629 13 12 13C15.3137 13 18 15.6863 18 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div className="gon-overview-text">
                <div className="gon-overview-label">{card.label}</div>
                <div className="gon-overview-value">{card.value}</div>
                <div className="gon-overview-detail">{card.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gon-section">
        <h2 className="gon-section-title">Active Timesheet</h2>
        <div className="gon-table-card">
          <AppTable
            columns={activeTimesheetColumns}
            data={activeTimesheets}
            rowKey="id"
            containerClassName="gon-table-container"
            tableClassName="gon-table"
          />
        </div>
      </section>
    </div>
  )
}

export default GonSupervisorDashboard

