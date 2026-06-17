// src/HRIS/ETMS_HR/components/UnifiedDashboard.jsx

import { useState, useEffect } from 'react'
import AppButton from '../../../shared/AppButton'
import HrisOverviewSection from '../../shared/HrisOverviewSection'
import SetWorkCycleScheduleModal from '../../shared/SetWorkCycleScheduleModal'
import { getHrisDashboard } from '../../../services/api'
import './UnifiedDashboard.css'
import './ECEWSDashboard.css'

const UnifiedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getHrisDashboard()
        setDashboardData(res.data || res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className="unified-page"><div className="unified-loading">Loading dashboard...</div></div>
  if (!dashboardData) return <div className="unified-page"><div className="unified-error">Failed to load dashboard data</div></div>

  const {
      totalWorkforce,
      activeEmployees,
      onLeave,
      activePips,
      ecewsDistribution,
      ancillaryDistribution,
      timesheetCompliance,
      genderDiversity,
      employmentStatus,
      leaveDistribution,
      appraisalActivity
  } = dashboardData || {}

  // Metric cards
  const unifiedMetricCards = [
    { label: 'Total Workforce', value: totalWorkforce || 591, icon: 'group' },
    { label: 'Active', value: activeEmployees || 368, icon: 'user' },
    { label: 'On leave', value: onLeave || 123, icon: 'clock' },
    { label: 'Active PIPs', value: activePips || 12, icon: 'pip' },
  ]

  // ECEWS workforce rows
  const ecewsRows = ecewsDistribution?.categories || [
    { label: 'Confirmed', value: 0, icon: 'check' },
    { label: 'Probation', value: 0, icon: 'bag' },
    { label: 'On Leave', value: 0, icon: 'clock' },
  ]

  // Ancillary workforce rows
  const ancillaryRows = ancillaryDistribution?.categories || [
    { label: 'Active', value: 342, icon: 'check' },
    { label: 'On PIP', value: 28, icon: 'pip' },
    { label: 'Flagged', value: 15, icon: 'flag' },
  ]

  // Timesheet compliance data (array of 12 numbers)
  const complianceData = timesheetCompliance?.monthlyData || [65, 70, 72, 68, 75, 78, 80, 82, 85, 83, 88, 90]

  // Leave distribution
  const leaveData = leaveDistribution || {
    applied: 12,
    approved: 8,
    leaveTypes: [
      { type: 'Annual', count: 10, percentage: 50 },
      { type: 'Maternity', count: 4, percentage: 20 },
      { type: 'Sick', count: 3, percentage: 15 },
      { type: 'Exam', count: 3, percentage: 15 },
    ]
  }

  // Appraisal activity
  const appraisal = appraisalActivity || {
    goalSettingCompleted: 75,
    goalSettingPending: 28,
    annualAppraisalCompleted: 10,
    annualAppraisalPending: 90
  }

  // Gender diversity
  const gender = genderDiversity || { male: 231, female: 154 }

  // Employment status
  const employment = employmentStatus || { confirmed: 368, probation: 17 }

  // Chart height
  const maxCompliance = Math.max(...complianceData, 1)
  const chartHeight = 150
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Helper for icon display
  const getIconSymbol = (icon) => {
    if (icon === 'check') return '✓'
    if (icon === 'pip') return '!'
    if (icon === 'flag') return '⚠'
    if (icon === 'bag') return '◍'
    if (icon === 'clock') return '◔'
    return '•'
  }

  return (
    <div className="unified-page">
      <HrisOverviewSection />

      <div className="unified-section-title">Organization</div>

      <div className="hris-metrics unified-org-metrics">
        {unifiedMetricCards.map((item) => (
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
                {item.icon === 'pip' && (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2.5L16.5 7.5V12.5C16.5 15.8 13.8 18 10 18C6.2 18 3.5 15.8 3.5 12.5V7.5L10 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M10 7V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="10" cy="13.2" r="0.9" fill="currentColor" />
                  </svg>
                )}
              </span>
              <div className="hris-metric-label">{item.label}</div>
            </div>
            <div className="hris-metric-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="hris-summary-card unified-org-summary">
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
          <AppButton type="button" className="hris-schedule-btn unified-schedule-btn" onClick={() => setIsScheduleModalOpen(true)}>
            Set schedule
          </AppButton>
        </div>
      </div>

      <div className="unified-distribution-card">
        <div className="unified-distribution-title">Workforce Distribution</div>
        <div className="unified-distribution-grid">
          {/* ECEWS Staff Section */}
          <div>
            <div className="unified-team-row">
              <span className="unified-team-dot ecews" />
              <span className="unified-team-label">ECEWS Staff</span>
            </div>
            <div className="unified-row-list">
              {ecewsRows.map((row) => (
                <div key={row.label} className="unified-row-item">
                  <span className="unified-row-left">
                    <span className="unified-row-icon" aria-hidden="true">{getIconSymbol(row.icon)}</span>
                    <span>{row.label}</span>
                  </span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
            <div className="unified-total-row">
              <span>Total</span>
              <strong>{ecewsDistribution?.total || ecewsRows.reduce((sum, r) => sum + r.value, 0)}</strong>
            </div>
          </div>

          {/* Center Donut */}
          <div className="unified-center-donut">
            <div className="unified-donut">
              <div className="unified-donut-inner">
                <div className="unified-donut-value">{totalWorkforce || 591}</div>
                <div className="unified-donut-label">Total Staff</div>
              </div>
            </div>
          </div>

          {/* Ancillary Staff Section */}
          <div>
            <div className="unified-team-row">
              <span className="unified-team-dot ancillary" />
              <span className="unified-team-label">Ancillary Staff</span>
            </div>
            <div className="unified-row-list">
              {ancillaryRows.map((row) => (
                <div key={row.label} className="unified-row-item">
                  <span className="unified-row-left">
                    <span className="unified-row-icon" aria-hidden="true">{getIconSymbol(row.icon)}</span>
                    <span>{row.label}</span>
                  </span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
            <div className="unified-total-row">
              <span>Total</span>
              <strong>{ancillaryDistribution?.total || ancillaryRows.reduce((sum, r) => sum + r.value, 0)}</strong>
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
                    <span className="hris-legend-value">{leaveData.applied}</span>
                    <span className="hris-legend-pct">{Math.round((leaveData.applied / (leaveData.applied + leaveData.approved)) * 100)}%</span>
                  </div>
                  <div className="hris-legend-row">
                    <span className="hris-legend-dot beige" />
                    <span className="hris-legend-label">Approved</span>
                    <span className="hris-legend-value">{leaveData.approved}</span>
                    <span className="hris-legend-pct">{Math.round((leaveData.approved / (leaveData.applied + leaveData.approved)) * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="hris-leave-types-col">
                <div className="hris-leave-types-chart">
                  <div className="hris-pie hris-pie-leave-types" />
                  {leaveData.leaveTypes.map((type, idx) => (
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
                <span className="hris-legend-value">{gender.male}</span>
                <span className="hris-legend-pct">{Math.round((gender.male / (gender.male + gender.female)) * 100)}%</span>
              </div>
              <div className="hris-legend-row">
                <span className="hris-legend-dot beige" />
                <span className="hris-legend-label">Female</span>
                <span className="hris-legend-value">{gender.female}</span>
                <span className="hris-legend-pct">{Math.round((gender.female / (gender.male + gender.female)) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Employment Status */}
          <div className="hris-analytics-card">
            <div className="hris-analytics-card-title">Employment Status</div>
            <div className="hris-employment-bar">
              <span className="hris-employment-bar-fill" style={{ width: `${(employment.confirmed / (employment.confirmed + employment.probation)) * 100}%` }} />
            </div>
            <div className="hris-employment-total">
              <span>Total</span>
              <strong>{employment.confirmed + employment.probation}</strong>
            </div>
            <div className="hris-analytics-legend">
              <div className="hris-legend-row">
                <span className="hris-legend-dot green" />
                <span className="hris-legend-label">Confirmed</span>
                <span className="hris-legend-value">{employment.confirmed}</span>
                <span className="hris-legend-pct">{Math.round((employment.confirmed / (employment.confirmed + employment.probation)) * 100)}%</span>
              </div>
              <div className="hris-legend-row">
                <span className="hris-legend-dot beige" />
                <span className="hris-legend-label">Probation</span>
                <span className="hris-legend-value">{employment.probation}</span>
                <span className="hris-legend-pct">{Math.round((employment.probation / (employment.confirmed + employment.probation)) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hris-analytics-grid-bottom">
          {/* Timesheet Compliance */}
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
                      <div className="hris-appraisal-bar pink" style={{ height: `${appraisal.goalSettingCompleted}%` }} />
                    </div>
                    <div className="hris-appraisal-bar-wrap">
                      <div className="hris-appraisal-bar pink" style={{ height: `${appraisal.goalSettingPending}%` }} />
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
                      <div className="hris-appraisal-bar green" style={{ height: `${appraisal.annualAppraisalCompleted}%` }} />
                    </div>
                    <div className="hris-appraisal-bar-wrap">
                      <div className="hris-appraisal-bar green" style={{ height: `${appraisal.annualAppraisalPending}%` }} />
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

export default UnifiedDashboard