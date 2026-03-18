import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import AppTable from '../../shared/AppTable'
import './ProgramsStaffDetail.css'

const ProgramsStaffDetail = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('employment')
  const [actionsValue, setActionsValue] = useState('')
  const [isChangeFacilityOpen, setIsChangeFacilityOpen] = useState(false)
  const [isChangeFacilityDoneOpen, setIsChangeFacilityDoneOpen] = useState(false)
  const [isManageSupervisorsOpen, setIsManageSupervisorsOpen] = useState(false)
  const [changeState, setChangeState] = useState('')
  const [changeFacilityName, setChangeFacilityName] = useState('')
  const [changeLga, setChangeLga] = useState('')
  const [manageGonSupervisor, setManageGonSupervisor] = useState('')
  const [manageEcewsSupervisor, setManageEcewsSupervisor] = useState('')

  const staff = useMemo(
    () => ({
      id,
      name: 'John Adeyemi',
      contractStatus: 'Active',
      department: 'Field Operations',
      location: 'Akwa Ibom',
      designation: 'Case Manager',
      gonSupervisor: 'Amina Mohammed',
      ecewsSupervisor: 'Mike Bolaji',
      avatarInitials: 'JA',
    }),
    [id],
  )

  const timesheetRows = [
    {
      id: 1,
      monthYear: 'January 2026',
      daysWorked: '3 Days',
      submittedDate: '05-02-2026',
      status: 'GON Review',
      statusClass: 'psd-status-gon',
      actionTo: '/programs/timesheet/1',
    },
    {
      id: 2,
      monthYear: 'January 2026',
      daysWorked: '3 Days',
      submittedDate: '05-02-2026',
      status: 'Approved',
      statusClass: 'psd-status-approved',
      actionTo: '/programs/timesheet/view/101',
    },
    {
      id: 3,
      monthYear: 'January 2026',
      daysWorked: '3 Days',
      submittedDate: '05-02-2026',
      status: 'Approved',
      statusClass: 'psd-status-approved',
      actionTo: '/programs/timesheet/view/102',
    },
    {
      id: 4,
      monthYear: 'January 2026',
      daysWorked: '3 Days',
      submittedDate: '05-02-2026',
      status: 'Approved',
      statusClass: 'psd-status-approved',
      actionTo: '/programs/timesheet/view/103',
    },
  ]

  const timesheetColumns = [
    { header: 'Month/Year', accessor: 'monthYear', key: 'monthYear' },
    { header: 'Days Worked', accessor: 'daysWorked', key: 'daysWorked' },
    { header: 'Submitted Date', accessor: 'submittedDate', key: 'submittedDate' },
    {
      header: 'Status',
      accessor: 'status',
      key: 'status',
      render: (row) => <span className={`psd-status-pill ${row.statusClass}`}>{row.status}</span>,
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton to={row.actionTo} className="psd-view-link">
          View Details
        </AppButton>
      ),
    },
  ]

  useEffect(() => {
    if (!isChangeFacilityOpen && !isChangeFacilityDoneOpen && !isManageSupervisorsOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsChangeFacilityOpen(false)
        setIsChangeFacilityDoneOpen(false)
        setIsManageSupervisorsOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isChangeFacilityDoneOpen, isChangeFacilityOpen, isManageSupervisorsOpen])

  return (
    <div className="psd-page" data-staff-id={staff.id}>
      <div className="psd-topbar">
        <Link to="/programs/personnel" className="psd-back">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>

        <div className="psd-actions">
          <AppDropdown
            className="psd-actions-dropdown"
            buttonClassName="psd-actions-btn"
            value={actionsValue}
            onChange={(v) => {
              setActionsValue('')
              if (v === 'changeLocation') {
                setIsChangeFacilityOpen(true)
                return
              }
              if (v === 'manageSupervisors') {
                setIsManageSupervisorsOpen(true)
                return
              }
            }}
            placeholder="Actions"
            ariaLabel="Actions"
            options={[
              { value: 'changeLocation', label: 'Change Location' },
              { value: 'manageSupervisors', label: 'Manage Supervisors' },
            ]}
          />
        </div>
      </div>

      {isChangeFacilityOpen && (
        <div className="psd-cl-overlay" onClick={() => setIsChangeFacilityOpen(false)} role="presentation">
          <div className="psd-cl-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="psd-cl-header">
              <div className="psd-cl-headings">
                <div className="psd-cl-title">Change Location</div>
                <div className="psd-cl-subtitle">Assign or transfer staff to a facility</div>
              </div>
              <AppButton
                type="button"
                className="psd-cl-close"
                aria-label="Close"
                onClick={() => setIsChangeFacilityOpen(false)}
              >
                ×
              </AppButton>
            </div>

            <div className="psd-cl-body">
              <div className="psd-cl-field">
                <div className="psd-cl-label">State</div>
                <AppDropdown
                  className="psd-cl-dropdown"
                  value={changeState}
                  onChange={setChangeState}
                  placeholder="Select"
                  ariaLabel="State"
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'Abuja', label: 'Abuja' },
                    { value: 'Akwa Ibom', label: 'Akwa Ibom' },
                    { value: 'Cross River', label: 'Cross River' },
                    { value: 'Delta', label: 'Delta' },
                    { value: 'Ebonyi', label: 'Ebonyi' },
                    { value: 'Ekiti', label: 'Ekiti' },
                    { value: 'Enugu', label: 'Enugu' },
                    { value: 'Lagos', label: 'Lagos' },
                    { value: 'Osun', label: 'Osun' },
                  ]}
                />
              </div>

              <div className="psd-cl-field">
                <div className="psd-cl-label">Facility Name</div>
                <input
                  className="psd-cl-input"
                  value={changeFacilityName}
                  onChange={(e) => setChangeFacilityName(e.target.value)}
                  placeholder="Enter facility name"
                />
              </div>

              <div className="psd-cl-field">
                <div className="psd-cl-label">LGA</div>
                <input
                  className="psd-cl-input"
                  value={changeLga}
                  onChange={(e) => setChangeLga(e.target.value)}
                  placeholder="Enter LGA"
                />
              </div>
            </div>

            <div className="psd-cl-footer">
              <AppButton type="button" className="psd-cl-cancel" onClick={() => setIsChangeFacilityOpen(false)}>
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="psd-cl-save"
                onClick={() => {
                  setIsChangeFacilityOpen(false)
                  setIsChangeFacilityDoneOpen(true)
                }}
              >
                Save Changes
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isManageSupervisorsOpen && (
        <div className="psd-ms-overlay" onClick={() => setIsManageSupervisorsOpen(false)} role="presentation">
          <div className="psd-ms-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="psd-ms-header">
              <div className="psd-ms-headings">
                <div className="psd-ms-title">Select Supervisor</div>
                <div className="psd-ms-subtitle">Assign and reassign GON and ECEWS supervisors to staff</div>
              </div>
              <AppButton
                type="button"
                className="psd-ms-close"
                aria-label="Close"
                onClick={() => setIsManageSupervisorsOpen(false)}
              >
                ×
              </AppButton>
            </div>

            <div className="psd-ms-body">
              <div className="psd-ms-field">
                <div className="psd-ms-label">GON Supervisor</div>
                <AppDropdown
                  className="psd-ms-dropdown"
                  value={manageGonSupervisor}
                  onChange={setManageGonSupervisor}
                  placeholder="Select"
                  ariaLabel="GON Supervisor"
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'amina', label: 'Amina Mohammed' },
                    { value: 'mike', label: 'Mike Bolaji' },
                    { value: 'john', label: 'John Adeyemi' },
                  ]}
                />
              </div>

              <div className="psd-ms-field">
                <div className="psd-ms-label">ECEWS Supervisor</div>
                <AppDropdown
                  className="psd-ms-dropdown"
                  value={manageEcewsSupervisor}
                  onChange={setManageEcewsSupervisor}
                  placeholder="Select"
                  ariaLabel="ECEWS Supervisor"
                  options={[
                    { value: '', label: 'Select' },
                    { value: 'amina', label: 'Amina Mohammed' },
                    { value: 'mike', label: 'Mike Bolaji' },
                    { value: 'john', label: 'John Adeyemi' },
                  ]}
                />
              </div>
            </div>

            <div className="psd-ms-footer">
              <AppButton type="button" className="psd-ms-cancel" onClick={() => setIsManageSupervisorsOpen(false)}>
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="psd-ms-save"
                onClick={() => {
                  setIsManageSupervisorsOpen(false)
                  setIsChangeFacilityDoneOpen(true)
                }}
              >
                Save Changes
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isChangeFacilityDoneOpen && (
        <div className="psd-done-overlay" onClick={() => setIsChangeFacilityDoneOpen(false)} role="presentation">
          <div className="psd-done-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="psd-done-header">
              <div className="psd-done-spacer" aria-hidden="true" />
              <div className="psd-done-title">Done!</div>
              <AppButton
                type="button"
                className="psd-done-close"
                aria-label="Close"
                onClick={() => setIsChangeFacilityDoneOpen(false)}
              >
                ×
              </AppButton>
            </div>

            <div className="psd-done-subtitle">Supervisors have been successfully assigned</div>

            <div className="psd-done-footer">
              <AppButton type="button" className="psd-done-ok" onClick={() => setIsChangeFacilityDoneOpen(false)}>
                Okay
              </AppButton>
            </div>
          </div>
        </div>
      )}

      <h1 className="psd-name-heading">{staff.name}</h1>

      <div className="psd-hero-card">
        <div className="psd-photo" aria-label="Staff photo">
          <div className="psd-photo-inner">{staff.avatarInitials}</div>
        </div>

        <div className="psd-hero-content">
          <div className="psd-hero-title">{staff.name}</div>
          <div className="psd-hero-divider" />

          <div className="psd-hero-grid">
            <div className="psd-field">
              <div className="psd-label">Contract Status</div>
              <div className="psd-pill psd-pill-active">{staff.contractStatus}</div>
            </div>
            <div className="psd-field">
              <div className="psd-label">Department</div>
              <div className="psd-value">{staff.department}</div>
            </div>
            <div className="psd-field">
              <div className="psd-label">Location</div>
              <div className="psd-value">{staff.location}</div>
            </div>

            <div className="psd-field">
              <div className="psd-label">Designation</div>
              <div className="psd-value">{staff.designation}</div>
            </div>
            <div className="psd-field">
              <div className="psd-label">GON Supervisor</div>
              <div className="psd-value">{staff.gonSupervisor}</div>
            </div>
            <div className="psd-field">
              <div className="psd-label">ECEWS Supervisor</div>
              <div className="psd-value">{staff.ecewsSupervisor}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="psd-tabs">
        <AppButton
          type="button"
          className={`psd-tab ${activeTab === 'employment' ? 'active' : ''}`}
          onClick={() => setActiveTab('employment')}
        >
          Employment Information
        </AppButton>
        <AppButton
          type="button"
          className={`psd-tab ${activeTab === 'timesheets' ? 'active' : ''}`}
          onClick={() => setActiveTab('timesheets')}
        >
          Timesheets
        </AppButton>
        <AppButton
          type="button"
          className={`psd-tab ${activeTab === 'concerns' ? 'active' : ''}`}
          onClick={() => setActiveTab('concerns')}
        >
          Concerns
        </AppButton>
      </div>

      {activeTab === 'employment' && (
        <div className="psd-cards-grid">
          <div className="psd-info-card">
            <div className="psd-card-title">Contact Information</div>
            <div className="psd-card-divider" />
            <div className="psd-kv-grid">
              <div className="psd-kv">
                <div className="psd-k">Phone Number</div>
                <div className="psd-v">+2348060000000</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Email Address</div>
                <div className="psd-v">abc@gmail.com</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Emergency Contact Name</div>
                <div className="psd-v">Amina Mohammed</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Emergency Contact Phone</div>
                <div className="psd-v">+2348060000000</div>
              </div>
            </div>
          </div>

          <div className="psd-info-card">
            <div className="psd-card-title">Banking Details</div>
            <div className="psd-card-divider" />
            <div className="psd-kv-grid">
              <div className="psd-kv">
                <div className="psd-k">Bank Name</div>
                <div className="psd-v">First Bank</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Account Number</div>
                <div className="psd-v">0123456789</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Account Name</div>
                <div className="psd-v">John Adeyemi</div>
              </div>
            </div>
          </div>

          <div className="psd-info-card">
            <div className="psd-card-title">Contract Details</div>
            <div className="psd-card-divider" />
            <div className="psd-kv-grid">
              <div className="psd-kv">
                <div className="psd-k">Designation</div>
                <div className="psd-v">Case Manager</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Facility</div>
                <div className="psd-v">UUTH</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">LGA</div>
                <div className="psd-v">Uyo</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Employee Code/ID</div>
                <div className="psd-v">AKS/UYO/09123</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Project</div>
                <div className="psd-v">ACE5</div>
              </div>
            </div>
          </div>

          {/* <div className="psd-info-card">
            <div className="psd-card-title">NIN and TIN Details</div>
            <div className="psd-card-divider" />
            <div className="psd-kv-grid">
              <div className="psd-kv">
                <div className="psd-k">NIN Name</div>
                <div className="psd-v">John Adeyemi</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">NIN Number</div>
                <div className="psd-v">1234567890</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">TIN Name</div>
                <div className="psd-v">John Adeyemi</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">TIN Number</div>
                <div className="psd-v">1234567890</div>
              </div>
            </div>
          </div> */}
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="psd-timesheets-card">
          <AppTable
            columns={timesheetColumns}
            data={timesheetRows}
            rowKey="id"
            containerClassName="psd-timesheets-table-wrap"
            tableClassName="psd-timesheets-table"
          />
        </div>
      )}

      {activeTab === 'concerns' && (
        <div className="psd-concerns-card">
          <div className="psd-concern-item">
            <div className="psd-concern-header">
              <div className="psd-concern-user">
                <div className="psd-concern-avatar">AM</div>
                <div className="psd-concern-user-info">
                  <div className="psd-concern-name">Amina Mohammed</div>
                  <div className="psd-concern-role">GON Supervisor</div>
                </div>
              </div>
              <div className="psd-concern-date">28-02-2026 10:30</div>
            </div>

            <div className="psd-concern-text">
              I would like to raise a concern regarding the staff member&apos;s recent performance. There have been
              recurring issues with meeting deadlines and maintaining expected quality standards. I recommend a review
              to assess performance expectations and provide necessary support for improvement.
            </div>

            <div className="psd-concern-meta">
              <div className="psd-concern-meta-group">
                <span className="psd-concern-meta-label">Severity:</span>
                <span className="psd-concern-pill psd-concern-pill-high">High</span>
              </div>
              <div className="psd-concern-meta-group">
                <span className="psd-concern-meta-label">Type:</span>
                <span className="psd-concern-pill psd-concern-pill-type">Incomplete work</span>
              </div>
            </div>
          </div>

          <div className="psd-concern-item">
            <div className="psd-concern-header">
              <div className="psd-concern-user">
                <div className="psd-concern-avatar">MB</div>
                <div className="psd-concern-user-info">
                  <div className="psd-concern-name">Mike Bolaji</div>
                  <div className="psd-concern-role">ECEWS Supervisor</div>
                </div>
              </div>
              <div className="psd-concern-date">28-02-2026 10:30</div>
            </div>

            <div className="psd-concern-text">
              I would like to raise a concern regarding the staff member&apos;s recent performance. There have been
              recurring issues with meeting deadlines and maintaining expected quality standards. I recommend a review
              to assess performance expectations and provide necessary support for improvement.
            </div>

            <div className="psd-concern-meta">
              <div className="psd-concern-meta-group">
                <span className="psd-concern-meta-label">Severity:</span>
                <span className="psd-concern-pill psd-concern-pill-high">High</span>
              </div>
              <div className="psd-concern-meta-group">
                <span className="psd-concern-meta-label">Type:</span>
                <span className="psd-concern-pill psd-concern-pill-type">Incomplete work</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgramsStaffDetail

