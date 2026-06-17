// src/HRIS/shared/SetWorkCycleScheduleModal.jsx
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import { createWorkCycle, getActiveWorkCycles } from '../../services/api'
import './SetWorkCycleScheduleModal.css'

const defaultCycleTypeOptions = [
  { value: 'timesheet', label: 'Timesheet' },
  { value: 'leave', label: 'Leave' },
  { value: 'appraisal', label: 'Appraisal' },
]

const defaultAudienceOptions = [
  { value: 'all-staff', label: 'All Staff' },
  { value: 'ace-5-staff', label: 'ACE 5 Staff' },
  { value: 'speed-staff', label: 'SPEED Staff' },
  { value: 'gf-staff', label: 'GF Staff' },
  { value: 'auxilary-staff', label: 'Auxilary Staff' },
]

const SetWorkCycleScheduleModal = ({
  isOpen,
  onClose,
  cycleTypeOptions = defaultCycleTypeOptions,
  audienceOptions = defaultAudienceOptions,
}) => {
  const [cycleType, setCycleType] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [repeat, setRepeat] = useState('')
  const [cycleAudience, setCycleAudience] = useState('')
  const [reminder, setReminder] = useState('')
  const [createAnnouncementForCycle, setCreateAnnouncementForCycle] = useState(false)
  const [isActiveCyclesOpen, setIsActiveCyclesOpen] = useState(false)
  const [activeCycles, setActiveCycles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [publishing, setPublishing] = useState(false)

  const fetchActiveCycles = async () => {
    try {
      const res = await getActiveWorkCycles()
      // The API returns the array directly, or wrapped in { data: [...] }
      setActiveCycles(Array.isArray(res) ? res : (res.data || []))
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleActiveCycles = async () => {
    if (createAnnouncementForCycle) return
    const newOpen = !isActiveCyclesOpen
    setIsActiveCyclesOpen(newOpen)
    if (newOpen && activeCycles.length === 0) {
      await fetchActiveCycles()
    }
  }

  const handlePublish = async () => {
    if (!cycleType || !startDate || !endDate || !repeat || !cycleAudience) {
      setError('Please fill all required fields')
      return
    }
    if (endDate < startDate) {
      setError('End date must be on or after the start date')
      return
    }
    setPublishing(true)
    setError('')
    try {
      await createWorkCycle({
        cycleType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        repeat,
        audience: cycleAudience,
        createAnnouncement: createAnnouncementForCycle,
        reminder: createAnnouncementForCycle ? reminder : null,
      })
      onClose()
      // Reset form
      setCycleType('')
      setStartDate(null)
      setEndDate(null)
      setRepeat('')
      setCycleAudience('')
      setReminder('')
      setCreateAnnouncementForCycle(false)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to create work cycle')
    } finally {
      setPublishing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="hris-schedule-modal-overlay" role="presentation" onClick={onClose}>
      <div className="hris-schedule-modal" role="dialog" aria-modal="true" aria-label="Set work cycle schedule" onClick={e => e.stopPropagation()}>
        <AppButton type="button" className="hris-schedule-modal-close" aria-label="Close schedule popup" onClick={onClose}>×</AppButton>

        <div className="hris-schedule-modal-title">Set work cycle schedule</div>
        <p className="hris-schedule-modal-subtitle">Define timelines for work cycle processes.</p>

        {error && <div className="hris-schedule-error">{error}</div>}

        <div className="hris-schedule-field">
          <label className="hris-schedule-label">Cycle type</label>
          <AppDropdown className="hris-schedule-dropdown" buttonClassName="hris-schedule-dropdown-btn" value={cycleType} onChange={setCycleType} placeholder="Select cycle type" options={cycleTypeOptions} />
        </div>

        <div className="hris-schedule-row">
          <div className="hris-schedule-col">
            <label className="hris-schedule-label">Start date</label>
            <DatePicker
              className="hris-schedule-datepicker"
              wrapperClassName="hris-schedule-datepicker-wrapper"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Select start date"
              dateFormat="MMM d, yyyy"
              minDate={new Date()}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <div className="hris-schedule-col">
            <label className="hris-schedule-label">End date</label>
            <DatePicker
              className="hris-schedule-datepicker"
              wrapperClassName="hris-schedule-datepicker-wrapper"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="Select end date"
              dateFormat="MMM d, yyyy"
              minDate={startDate || new Date()}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>

        <div className="hris-schedule-field">
          <label className="hris-schedule-label">Repeat</label>
          <AppDropdown className="hris-schedule-dropdown" buttonClassName="hris-schedule-dropdown-btn" value={repeat} onChange={setRepeat} placeholder="Select" options={[
            { value: 'once', label: 'Once' }, { value: 'every-month', label: 'Every Month' }
          ]} />
        </div>

        <div className="hris-schedule-field">
          <label className="hris-schedule-label">Audience</label>
          <AppDropdown className="hris-schedule-dropdown" buttonClassName="hris-schedule-dropdown-btn" value={cycleAudience} onChange={setCycleAudience} placeholder="Select" options={audienceOptions} />
        </div>

        <div className="hris-schedule-toggle-row">
          <AppButton type="button" className={`hris-schedule-toggle ${createAnnouncementForCycle ? 'active' : ''}`} onClick={() => setCreateAnnouncementForCycle(v => !v)} aria-pressed={createAnnouncementForCycle}>
            <span className="hris-schedule-toggle-knob" />
          </AppButton>
          <span className="hris-schedule-toggle-label">Create an announcement for this cycle</span>
          <span className="hris-schedule-info" aria-hidden="true">i</span>
        </div>

        {createAnnouncementForCycle && (
          <div className="hris-schedule-field">
            <label className="hris-schedule-label">Reminder</label>
            <AppDropdown className="hris-schedule-dropdown" buttonClassName="hris-schedule-dropdown-btn" value={reminder} onChange={setReminder} placeholder="Select" options={[
              { value: 'none', label: 'None' }, { value: 'one-day-before', label: '1 day before' },
              { value: 'three-days-before', label: '3 days before' }, { value: 'on-due-date', label: 'On Due Date' }
            ]} />
          </div>
        )}

        <div className="hris-schedule-modal-actions">
          <AppButton type="button" className="hris-schedule-cancel-btn" onClick={onClose}>Cancel</AppButton>
          <AppButton type="button" className="hris-schedule-publish-btn" onClick={handlePublish} disabled={publishing}>{publishing ? 'Publishing...' : 'Publish'}</AppButton>
        </div>

        <AppButton type="button" className={`hris-schedule-active-cycles ${createAnnouncementForCycle ? 'disabled' : ''}`} onClick={handleToggleActiveCycles}>
          Active cycles <span aria-hidden="true">{isActiveCyclesOpen ? '▲' : '▼'}</span>
        </AppButton>

        {!createAnnouncementForCycle && isActiveCyclesOpen && (
          <div className="hris-active-cycle-list">
            {activeCycles.length === 0 && !loading && <div className="hris-no-active-cycles">No active cycles</div>}
            {activeCycles.map(cycle => (
              <div key={cycle.id} className="hris-active-cycle-card">
                <div className="hris-active-cycle-left">
                  <span className="hris-active-cycle-icon">
                    <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="3.5" y="4.5" width="13" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.3" /><line x1="6.2" y1="2.8" x2="6.2" y2="6.1" /><line x1="13.8" y1="2.8" x2="13.8" y2="6.1" /><line x1="3.5" y1="8" x2="16.5" y2="8" /><circle cx="8.2" cy="11.5" r="1.1" fill="currentColor" /><path d="M11.2 13.8H14.2" stroke="currentColor" strokeWidth="1.3" /></svg>
                  </span>
                  <div>
                    <div className="hris-active-cycle-title">{cycle.cycleType} Cycle</div>
                    <div className="hris-active-cycle-meta">
                      {cycle.startDate
                        ? new Date(cycle.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : cycle.startDay} - {cycle.endDate
                          ? new Date(cycle.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : cycle.endDay}
                    </div>
                    <div className="hris-active-cycle-meta">{cycle.audience}</div>
                  </div>
                </div>
                <AppButton type="button" className="hris-active-cycle-edit" aria-label="Edit active cycle">✎</AppButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SetWorkCycleScheduleModal