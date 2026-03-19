import './EcewsSupervisorDashboard.css'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { useNavigate } from 'react-router-dom'

const EcewsSupervisorDashboard = () => {
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
      id: 'pip',
      label: 'PIP Advised',
      value: 1,
      detail: 'Active PIPs',
      iconBg: '#FEF2F2',
      iconColor: '#E11D48',
    },
    {
      id: 'contract',
      label: 'Contract Review Required',
      value: 1,
      detail: '',
      iconBg: '#EEF2FF',
      iconColor: '#4B5563',
    },
    {
      id: 'supervisees',
      label: 'Supervisees',
      value: 10,
      detail: '',
      iconBg: '#E5E7EB',
      iconColor: '#4B5563',
    },
  ]

  const mainOverviewCards = overviewCards.slice(0, 3)
  const sideOverviewCards = overviewCards.slice(3)

  const activeTimesheets = [
    {
      id: 1,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      gonSupervisor: 'Amina Mohammed',
      status: 'ECEWS Review',
    },
    {
      id: 2,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      gonSupervisor: 'Amina Mohammed',
      status: 'ECEWS Review',
    },
    {
      id: 3,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      gonSupervisor: 'Amina Mohammed',
      status: 'ECEWS Review',
    },
    {
      id: 4,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      gonSupervisor: 'Amina Mohammed',
      status: 'ECEWS Review',
    },
    {
      id: 5,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      gonSupervisor: 'Amina Mohammed',
      status: 'ECEWS Review',
    },
    {
      id: 6,
      staffName: 'John Adeyemi',
      submissionDate: '05-02-2026',
      gonSupervisor: 'Amina Mohammed',
      status: 'ECEWS Review',
    },
  ]

  const activeTimesheetColumns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    { header: 'GON Supervisor', accessor: 'gonSupervisor' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <span className="ecews-status-badge">{row.status}</span>,
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton
          type="button"
          className="ecews-review-btn"
          onClick={() => navigate(`/ecews-supervisor/timesheet/${row.id}`)}
        >
          Review
        </AppButton>
      ),
    },
  ]

  return (
    <div className="ecews-dashboard">
      <div className="ecews-header">
        <h1 className="ecews-title">ECEWS Supervisor Dashboard</h1>
        <p className="ecews-subtitle">Secondary review and performance management</p>
      </div>

      <section className="ecews-section">
        <h2 className="ecews-section-title">Overview</h2>
        <div className="ecews-overview-row">
          <div className="ecews-overview-grid">
            {mainOverviewCards.map((card) => (
              <div key={card.id} className="ecews-overview-card ecews-overview-card-main">
                <div
                  className="ecews-overview-icon-wrapper"
                  style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                >
                  {card.id === 'pending' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M10 6V10L12.5 12.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {card.id === 'approved' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M7.5 10L9 11.5L12.5 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {card.id === 'pip' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M10 6V10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="10" cy="13" r="0.75" fill="currentColor" />
                    </svg>
                  )}
                </div>
                <div className="ecews-overview-main">
                  <div className="ecews-overview-label">{card.label}</div>
                  <div className="ecews-overview-value">{card.value}</div>
                  {card.detail && (
                    <div className="ecews-overview-detail">{card.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="ecews-overview-side">
            {sideOverviewCards.map((card) => (
              <div key={card.id} className="ecews-overview-card ecews-overview-card-side">
                <div
                  className="ecews-overview-icon-wrapper"
                  style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                >
                  {card.id === 'contract' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect
                        x="4"
                        y="3"
                        width="12"
                        height="14"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="7"
                        y1="7"
                        x2="13"
                        y2="7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="7"
                        y1="10"
                        x2="11"
                        y2="10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                  {card.id === 'supervisees' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M5 16C5 13.7909 6.79086 12 9 12H11C13.2091 12 15 13.7909 15 16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="ecews-overview-main">
                  <div className="ecews-overview-label">{card.label}</div>
                  <div className="ecews-overview-value">{card.value}</div>
                  {card.detail && (
                    <div className="ecews-overview-detail">{card.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ecews-section">
        <h2 className="ecews-section-title">Active Timesheet</h2>
        <div className="ecews-table-card">
          <AppTable
            columns={activeTimesheetColumns}
            data={activeTimesheets}
            rowKey="id"
            containerClassName="ecews-table-container"
            tableClassName="ecews-table"
          />
        </div>
      </section>
    </div>
  )
}

export default EcewsSupervisorDashboard

