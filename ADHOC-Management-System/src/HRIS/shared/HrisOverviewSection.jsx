// src/HRIS/shared/HrisOverviewSection.jsx
import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import { createAnnouncement } from '../../services/api'
import './HrisOverviewSection.css'

const HrisOverviewSection = () => {
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [audience, setAudience] = useState('everyone')
  const [expiresDate, setExpiresDate] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishSuccess, setPublishSuccess] = useState(false)
  const datePickerRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const activeGroup = location.pathname.startsWith('/hris/ancillary-staff')
    ? 'ancillary'
    : location.pathname.startsWith('/hris/system-settings')
      ? 'unified'
      : 'ecews'

  const goToGroup = (group) => {
    if (group === 'ecews') navigate('/hris/ecews-dashboard')
    if (group === 'ancillary') navigate('/hris/ancillary-staff')
    if (group === 'unified') navigate('/hris/system-settings')
  }

  const resetAnnouncementForm = () => {
    setTitle('')
    setMessage('')
    setPriority('normal')
    setAudience('everyone')
    setExpiresDate(null)
    setPublishError('')
  }

  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) {
      setPublishError('Title and message are required')
      return
    }
    setPublishing(true)
    setPublishError('')
    try {
      await createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        priority,
        audience,
        expiresAt: expiresDate ? expiresDate.toISOString() : null,
      })
      setPublishSuccess(true)
      resetAnnouncementForm()
      setTimeout(() => setPublishSuccess(false), 3000)
      // Optionally close the announcement panel
      setIsAnnouncementOpen(false)
    } catch (err) {
      console.error(err)
      setPublishError(err.response?.data?.message || 'Failed to publish announcement')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <>
      <div className="hris-header">
        <div className="hris-header-top">
          <h1 className="hris-title">Welcome HR Admin</h1>
          <div className="hris-header-switch" role="tablist" aria-label="Group filter">
            <AppButton type="button" className={`hris-header-switch-btn ${activeGroup === 'ecews' ? 'active' : ''}`} onClick={() => goToGroup('ecews')}>ECEWS</AppButton>
            <AppButton type="button" className={`hris-header-switch-btn ${activeGroup === 'ancillary' ? 'active' : ''}`} onClick={() => goToGroup('ancillary')}>Ancillary</AppButton>
            <AppButton type="button" className={`hris-header-switch-btn ${activeGroup === 'unified' ? 'active' : ''}`} onClick={() => goToGroup('unified')}>Unified</AppButton>
          </div>
        </div>
        <p className="hris-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="hris-announcement-card">
        <AppButton type="button" className="hris-announcement-header" onClick={() => setIsAnnouncementOpen(v => !v)} aria-expanded={isAnnouncementOpen}>
          <div className="hris-ann-left">
            <div className="hris-ann-icon">✈</div>
            <div>
              <div className="hris-ann-title">Announcement</div>
              <div className="hris-ann-subtitle">Broadcast messages to your workforce</div>
            </div>
          </div>
          <span className={`hris-ann-caret ${isAnnouncementOpen ? 'open' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 12L10 8L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </AppButton>

        {isAnnouncementOpen && (
          <div className="hris-announcement-body">
            {publishSuccess && <div className="hris-announcement-success">Announcement published successfully!</div>}
            {publishError && <div className="hris-announcement-error">{publishError}</div>}

            <div className="hris-ann-field">
              <label className="hris-ann-label">Title</label>
              <input type="text" className="hris-ann-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." />
            </div>

            <div className="hris-ann-field">
              <label className="hris-ann-label">Message</label>
              <textarea className="hris-ann-textarea" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your announcement here..." />
            </div>

            <div className="hris-ann-row">
              <div className="hris-ann-col">
                <label className="hris-ann-label">Priority</label>
                <AppDropdown className="hris-ann-dropdown" buttonClassName="hris-ann-dropdown-btn" value={priority} onChange={setPriority} placeholder="Select" options={[
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                ]} />
              </div>

              <div className="hris-ann-col">
                <label className="hris-ann-label">Audience</label>
                <AppDropdown className="hris-ann-dropdown" buttonClassName="hris-ann-dropdown-btn" value={audience} onChange={setAudience} placeholder="Select" options={[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'ad-hoc', label: 'Ad Hoc' },
                  { value: 'ecews', label: 'ECEWS' },
                  { value: 'gon', label: 'GON' },
                  { value: 'supervisors', label: 'Supervisors' },
                ]} />
              </div>

              <div className="hris-ann-col">
                <label className="hris-ann-label">Expires (optional)</label>
                <div className="hris-ann-date-wrap">
                  <DatePicker ref={datePickerRef} selected={expiresDate} onChange={date => setExpiresDate(date)} dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" className="hris-ann-input hris-ann-date-input" popperPlacement="bottom-start" showPopperArrow={false} />
                  <AppButton type="button" className="hris-ann-date-icon-btn" onClick={() => datePickerRef.current?.setOpen(true)} aria-label="Open date picker">
                    <span className="hris-ann-date-icon">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><line x1="6" y1="2.5" x2="6" y2="6" stroke="currentColor" strokeWidth="1.5" /><line x1="14" y1="2.5" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" /><line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5" /></svg>
                    </span>
                  </AppButton>
                </div>
              </div>
            </div>

            <div className="hris-ann-actions">
              <AppButton type="button" className="hris-ann-cancel-btn" onClick={() => { setIsAnnouncementOpen(false); resetAnnouncementForm() }}>Cancel</AppButton>
              <AppButton type="button" className="hris-ann-publish-btn" onClick={handlePublish} disabled={publishing}>{publishing ? 'Publishing...' : 'Publish'}</AppButton>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default HrisOverviewSection