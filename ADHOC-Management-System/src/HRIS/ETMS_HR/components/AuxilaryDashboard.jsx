import { useEffect, useState } from 'react'
import AppButton from '../../../shared/AppButton'
import HrisOverviewSection from '../../shared/HrisOverviewSection'
import SetWorkCycleScheduleModal from '../../shared/SetWorkCycleScheduleModal'
import { getHrisDashboard } from '../../../services/api'
import './AuxilaryDashboard.css'

const AuxilaryDashboard = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusRows, setStatusRows] = useState([
    { label: 'Active', value: 0, icon: 'check' },
    { label: 'On PIP', value: 0, icon: 'pip' },
    { label: 'Flagged', value: 0, icon: 'flag' },
    { label: 'Inactive', value: 0, icon: 'x' },
  ])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await getHrisDashboard('ancillary')
      const result = data.data || data
      setDashboardData(result)
      if (result) {
        setStatusRows([
          { label: 'Active', value: result.activeEmployees || 0, icon: 'check' },
          { label: 'On PIP', value: result.activePips || 0, icon: 'pip' },
          { label: 'Flagged', value: result.ancillaryDistribution?.flagged || 0, icon: 'flag' },
          { label: 'Inactive', value: (result.totalWorkforce || 0) - (result.activeEmployees || 0), icon: 'x' },
        ])
      }
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const totalWorkforce = dashboardData?.totalWorkforce || 0
  const activeEmployees = dashboardData?.activeEmployees || 0
  const activePips = dashboardData?.activePips || 0
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  if (loading) return <div className="aux-page"><div className="aux-loading">Loading dashboard...</div></div>

  return (
    <div className="aux-page">
      <HrisOverviewSection />

      <div className="aux-section-title">Organization</div>

      <div className="aux-metrics">
        <div className="aux-metric-card">
          <div className="aux-metric-label">Total Workforce</div>
          <div className="aux-metric-value">{totalWorkforce}</div>
        </div>
        <div className="aux-metric-card">
          <div className="aux-metric-label">Active</div>
          <div className="aux-metric-value">{activeEmployees}</div>
        </div>
        <div className="aux-metric-card">
          <div className="aux-metric-label">Active PIPs</div>
          <div className="aux-metric-value">{activePips}</div>
        </div>
      </div>

      <div className="aux-timesheet-card">
        <div>
          <div className="aux-timesheet-title">Timesheet</div>
          <div className="aux-timesheet-meta">{currentMonth}</div>
          <span className="aux-pill">Closed</span>
        </div>
        <AppButton
          type="button"
          className="aux-schedule-btn"
          onClick={() => setIsScheduleModalOpen(true)}
        >
          Set schedule
        </AppButton>
      </div>

      <div className="aux-distribution-card">
        <div className="aux-distribution-title">Workforce Distribution</div>
        <div className="aux-dot-row">
          <span className="aux-dot" />
          <span className="aux-dot-label">Ancillary Staff</span>
        </div>

        <div className="aux-distribution-content">
          <div className="aux-donut">
            <div className="aux-donut-inner">
              <div className="aux-donut-value">{totalWorkforce}</div>
              <div className="aux-donut-label">Total Staff</div>
            </div>
          </div>

          <div className="aux-status-list">
            {statusRows.map((row) => (
              <div key={row.label} className="aux-status-row">
                <span className="aux-status-left">
                  <span className="aux-status-icon" aria-hidden="true">
                    {row.icon === 'check' && '✓'}
                    {row.icon === 'pip' && '!'}
                    {row.icon === 'flag' && '⚠'}
                    {row.icon === 'x' && '×'}
                  </span>
                  <span>{row.label}</span>
                </span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="aux-analytics">
        <div className="aux-analytics-title">Analytics Visualization</div>

        <div className="aux-analytics-grid">
          <div className="aux-analytics-card">
            <div className="aux-analytics-card-title">Timesheet Compliance</div>
            <div className="aux-compliance-chart" aria-hidden="true">
              <svg viewBox="0 0 760 190" preserveAspectRatio="none" className="aux-compliance-svg">
                <path
                  d="M0,34 C40,40 58,46 82,38 C110,30 156,34 210,33 C260,32 318,34 370,33 C420,32 470,30 530,44 C590,58 632,42 682,34 C718,30 740,31 760,32 L760,170 L0,170 Z"
                  fill="#e7e9eb"
                />
              </svg>
              <div className="aux-compliance-y">
                {[100, 75, 50, 25, 0].map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
              <div className="aux-compliance-x">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="aux-analytics-card">
            <div className="aux-analytics-card-title">Gender Diversity</div>
            <div className="aux-gender-chart-wrap">
              <div className="aux-gender-pie" />
            </div>
            <div className="aux-gender-legend">
              <div className="aux-gender-row">
                <span className="aux-gender-dot male" />
                <span className="aux-gender-label">Male</span>
                <strong>231</strong>
                <span>60%</span>
              </div>
              <div className="aux-gender-row">
                <span className="aux-gender-dot female" />
                <span className="aux-gender-label">Female</span>
                <strong>154</strong>
                <span>40%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SetWorkCycleScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        cycleTypeOptions={[
          { value: 'timesheet', label: 'Timesheet' },
          { value: 'appraisal', label: 'Appraisal' },
        ]}
        audienceOptions={[
          { value: 'auxilary-staff', label: 'Auxilary Staff' },
        ]}
      />
    </div>
  )
}

export default AuxilaryDashboard
