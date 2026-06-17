// src/HRIS/ETMS_HR/components/ECEWSDashboard.jsx
import { useState, useEffect } from 'react'
import AppButton from '../../../shared/AppButton'
import HrisOverviewSection from '../../shared/HrisOverviewSection'
import SetWorkCycleScheduleModal from '../../shared/SetWorkCycleScheduleModal'
import { getHrisDashboard } from '../../../services/api'
import './ECEWSDashboard.css'

const ECEWSDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getHrisDashboard('ecews')
        setDashboardData(res.data || res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return <div className="hris-page"><div className="hris-loading">Loading dashboard...</div></div>
  }

  if (!dashboardData) {
    return <div className="hris-page"><div className="hris-error">Failed to load dashboard data</div></div>
  }

  const {
    totalWorkforce = 0,
    activeEmployees = 0,
    onLeave = 0,
    activePips = 0,
    ecewsDistribution = { total: 0, categories: [] },
    timesheetCompliance = { monthlyData: [] },
    genderDiversity = { male: 0, female: 0, malePercentage: 0, femalePercentage: 0 },
    employmentStatus = { confirmed: 0, probation: 0 },
    leaveDistribution = { applied: 0, approved: 0, leaveTypes: [] },
    appraisalActivity = { goalSettingCompleted: 0, goalSettingPending: 0, annualAppraisalCompleted: 0, annualAppraisalPending: 0 }
  } = dashboardData

  // Workforce distribution rows from backend
  const workforceRows = ecewsDistribution.categories

  // Metric cards — all values come from backend
  const metricCards = [
    { label: 'Total Workforce', value: totalWorkforce, icon: 'group' },
    { label: 'Active', value: activeEmployees, icon: 'user' },
    { label: 'On leave', value: onLeave, icon: 'clock' },
  ]

  // Timesheet compliance data from backend
  const complianceData = timesheetCompliance.monthlyData

  // Simple bar chart height
  const maxCompliance = Math.max(...complianceData, 1)
  const chartHeight = 150
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="hris-page">
      <HrisOverviewSection />

      <div className="hris-org-title">Organization</div>

      <div className="hris-metrics">
        {metricCards.map((item) => (
          <div key={item.label} className="hris-metric-card">
            <div className="hris-metric-top">
              <span className="hris-metric-icon" aria-hidden="true">
                {item.icon === 'group' && (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3.5 14C3.5 12 5 10.8 7 10.8C9 10.8 10.5 12 10.5 14" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M9.5 14C9.5 12 11 10.8 13 10.8C15 10.8 16.5 12 16.5 14" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
                {item.icon === 'user' && (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="6.8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5.5 14.5C5.5 12.1 7.3 10.6 10 10.6C12.7 10.6 14.5 12.1 14.5 14.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M15.4 8.2H17.5M16.45 7.15V9.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
                {item.icon === 'clock' && (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 6.5V10L12.8 11.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <div className="hris-metric-label">{item.label}</div>
            </div>
            <div className="hris-metric-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="hris-summary-card">
        <div className="hris-summary-item">
          <div className="hris-summary-head">
            <div className="hris-summary-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <line x1="6" y1="2.5" x2="6" y2="6" stroke="currentColor" strokeWidth="1.4" />
                <line x1="14" y1="2.5" x2="14" y2="6" stroke="currentColor" strokeWidth="1.4" />
                <line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
            <div>
              <div className="hris-summary-title">Timesheet</div>
              <div className="hris-summary-meta">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
              <span className="hris-pill hris-pill-gray">Closed</span>
            </div>
          </div>
        </div>

        <div className="hris-summary-item">
          <div className="hris-summary-head">
            <div className="hris-summary-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="hris-summary-title">Leave</div>
              <div className="hris-summary-meta">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
              <span className="hris-pill hris-pill-green">Opened</span>
            </div>
          </div>
        </div>

        <div className="hris-summary-item">
          <div className="hris-summary-head">
            <div className="hris-summary-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="8" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="8.5" y="5" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="13" y="10" width="3" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </div>
            <div>
              <div className="hris-summary-title">Appraisal</div>
              <div className="hris-summary-meta">{new Date().getFullYear()}</div>
              <span className="hris-pill hris-pill-gray">Closed</span>
            </div>
          </div>
        </div>

        <div className="hris-summary-action">
          <AppButton type="button" className="hris-schedule-btn" onClick={() => setIsScheduleModalOpen(true)}>
            Set schedule
          </AppButton>
        </div>
      </div>

      <div className="hris-distribution-card">
        <div className="hris-distribution-title">Workforce Distribution</div>
        <div className="hris-distribution-content">
          <div className="hris-distribution-left">
            <div className="hris-team-dot-row">
              <span className="hris-team-dot" />
              <span className="hris-team-label">ECEWS Staff</span>
            </div>
            <div className="hris-bars">
              {workforceRows.map((row) => (
                <div key={row.label} className={`hris-bar-row ${row.label === 'Confirmed' ? 'is-highlight' : ''}`}>
                  <div className="hris-bar-left">
                    <span className="hris-bar-icon" aria-hidden="true">
                      {row.icon === 'check' && (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {row.icon === 'bag' && (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <rect x="2.5" y="5" width="11" height="8.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M5 5V4.2A3 3 0 0 1 11 4.2V5" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                      )}
                      {row.icon === 'clock' && (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M8 5.5V8L10.2 9.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      )}
                      {row.icon === 'x' && (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M5 5L11 11M11 5L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                    <div className="hris-bar-label">{row.label}</div>
                  </div>
                  <div className="hris-bar-value">{row.value}</div>
                </div>
              ))}
            </div>
            <div className="hris-total-row">
              <span className="hris-total-label">Total</span>
              <span className="hris-total-value">{ecewsDistribution.total}</span>
            </div>
          </div>
          <div className="hris-donut-wrap">
            <div className="hris-donut">
              <div className="hris-donut-inner">
                <div className="hris-donut-value">{ecewsDistribution.total}</div>
                <div className="hris-donut-label">Total Staff</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hris-analytics">
        <div className="hris-analytics-title">Analytics Visualization</div>

        <div className="hris-analytics-grid-top">
          {/* Leave Distribution */}
          <div className="hris-analytics-card">
            <div className="hris-analytics-card-title">Leave Distribution</div>
            <div className="hris-leave-distribution">
              <div className="hris-leave-status-col">
                <div className="hris-pie hris-pie-leave-main" />
                <div className="hris-analytics-legend hris-leave-status-legend">
                  <div className="hris-legend-row">
                    <span className="hris-legend-dot green" />
                    <span className="hris-legend-label">Applied</span>
                    <span className="hris-legend-value">{leaveDistribution.applied}</span>
                    <span className="hris-legend-pct">{leaveDistribution.applied + leaveDistribution.approved > 0 ? Math.round((leaveDistribution.applied / (leaveDistribution.applied + leaveDistribution.approved)) * 100) : 0}%</span>
                  </div>
                  <div className="hris-legend-row">
                    <span className="hris-legend-dot beige" />
                    <span className="hris-legend-label">Approved</span>
                    <span className="hris-legend-value">{leaveDistribution.approved}</span>
                    <span className="hris-legend-pct">{leaveDistribution.applied + leaveDistribution.approved > 0 ? Math.round((leaveDistribution.approved / (leaveDistribution.applied + leaveDistribution.approved)) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
              <div className="hris-leave-types-col">
                <div className="hris-leave-types-chart">
                  <div className="hris-pie hris-pie-leave-types" />
                  {leaveDistribution.leaveTypes.map((type, idx) => (
                    <span key={idx} className={`hris-leave-callout is-${type.type.toLowerCase()}`}>
                      {type.type} {type.percentage}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gender Diversity */}
          <div className="hris-analytics-card">
            <div className="hris-analytics-card-title">Gender Diversity</div>
            <div className="hris-pie hris-pie-gender" />
            <div className="hris-analytics-legend">
              <div className="hris-legend-row">
                <span className="hris-legend-dot green" />
                <span className="hris-legend-label">Male</span>
                <span className="hris-legend-value">{genderDiversity.male}</span>
                <span className="hris-legend-pct">{genderDiversity.malePercentage}%</span>
              </div>
              <div className="hris-legend-row">
                <span className="hris-legend-dot beige" />
                <span className="hris-legend-label">Female</span>
                <span className="hris-legend-value">{genderDiversity.female}</span>
                <span className="hris-legend-pct">{genderDiversity.femalePercentage}%</span>
              </div>
            </div>
          </div>

          {/* Employment Status */}
          <div className="hris-analytics-card">
            <div className="hris-analytics-card-title">Employment Status</div>
            <div className="hris-employment-bar">
              <span className="hris-employment-bar-fill" style={{ width: `${employmentStatus.confirmed + employmentStatus.probation > 0 ? (employmentStatus.confirmed / (employmentStatus.confirmed + employmentStatus.probation)) * 100 : 0}%` }} />
            </div>
            <div className="hris-employment-total">
              <span>Total</span>
              <strong>{employmentStatus.confirmed + employmentStatus.probation}</strong>
            </div>
            <div className="hris-analytics-legend">
              <div className="hris-legend-row">
                <span className="hris-legend-dot green" />
                <span className="hris-legend-label">Confirmed</span>
                <span className="hris-legend-value">{employmentStatus.confirmed}</span>
                <span className="hris-legend-pct">{employmentStatus.confirmed + employmentStatus.probation > 0 ? Math.round((employmentStatus.confirmed / (employmentStatus.confirmed + employmentStatus.probation)) * 100) : 0}%</span>
              </div>
              <div className="hris-legend-row">
                <span className="hris-legend-dot beige" />
                <span className="hris-legend-label">Probation</span>
                <span className="hris-legend-value">{employmentStatus.probation}</span>
                <span className="hris-legend-pct">{employmentStatus.confirmed + employmentStatus.probation > 0 ? Math.round((employmentStatus.probation / (employmentStatus.confirmed + employmentStatus.probation)) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hris-analytics-grid-bottom">
          {/* Timesheet Compliance Chart */}
          <div className="hris-analytics-card">
            <div className="hris-analytics-card-title">Timesheet Compliance (%)</div>
            <div className="hris-line-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: chartHeight + 40, marginTop: 20 }}>
              {complianceData.map((value, idx) => {
                const barHeight = (value / maxCompliance) * chartHeight
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: barHeight, width: '100%', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }} />
                    <div style={{ fontSize: 12, marginTop: 8 }}>{monthNames[idx]}</div>
                    <div style={{ fontSize: 11, fontWeight: 'bold' }}>{value}%</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Appraisal Activity */}
          <div className="hris-analytics-card">
            <div className="hris-analytics-card-header">
              <div className="hris-analytics-card-title">Appraisal Activity</div>
              <div className="hris-mini-legend">
                <span><span className="dot pink" aria-hidden="true" /> Goal setting</span>
                <span><span className="dot green" aria-hidden="true" /> Annual Appraisal</span>
              </div>
            </div>
            <div className="hris-appraisal-charts-row">
              <div className="hris-appraisal-chart-block">
                <div className="hris-appraisal-chart-unit">
                  <div className="hris-appraisal-y-axis" aria-hidden="true">
                    {[100, 75, 50, 25, 0].map((tick) => (<span key={tick}>{tick}</span>))}
                  </div>
                  <div className="hris-appraisal-plot-area">
                    <div className="hris-appraisal-bar-wrap">
                      <div className="hris-appraisal-bar pink" style={{ height: `${appraisalActivity.goalSettingCompleted}%` }} />
                    </div>
                    <div className="hris-appraisal-bar-wrap">
                      <div className="hris-appraisal-bar pink" style={{ height: `${appraisalActivity.goalSettingPending}%` }} />
                    </div>
                  </div>
                </div>
                <div className="hris-appraisal-x-labels">
                  <span>Completed</span>
                  <span>Pending</span>
                </div>
              </div>
              <div className="hris-appraisal-chart-block">
                <div className="hris-appraisal-chart-unit">
                  <div className="hris-appraisal-y-axis" aria-hidden="true">
                    {[100, 75, 50, 25, 0].map((tick) => (<span key={tick}>{tick}</span>))}
                  </div>
                  <div className="hris-appraisal-plot-area">
                    <div className="hris-appraisal-bar-wrap">
                      <div className="hris-appraisal-bar green" style={{ height: `${appraisalActivity.annualAppraisalCompleted}%` }} />
                    </div>
                    <div className="hris-appraisal-bar-wrap">
                      <div className="hris-appraisal-bar green" style={{ height: `${appraisalActivity.annualAppraisalPending}%` }} />
                    </div>
                  </div>
                </div>
                <div className="hris-appraisal-x-labels">
                  <span>Completed</span>
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SetWorkCycleScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  )
}

export default ECEWSDashboard