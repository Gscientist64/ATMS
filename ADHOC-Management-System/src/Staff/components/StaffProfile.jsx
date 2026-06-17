import { useEffect, useRef, useState } from 'react'
import AppButton from '../../shared/AppButton'
import { staffService } from '../../services/api'
import './StaffProfile.css'

const TABS = [
  { id: 'employment', label: 'Employment Information' },
  { id: 'personal', label: 'Personal Information' },
  { id: 'documents', label: 'Documents' },
]

function IconChevron({ className = '' }) {
  return (
    <svg
      className={`staff-profile-chevron ${className}`.trim()}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10L8 6L12 10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconReupload() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.2 4.2l3.6-3.6 4 4-3.6 3.6M11 5.4L5 11.4v3.6h3.6l6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDelete() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.5h13M7.5 5.5v-1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M8 8.5v6M12 8.5v6M6.5 5.5l.5 10a1 1 0 0 0 1 .95h4a1 1 0 0 0 1-.95l.5-10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPayslip() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EmptyDocumentsIllustration() {
  return (
    <svg
      className="staff-profile-empty-illustration"
      width="120"
      height="96"
      viewBox="0 0 120 96"
      fill="none"
      aria-hidden="true"
    >
      <rect x="28" y="12" width="52" height="68" rx="4" fill="#e5e7eb" />
      <rect x="38" y="20" width="52" height="68" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
      <path d="M48 36h32M48 44h28M48 52h24" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
      <rect x="48" y="8" width="48" height="64" rx="4" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" />
      <path d="M58 28h28M58 36h24M58 44h20" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ProfileFieldGrid({ fields }) {
  return (
    <div className="staff-profile-field-grid">
      {fields.map((field) => (
        <div key={field.label} className="staff-profile-field">
          <span className="staff-profile-field-label">{field.label}</span>
          <span className="staff-profile-field-value">{field.value}</span>
        </div>
      ))}
    </div>
  )
}

function ProfileDependentEntry({ title, name, number }) {
  return (
    <li className="staff-profile-dependent">
      <div className="staff-profile-dependent-photo" aria-hidden="true" />
      <div className="staff-profile-dependent-info">
        <h4 className="staff-profile-dependent-title">{title}</h4>
        <div className="staff-profile-dependent-field">
          <span className="staff-profile-dependent-label">Name</span>
          <span className="staff-profile-dependent-value">{name}</span>
        </div>
        <div className="staff-profile-dependent-field">
          <span className="staff-profile-dependent-label">Number</span>
          <span className="staff-profile-dependent-value">{number}</span>
        </div>
      </div>
    </li>
  )
}

function ProfileDetailRows({ rows }) {
  return (
    <ul className="staff-profile-detail-rows">
      {rows.map((row, index) => (
        <li key={`${row.label}-${index}`} className="staff-profile-detail-row">
          <span className="staff-profile-detail-label">{row.label}</span>
          <span className="staff-profile-detail-value">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}

function StaffProfileDocumentCard({ title, filename, onReupload, onDelete }) {
  return (
    <article className="staff-profile-doc-card">
      <div className="staff-profile-doc-main">
        <h3 className="staff-profile-doc-title">{title}</h3>
        <span className="staff-profile-doc-filename">{filename}</span>
      </div>
      <div className="staff-profile-doc-actions">
        <AppButton type="button" className="staff-profile-doc-btn staff-profile-doc-btn--reupload" onClick={onReupload}>
          <IconReupload />
          Reupload
        </AppButton>
        <AppButton type="button" className="staff-profile-doc-btn staff-profile-doc-btn--delete" onClick={onDelete}>
          <IconDelete />
          Delete
        </AppButton>
      </div>
    </article>
  )
}

function ProfileAccordion({ title, isOpen, onToggle, children, titleMuted = false }) {
  return (
    <section className="staff-profile-accordion">
      <div className="staff-profile-accordion-head">
        <h3
          className={`staff-profile-accordion-title${titleMuted ? ' staff-profile-accordion-title--muted' : ''}`.trim()}
        >
          {title}
        </h3>
        <AppButton
          type="button"
          className="staff-profile-accordion-toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
        >
          <IconChevron className={isOpen ? 'is-open' : ''} />
        </AppButton>
      </div>
      {isOpen && <div className="staff-profile-accordion-body">{children}</div>}
    </section>
  )
}

const StaffProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('employment')
  const [workDetailsOpen, setWorkDetailsOpen] = useState(false)
  const [educationOpen, setEducationOpen] = useState(false)
  const [otherEducationOpen, setOtherEducationOpen] = useState(false)
  const [otherCertificationsOpen, setOtherCertificationsOpen] = useState(false)
  const [workExperienceOpen, setWorkExperienceOpen] = useState(false)
  const [bankPensionOpen, setBankPensionOpen] = useState(false)
  const [ninTinOpen, setNinTinOpen] = useState(false)
  const [bioDataOpen, setBioDataOpen] = useState(false)
  const [nextOfKinOpen, setNextOfKinOpen] = useState(false)
  const [dependentsOpen, setDependentsOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const documentsUploadRef = useRef(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await staffService.getProfile()
        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleDocumentsUploadClick = () => {
    documentsUploadRef.current?.click()
  }

  const handleDocumentsFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setDocuments((prev) => [
      ...prev,
      {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, '') || 'Uploaded Document',
        filename: file.name,
      },
    ])
    event.target.value = ''
  }

  const handleDocumentDelete = (documentId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
  }

  if (loading) return <div className="staff-profile-page">Loading...</div>
  if (!profile) return <div className="staff-profile-page">Unable to load profile</div>

  const workDetails = [
    { label: 'Primary Location', value: profile.state || '-' },
    { label: 'LGA', value: profile.lga || '-' },
    { label: 'Health Facility', value: profile.healthFacility || '-' },
  ]

  const bankPension = [
    { label: 'Bank Name', value: profile.bankName || '-' },
    { label: 'Account Name', value: profile.accountName || '-' },
    { label: 'Account Number', value: profile.accountNumber || '-' },
  ]

  const ninTin = [
    { label: 'NIN Name', value: profile.ninName || '-' },
    { label: 'NIN Number', value: profile.ninNumber || '-' },
    { label: 'TIN Name', value: profile.tinName || '-' },
    { label: 'TIN Number', value: profile.tinNumber || '-' },
  ]

  const bioData = [
    { label: 'Full Name', value: profile.fullName || '-' },
    { label: 'Email', value: profile.email || '-' },
    { label: 'Phone Number', value: profile.phoneNumber || '-' },
    { label: 'Gender', value: profile.gender || '-' },
    { label: 'Designation', value: profile.designation || '-' },
    { label: 'Department', value: profile.department || '-' },
    { label: 'State', value: profile.state || '-' },
    { label: 'LGA', value: profile.lga || '-' },
  ]

  const nextOfKin = [
    { label: 'Emergency Contact Name', value: profile.emergencyContactName || '-' },
    { label: 'Emergency Contact Phone', value: profile.emergencyContactPhone || '-' },
  ]

  return (
    <div className="staff-profile-page">
      <section className="staff-profile-hero">
        <div className="staff-profile-photo" role="img" aria-label={`${profile.fullName} profile photo`} />
        <div className="staff-profile-hero-content">
          <h1 className="staff-profile-name">{profile.fullName}</h1>
          <div className="staff-profile-meta-grid">
            <div className="staff-profile-meta-item">
              <span className="staff-profile-meta-label">Contract Status</span>
              <span className="staff-profile-status-badge">{profile.contractStatus || 'Active'}</span>
            </div>
            <div className="staff-profile-meta-item">
              <span className="staff-profile-meta-label">Employee Code</span>
              <span className="staff-profile-meta-value">{profile.employeeCode || '-'}</span>
            </div>
            <div className="staff-profile-meta-item">
              <span className="staff-profile-meta-label">Project</span>
              <span className="staff-profile-meta-value">{profile.project || '-'}</span>
            </div>
            <div className="staff-profile-meta-item">
              <span className="staff-profile-meta-label">Designation</span>
              <span className="staff-profile-meta-value">{profile.designation || '-'}</span>
            </div>
            <div className="staff-profile-meta-item">
              <span className="staff-profile-meta-label">Department</span>
              <span className="staff-profile-meta-value">{profile.department || '-'}</span>
            </div>
            <div className="staff-profile-meta-item">
              <span className="staff-profile-meta-label">Work Email</span>
              <span className="staff-profile-meta-value">{profile.email || '-'}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="staff-profile-tabs" role="tablist" aria-label="Profile sections">
        {TABS.map((tab) => (
          <AppButton
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`staff-profile-tab${activeTab === tab.id ? ' staff-profile-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </AppButton>
        ))}
      </div>

      {activeTab === 'employment' && (
        <div className="staff-profile-layout">
          <div className="staff-profile-main">
            <ProfileAccordion
              title="Work Details"
              isOpen={workDetailsOpen}
              onToggle={() => setWorkDetailsOpen((open) => !open)}
            >
              <ProfileFieldGrid fields={workDetails} />
            </ProfileAccordion>

            <ProfileAccordion
              title="Bank and Pension Details"
              isOpen={bankPensionOpen}
              onToggle={() => setBankPensionOpen((open) => !open)}
              titleMuted
            >
              <ProfileDetailRows rows={bankPension} />
            </ProfileAccordion>

            <ProfileAccordion
              title="NIN and TIN Details"
              isOpen={ninTinOpen}
              onToggle={() => setNinTinOpen((open) => !open)}
              titleMuted
            >
              <ProfileDetailRows rows={ninTin} />
            </ProfileAccordion>
          </div>

          <aside className="staff-profile-payslip-card">
            <div className="staff-profile-payslip-head">
              <h2 className="staff-profile-payslip-title">Pay slip History</h2>
              <span className="staff-profile-payslip-icon" aria-hidden="true">
                <IconPayslip />
              </span>
            </div>
            <div className="staff-profile-payslip-empty">
              <EmptyDocumentsIllustration />
              <p className="staff-profile-payslip-empty-text">No documents Available</p>
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="staff-profile-personal-layout">
          <div className="staff-profile-personal-column">
            <ProfileAccordion
              title="Bio Data"
              isOpen={bioDataOpen}
              onToggle={() => setBioDataOpen((open) => !open)}
              titleMuted
            >
              <ProfileDetailRows rows={bioData} />
            </ProfileAccordion>

            <ProfileAccordion
              title="Next of Kin and Emergency Contact"
              isOpen={nextOfKinOpen}
              onToggle={() => setNextOfKinOpen((open) => !open)}
              titleMuted
            >
              <ProfileDetailRows rows={nextOfKin} />
            </ProfileAccordion>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="staff-profile-documents-pane">
          {documents.map((doc) => (
            <StaffProfileDocumentCard
              key={doc.id}
              title={doc.title}
              filename={doc.filename}
              onReupload={handleDocumentsUploadClick}
              onDelete={() => handleDocumentDelete(doc.id)}
            />
          ))}

          <div className="staff-profile-documents-footer">
            <AppButton type="button" className="staff-profile-documents-upload-btn" onClick={handleDocumentsUploadClick}>
              Upload
            </AppButton>
          </div>

          <input
            ref={documentsUploadRef}
            type="file"
            className="staff-profile-documents-file-input"
            onChange={handleDocumentsFileChange}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  )
}

export default StaffProfile
