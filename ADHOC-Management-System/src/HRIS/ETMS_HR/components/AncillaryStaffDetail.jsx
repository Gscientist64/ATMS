import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppButton from '../../../shared/AppButton'
import HrisExecuteActionsPanel from '../../shared/HrisExecuteActionsPanel'
import { getEmployeeById } from '../../../services/api'
import './AncillaryStaffDetail.css'

const contractStatusClass = (status) => {
  switch ((status || '').toLowerCase().replace(/\s+/g, '')) {
    case 'onpip': return 'asd-status-pill-onpip'
    case 'terminated': return 'asd-status-pill-terminated'
    case 'terminationpending': return 'asd-status-pill-terminationpending'
    case 'expiringsoon': return 'asd-status-pill-expiringsoon'
    default: return 'asd-status-pill-active'
  }
}

const AncillaryStaffDetail = () => {
  const { publicId } = useParams()
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('employment')

  useEffect(() => {
    if (publicId) fetchStaff()
  }, [publicId])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const res = await getEmployeeById(publicId)
      setStaff(res.data || res)
    } catch (err) {
      console.error('Failed to load staff details:', err.message)
      setStaff(null)
    } finally {
      setLoading(false)
    }
  }

  const s = staff || {}
  const fullName = s.fullName || s.FullName || 'Unknown'
  const designation = s.designation || s.Designation || ''
  const contractStatus = s.contractStatus || s.ContractStatus || 'N/A'
  const department = s.department || s.Department || ''
  const state = s.state || s.State || ''
  const ecewsSupervisor = s.ecewsSupervisorName || s.EcewsSupervisorName || ''
  const gonSupervisor = s.gonSupervisorName || s.GonSupervisorName || ''
  const phone = s.phoneNumber || s.PhoneNumber || ''
  const email = s.email || s.Email || ''
  const emergencyContact = s.emergencyContactName || s.EmergencyContactName || ''
  const emergencyPhone = s.emergencyContactPhone || s.EmergencyContactPhone || ''
  const bankName = s.bankName || s.BankName || ''
  const accountNumber = s.accountNumber || s.AccountNumber || ''
  const accountName = s.accountName || s.AccountName || ''
  const healthFacility = s.healthFacility || s.HealthFacility || ''
  const lga = s.lga || s.LGA || ''
  const employeeCode = s.employeeCode || s.EmployeeCode || ''
  const project = s.project || s.Project || ''
  const ninName = s.ninName || s.NINName || ''
  const ninNumber = s.ninNumber || s.NINNumber || ''
  const tinName = s.tinName || s.TINName || ''
  const tinNumber = s.tinNumber || s.TINNumber || ''
  const contractStart = s.contractStartDate || s.ContractStartDate
  const contractEnd = s.contractEndDate || s.ContractEndDate

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  if (loading) return <div className="asd-page"><div className="asp-loading">Loading staff details...</div></div>
  if (!staff) return <div className="asd-page"><div className="asp-loading">Staff not found.</div></div>

  return (
    <div className="asd-page" data-staff-id={publicId}>
      <Link to="/hris/ancillary-staff/personnel" className="asd-back">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </Link>

      <h1 className="asd-name">{fullName}</h1>
      <p className="asd-role">{designation}</p>

      <div className="asd-profile-card">
        <div className="asd-photo" aria-label="Staff photo" />
        <div className="asd-profile-content">
          <div className="asd-profile-top">
            <h2 className="asd-profile-name">{fullName}</h2>
            <HrisExecuteActionsPanel
              showInitiatePip={false}
              triggerClassName="asd-actions-btn"
              triggerAriaLabel="Actions"
              triggerContent={
                <>
                  Actions
                  <span className="asd-actions-dots" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                      <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                    </svg>
                  </span>
                </>
              }
            />
          </div>

          <div className="asd-divider" />

          <div className="asd-meta-grid">
            <div className="asd-meta-item">
              <span className="asd-meta-label">Contract Status</span>
              <span className={`asd-status-pill ${contractStatusClass(contractStatus)}`}>{contractStatus}</span>
            </div>
            <div className="asd-meta-item">
              <span className="asd-meta-label">Department</span>
              <span className="asd-meta-value">{department || 'N/A'}</span>
            </div>
            <div className="asd-meta-item">
              <span className="asd-meta-label">Location</span>
              <span className="asd-meta-value">{state || 'N/A'}</span>
            </div>
            <div className="asd-meta-item">
              <span className="asd-meta-label">Designation</span>
              <span className="asd-meta-value">{designation || 'N/A'}</span>
            </div>
            <div className="asd-meta-item">
              <span className="asd-meta-label">GON Supervisor</span>
              <span className="asd-meta-value">{gonSupervisor || 'N/A'}</span>
            </div>
            <div className="asd-meta-item">
              <span className="asd-meta-label">ECEWS Supervisor</span>
              <span className="asd-meta-value">{ecewsSupervisor || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="asd-tabs" role="tablist" aria-label="Staff sections">
        <AppButton type="button" className={`asd-tab ${activeTab === 'employment' ? 'active' : ''}`} onClick={() => setActiveTab('employment')}>Employment Information</AppButton>
        <AppButton type="button" className={`asd-tab ${activeTab === 'timesheets' ? 'active' : ''}`} onClick={() => setActiveTab('timesheets')}>Timesheets</AppButton>
        <AppButton type="button" className={`asd-tab ${activeTab === 'contract' ? 'active' : ''}`} onClick={() => setActiveTab('contract')}>Contract History</AppButton>
      </div>

      {activeTab === 'employment' ? (
        <div className="asd-cards">
          <section className="asd-card">
            <h3 className="asd-card-title">Contact Information</h3>
            <div className="asd-card-divider" />
            <div className="asd-fields-grid">
              <div className="asd-field">
                <span className="asd-field-label">Phone Number</span>
                <span className="asd-field-value">{phone || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Email Address</span>
                <span className="asd-field-value">{email || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Emergency Contact Name</span>
                <span className="asd-field-value">{emergencyContact || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Emergency Contact Phone</span>
                <span className="asd-field-value">{emergencyPhone || 'N/A'}</span>
              </div>
            </div>
          </section>

          <section className="asd-card">
            <h3 className="asd-card-title">Banking Details</h3>
            <div className="asd-card-divider" />
            <div className="asd-fields-grid">
              <div className="asd-field">
                <span className="asd-field-label">Bank Name</span>
                <span className="asd-field-value">{bankName || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Account Number</span>
                <span className="asd-field-value">{accountNumber || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Account Name</span>
                <span className="asd-field-value">{accountName || 'N/A'}</span>
              </div>
            </div>
          </section>

          <section className="asd-card">
            <h3 className="asd-card-title">Contract Details</h3>
            <div className="asd-card-divider" />
            <div className="asd-fields-grid asd-fields-grid-contract">
              <div className="asd-field">
                <span className="asd-field-label">Designation</span>
                <span className="asd-field-value">{designation || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Facility</span>
                <span className="asd-field-value">{healthFacility || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">LGA</span>
                <span className="asd-field-value">{lga || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Employee Code/ID</span>
                <span className="asd-field-value">{employeeCode || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">Project</span>
                <span className="asd-field-value">{project || 'N/A'}</span>
              </div>
            </div>
          </section>

          <section className="asd-card">
            <h3 className="asd-card-title">NIN and TIN Details</h3>
            <div className="asd-card-divider" />
            <div className="asd-fields-grid">
              <div className="asd-field">
                <span className="asd-field-label">NIN Name</span>
                <span className="asd-field-value">{ninName || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">NIN Number</span>
                <span className="asd-field-value">{ninNumber || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">TIN Name</span>
                <span className="asd-field-value">{tinName || 'N/A'}</span>
              </div>
              <div className="asd-field">
                <span className="asd-field-label">TIN Number</span>
                <span className="asd-field-value">{tinNumber || 'N/A'}</span>
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === 'timesheets' ? (
        <div className="asd-timesheet-card">
          <div className="asd-timesheet-table-wrap">
            <table className="asd-timesheet-table">
              <thead>
                <tr>
                  <th>Month/Year</th>
                  <th>Days Worked</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>Timesheet data coming soon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'contract' ? (
        <div className="asd-contract-card">
          <h3 className="asd-contract-title">Contract History Timeline</h3>
          <div className="asd-contract-timeline">
            <div className="asd-contract-item">
              <span className="asd-contract-dot asd-contract-dot-green" aria-hidden="true" />
              <div className="asd-contract-body">
                <div className="asd-contract-name">Current Contract</div>
                <div className="asd-contract-label">{contractStatus}</div>
                <div className="asd-contract-date">{contractStart ? formatDate(contractStart) : 'N/A'} — {contractEnd ? formatDate(contractEnd) : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AncillaryStaffDetail
