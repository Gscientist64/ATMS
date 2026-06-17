import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import { staffService } from '../../services/api'
import './StaffTimesheet.css'

const HISTORY_COLUMNS = [
  { key: 'periodTotal', header: 'Period Total', accessor: 'periodTotal' },
  { key: 'monthYear', header: 'Month', accessor: 'monthYear' },
  { key: 'status', header: 'Status', accessor: 'status' },
]

const StaffTimesheet = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [currentTimesheet, setCurrentTimesheet] = useState(null)
  const [timesheetHistory, setTimesheetHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, currentData, historyData] = await Promise.all([
          staffService.getProfile(),
          staffService.getCurrentTimesheet(),
          staffService.getTimesheets()
        ])
        setProfile(profileData)
        setCurrentTimesheet(currentData)
        setTimesheetHistory(Array.isArray(historyData) ? historyData : [])
      } catch (err) {
        console.error('Error fetching timesheet data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="staff-timesheet-page">Loading...</div>

  return (
    <div className="staff-timesheet-page">
      <header className="staff-timesheet-header">
        <div className="staff-timesheet-header-text">
          <h1 className="staff-timesheet-title">Timesheet Management</h1>
          <p className="staff-timesheet-subtitle">Track and manage work hours</p>
        </div>
        <AppButton
          type="button"
          className="staff-timesheet-sign-btn"
          onClick={() => navigate('/staff/timesheet/sign')}
        >
          Sign Timesheet
        </AppButton>
      </header>

      {currentTimesheet && (
        <section className="staff-timesheet-card">
          <h2 className="staff-timesheet-card-title">Current Timesheet</h2>
          <div className="staff-timesheet-current">
            <div className="staff-timesheet-current-info">
              <div className="staff-timesheet-period">{currentTimesheet.month} {currentTimesheet.year}</div>
              <div className="staff-timesheet-working-days">Total working days: {currentTimesheet.totalWorkingDays}</div>
            </div>
            <span className="staff-timesheet-hours-badge">{currentTimesheet.totalHours} Total Hours</span>
          </div>
        </section>
      )}

      <section className="staff-timesheet-card">
        <h2 className="staff-timesheet-card-title">Timesheet history</h2>
        <AppTable
          columns={HISTORY_COLUMNS}
          data={timesheetHistory.length > 0 ? timesheetHistory.map(t => ({
            ...t,
            monthYear: `${t.month} ${t.year}`
          })) : []}
          rowKey="id"
          containerClassName="staff-timesheet-table-wrap"
          tableClassName="staff-timesheet-table"
        />
      </section>
    </div>
  )
}

export default StaffTimesheet
