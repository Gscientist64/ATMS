// src/Programs/components/ProgramsStaffDetail.jsx

import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import AppTable from '../../shared/AppTable'
import './ProgramsStaffDetail.css'
import { programsService, updateStaffDetails, configurationService } from '../../services/api'
import SupervisorSearch from './SupervisorSearch'
import { useAuth } from '../../contexts/AuthContext'

const contractStatusClass = (status) => {
  switch ((status || '').toLowerCase().replace(/\s+/g, '')) {
    case 'onpip': return 'psd-pill-pip'
    case 'terminated': return 'psd-pill-terminated'
    case 'terminationpending': return 'psd-pill-termination-pending'
    case 'expiringsoon': return 'psd-pill-expiring'
    default: return 'psd-pill-active'
  }
}

const ProgramsStaffDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('employment')
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionsValue, setActionsValue] = useState('')
  const [isChangeFacilityOpen, setIsChangeFacilityOpen] = useState(false)
  const [isChangeFacilityDoneOpen, setIsChangeFacilityDoneOpen] = useState(false)
  const [isManageSupervisorsOpen, setIsManageSupervisorsOpen] = useState(false)
  const [changeState, setChangeState] = useState('')
  const [changeFacilityName, setChangeFacilityName] = useState('')
  const [changeLga, setChangeLga] = useState('')
  const [manageGonSupervisor, setManageGonSupervisor] = useState('')
  const [manageEcewsSupervisor, setManageEcewsSupervisor] = useState('')
  const [processing, setProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false)
  const [editPhoneNumber, setEditPhoneNumber] = useState('')
  const [editEmergencyName, setEditEmergencyName] = useState('')
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('')
  const [editBankName, setEditBankName] = useState('')
  const [editAccountNumber, setEditAccountNumber] = useState('')
  const [editAccountName, setEditAccountName] = useState('')
  const [editNinName, setEditNinName] = useState('')
  const [editNinNumber, setEditNinNumber] = useState('')
  const [editTinName, setEditTinName] = useState('')
  const [editTinNumber, setEditTinNumber] = useState('')
  const [permissionNotice, setPermissionNotice] = useState('')

  // NEW: Documents states
  const [staffDocuments, setStaffDocuments] = useState([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [isDeleteDocumentConfirmOpen, setIsDeleteDocumentConfirmOpen] = useState(false)
  const [isDeleteDocumentDoneOpen, setIsDeleteDocumentDoneOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState(null)
  const [selectedDocumentName, setSelectedDocumentName] = useState('')

  useEffect(() => {
    fetchStaffDetail()
    fetchStaffDocuments()
  }, [id])

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  useEffect(() => {
    if (permissionNotice) {
      const timer = setTimeout(() => {
        setPermissionNotice('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [permissionNotice])

  const fetchStaffDetail = async () => {
    try {
      setLoading(true)
      const data = await programsService.getStaffDetail(id)
      setStaff(data)
    } catch (err) {
      setError('Failed to load staff details')
      console.error('Error fetching staff:', err)
    } finally {
      setLoading(false)
    }
  }

  // NEW: Fetch staff documents
  const fetchStaffDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const documents = await programsService.getStaffDocuments(id)
      setStaffDocuments(documents || [])
    } catch (err) {
      console.error('Error fetching staff documents:', err)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleChangeLocation = async () => {
    if (!changeState || !changeFacilityName || !changeLga) {
      setError('Please fill in all fields')
      return
    }

    try {
      setProcessing(true)
      await programsService.changeLocation(id, {
        state: changeState,
        facilityName: changeFacilityName,
        lga: changeLga
      })
      await fetchStaffDetail()
      setIsChangeFacilityOpen(false)
      setSuccessMessage('Location updated successfully')
      setShowSuccess(true)
      // Reset form
      setChangeState('')
      setChangeFacilityName('')
      setChangeLga('')
    } catch (err) {
      setError(err.message || 'Failed to update location')
    } finally {
      setProcessing(false)
    }
  }

  const handleManageSupervisors = async () => {
    try {
      setProcessing(true)
      await programsService.manageSupervisors(id, {
        gonSupervisorId: manageGonSupervisor ? parseInt(manageGonSupervisor) : null,
        ecewsSupervisorId: manageEcewsSupervisor ? parseInt(manageEcewsSupervisor) : null
      })
      await fetchStaffDetail()
      setIsManageSupervisorsOpen(false)
      setSuccessMessage('Supervisors updated successfully')
      setShowSuccess(true)
      // Reset form
      setManageGonSupervisor('')
      setManageEcewsSupervisor('')
    } catch (err) {
      setError(err.message || 'Failed to update supervisors')
    } finally {
      setProcessing(false)
    }
  }

  const handleEditDetails = async () => {
    try {
      setProcessing(true)
      await updateStaffDetails(id, {
        phoneNumber: editPhoneNumber,
        emergencyContactName: editEmergencyName,
        emergencyContactPhone: editEmergencyPhone,
        bankName: editBankName,
        accountNumber: editAccountNumber,
        accountName: editAccountName,
        ninName: editNinName,
        ninNumber: editNinNumber,
        tinName: editTinName,
        tinNumber: editTinNumber,
      })
      await fetchStaffDetail()
      setIsEditDetailsOpen(false)
      setSuccessMessage('Staff details updated successfully')
      setShowSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to update staff details')
    } finally {
      setProcessing(false)
    }
  }

  // NEW: Handle document deletion
  const handleDeleteDocumentClick = (docId, docName) => {
    setSelectedDocumentId(docId)
    setSelectedDocumentName(docName)
    setIsDeleteDocumentConfirmOpen(true)
  }

  const handleConfirmDeleteDocument = async () => {
    try {
      setProcessing(true)
      await programsService.deleteStaffDocument(id, selectedDocumentId)
      await fetchStaffDocuments()
      setIsDeleteDocumentConfirmOpen(false)
      setIsDeleteDocumentDoneOpen(true)
    } catch (err) {
      setError(err.message || 'Failed to delete document')
      setIsDeleteDocumentConfirmOpen(false)
    } finally {
      setProcessing(false)
    }
  }

  const handleViewDocument = (doc) => {
    // Prepend API base URL to the relative file path
    const fullUrl = `http://localhost:5087${doc.fileUrl}`
    window.open(fullUrl, '_blank')
  }

  const timesheetColumns = [
    { header: 'Month/Year', accessor: 'monthYear', key: 'monthYear' },
    { header: 'Days Worked', accessor: 'daysWorked', key: 'daysWorked' },
    { header: 'Submitted Date', accessor: 'submittedDate', key: 'submittedDate' },
    {
      header: 'Status',
      accessor: 'status',
      key: 'status',
      render: (row) => {
        let className = 'psd-status-pill'
        if (row.statusType === 'approved') className += ' psd-status-approved'
        else if (row.statusType === 'review') className += ' psd-status-gon'
        else if (row.statusType === 'rejected') className += ' psd-status-returned'
        else className += ' psd-status-pending'
        return <span className={className}>{row.status}</span>
      },
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton to={`/programs/timesheet/view/${row.id}`} className="psd-view-link">
          View Details
        </AppButton>
      ),
    },
  ]

  const concernColumns = [
    { header: 'Raised By', accessor: 'authorName', key: 'authorName' },
    { header: 'Role', accessor: 'authorRole', key: 'authorRole' },
    { header: 'Severity', accessor: 'severity', key: 'severity' },
    { header: 'Type', accessor: 'type', key: 'type' },
    { header: 'Date', accessor: 'createdAt', key: 'createdAt' },
  ]

  if (loading) {
    return (
      <div className="psd-page">
        <div className="psd-loading">Loading staff details...</div>
      </div>
    )
  }

  if (error || !staff) {
    return (
      <div className="psd-page">
        <div className="psd-error">{error || 'Staff not found'}</div>
        <AppButton onClick={() => navigate('/programs/personnel')}>
          Back to Personnel
        </AppButton>
      </div>
    )
  }

  return (
    <div className="psd-page" data-staff-id={id}>
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
            onChange={async (v) => {
              setActionsValue('')
              if (v === 'changeLocation') {
                setIsChangeFacilityOpen(true)
              } else if (v === 'manageSupervisors') {
                setIsManageSupervisorsOpen(true)
              } else if (v === 'editDetails') {
                if (user?.role === 'Programs') {
                  let hasPermission = false
                  try {
                    const result = await configurationService.hasPermission('editStaffDetails')
                    hasPermission = Boolean(result?.hasPermission)
                  } catch (err) {
                    hasPermission = false
                  }
                  if (!hasPermission) {
                    setPermissionNotice("You don't have permission to edit staff details")
                    return
                  }
                }
                setEditPhoneNumber(staff.phoneNumber || '')
                setEditEmergencyName(staff.emergencyContactName || '')
                setEditEmergencyPhone(staff.emergencyContactPhone || '')
                setEditBankName(staff.bankName || '')
                setEditAccountNumber(staff.accountNumber || '')
                setEditAccountName(staff.accountName || '')
                setEditNinName(staff.ninName || '')
                setEditNinNumber(staff.ninNumber || '')
                setEditTinName(staff.tinName || '')
                setEditTinNumber(staff.tinNumber || '')
                setIsEditDetailsOpen(true)
              }
            }}
            placeholder="Actions"
            ariaLabel="Actions"
            options={[
              { value: 'editDetails', label: 'Edit Staff Details' },
              { value: 'changeLocation', label: 'Change Location' },
              { value: 'manageSupervisors', label: 'Manage Supervisors' },
            ]}
          />
        </div>
      </div>

      {showSuccess && (
        <div className="psd-toast-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="psd-toast-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {permissionNotice && (
        <div className="psd-permission-toast" role="alert">
          {permissionNotice}
          <button type="button" aria-label="Dismiss" onClick={() => setPermissionNotice('')}>×</button>
        </div>
      )}

      {/* Change Location Modal */}
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
                <select
                  className="psd-cl-select"
                  value={changeState}
                  onChange={(e) => setChangeState(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Akwa Ibom">Akwa Ibom</option>
                  <option value="Cross River">Cross River</option>
                  <option value="Delta">Delta</option>
                  <option value="Ebonyi">Ebonyi</option>
                  <option value="Ekiti">Ekiti</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Osun">Osun</option>
                </select>
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
                onClick={handleChangeLocation}
                disabled={processing}
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Manage Supervisors Modal */}
      {isManageSupervisorsOpen && (
        <div className="psd-ms-overlay" onClick={() => setIsManageSupervisorsOpen(false)} role="presentation">
          <div className="psd-ms-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="psd-ms-header">
              <div className="psd-ms-headings">
                <div className="psd-ms-title">Select Supervisor</div>
                <div className="psd-ms-subtitle">Assign and reassign Facility or ECEWS supervisors to staff</div>
              </div>
              <div className="psd-ms-hint"> </div>
              <div className="psd-ms-hint"> </div>
              <AppButton
                type="button"
                className="psd-ms-close"
                aria-label="Close"
                onClick={() => setIsManageSupervisorsOpen(false)}
              >
                ×
              </AppButton>
            </div>
            


            <div className="psd-ms-field">
                <div className="psd-ms-label">Facility Supervisor</div>
                <SupervisorSearch
                    type="gon"
                    placeholder="Search Facility Supervisor by name or ID..."
                    selectedId={manageGonSupervisor}
                    onSelect={(id, name) => {
                        setManageGonSupervisor(id)
                        
                    }}
                />
                <div className="psd-ms-hint"> </div>
                <div className="psd-ms-hint"> </div>
                <div className="psd-ms-hint"> </div>
                <div className="psd-ms-hint"> </div>
            </div>

            <div className="psd-ms-field">
                <div className="psd-ms-label">ECEWS Supervisor</div>
                <SupervisorSearch
                    type="ecews"
                    placeholder="Search ECEWS Supervisor by name or ID..."
                    selectedId={manageEcewsSupervisor}
                    onSelect={(id, name) => {
                        setManageEcewsSupervisor(id)
                        
                    }}
                />
                <div className="psd-ms-hint">Start typing to search for an ECEWS Supervisor</div>
            </div>
            

            <div className="psd-ms-footer">
              <AppButton type="button" className="psd-ms-cancel" onClick={() => setIsManageSupervisorsOpen(false)}>
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="psd-ms-save"
                onClick={handleManageSupervisors}
                disabled={processing}
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Details Modal */}
      {isEditDetailsOpen && (
        <div className="psd-ed-overlay" onClick={() => setIsEditDetailsOpen(false)} role="presentation">
          <div className="psd-ed-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="psd-ed-header">
              <div className="psd-ed-headings">
                <div className="psd-ed-title">Edit Staff Details</div>
                <div className="psd-ed-subtitle">Update personal and banking information</div>
              </div>
              <AppButton type="button" className="psd-ed-close" aria-label="Close" onClick={() => setIsEditDetailsOpen(false)}>×</AppButton>
            </div>
            <div className="psd-ed-body">
              <div className="psd-ed-section-title">Contact Information</div>
              <div className="psd-ed-row">
                <div className="psd-ed-field">
                  <label className="psd-ed-label">Phone Number</label>
                  <input className="psd-ed-input" value={editPhoneNumber} onChange={e => setEditPhoneNumber(e.target.value)} placeholder="Enter phone number" />
                </div>
                <div className="psd-ed-field">
                  <label className="psd-ed-label">Emergency Contact Name</label>
                  <input className="psd-ed-input" value={editEmergencyName} onChange={e => setEditEmergencyName(e.target.value)} placeholder="Enter emergency contact name" />
                </div>
              </div>
              <div className="psd-ed-row">
                <div className="psd-ed-field">
                  <label className="psd-ed-label">Emergency Contact Phone</label>
                  <input className="psd-ed-input" value={editEmergencyPhone} onChange={e => setEditEmergencyPhone(e.target.value)} placeholder="Enter emergency phone" />
                </div>
              </div>

              <div className="psd-ed-section-title">Bank Details</div>
              <div className="psd-ed-row">
                <div className="psd-ed-field">
                  <label className="psd-ed-label">Bank Name</label>
                  <input className="psd-ed-input" value={editBankName} onChange={e => setEditBankName(e.target.value)} placeholder="Enter bank name" />
                </div>
                <div className="psd-ed-field">
                  <label className="psd-ed-label">Account Number</label>
                  <input className="psd-ed-input" value={editAccountNumber} onChange={e => setEditAccountNumber(e.target.value)} placeholder="Enter account number" />
                </div>
              </div>
              <div className="psd-ed-row">
                <div className="psd-ed-field">
                  <label className="psd-ed-label">Account Name</label>
                  <input className="psd-ed-input" value={editAccountName} onChange={e => setEditAccountName(e.target.value)} placeholder="Enter account name" />
                </div>
              </div>

              <div className="psd-ed-section-title">Government IDs</div>
              <div className="psd-ed-row">
                <div className="psd-ed-field">
                  <label className="psd-ed-label">NIN Name</label>
                  <input className="psd-ed-input" value={editNinName} onChange={e => setEditNinName(e.target.value)} placeholder="Enter NIN name" />
                </div>
                <div className="psd-ed-field">
                  <label className="psd-ed-label">NIN Number</label>
                  <input className="psd-ed-input" value={editNinNumber} onChange={e => setEditNinNumber(e.target.value)} placeholder="Enter NIN number" />
                </div>
              </div>
              <div className="psd-ed-row">
                <div className="psd-ed-field">
                  <label className="psd-ed-label">TIN Name</label>
                  <input className="psd-ed-input" value={editTinName} onChange={e => setEditTinName(e.target.value)} placeholder="Enter TIN name" />
                </div>
                <div className="psd-ed-field">
                  <label className="psd-ed-label">TIN Number</label>
                  <input className="psd-ed-input" value={editTinNumber} onChange={e => setEditTinNumber(e.target.value)} placeholder="Enter TIN number" />
                </div>
              </div>
            </div>
            <div className="psd-ed-footer">
              <AppButton type="button" className="psd-ed-cancel" onClick={() => setIsEditDetailsOpen(false)}>Cancel</AppButton>
              <AppButton type="button" className="psd-ed-save" onClick={handleEditDetails} disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</AppButton>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Delete Document Confirmation Modal */}
      {isDeleteDocumentConfirmOpen && (
        <div
          className="psd-doc-confirm-overlay"
          onClick={() => setIsDeleteDocumentConfirmOpen(false)}
          role="presentation"
        >
          <div className="psd-doc-confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="psd-doc-confirm-title">Confirm Action</div>
            <div className="psd-doc-confirm-message">
              The document "{selectedDocumentName}" will be deleted and an email notification will be sent to the user
            </div>
            <div className="psd-doc-confirm-actions">
              <AppButton
                type="button"
                className="psd-doc-confirm-btn psd-doc-confirm-btn--cancel"
                onClick={() => setIsDeleteDocumentConfirmOpen(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="psd-doc-confirm-btn psd-doc-confirm-btn--confirm"
                onClick={handleConfirmDeleteDocument}
                disabled={processing}
              >
                {processing ? 'Deleting...' : 'Confirm'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Delete Document Success Modal */}
      {isDeleteDocumentDoneOpen && (
        <div className="psd-done-overlay" onClick={() => setIsDeleteDocumentDoneOpen(false)} role="presentation">
          <div className="psd-done-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="psd-done-header">
              <div className="psd-done-spacer" aria-hidden="true" />
              <div className="psd-done-title">Done</div>
              <AppButton
                type="button"
                className="psd-done-close"
                aria-label="Close"
                onClick={() => setIsDeleteDocumentDoneOpen(false)}
              >
                ×
              </AppButton>
            </div>

            <div className="psd-done-subtitle">Document has been successfully deleted</div>

            <div className="psd-done-footer">
              <AppButton type="button" className="psd-done-ok" onClick={() => setIsDeleteDocumentDoneOpen(false)}>
                Okay
              </AppButton>
            </div>
          </div>
        </div>
      )}

      <h1 className="psd-name-heading">{staff.fullName}</h1>

      <div className="psd-hero-card">
      <div className="psd-photo" aria-label="Staff photo">
        {staff.profileImageUrl ? (
          <img
            src={`http://localhost:5087${staff.profileImageUrl}?t=${new Date().getTime()}`}
            alt={staff.fullName}
            className="psd-profile-img"
          />
        ) : (
          <div className="psd-photo-inner">
            {staff.avatarInitials}
          </div>
        )}
      </div>

        <div className="psd-hero-content">
          <div className="psd-hero-title">{staff.fullName}</div>
          <div className="psd-hero-divider" />

          <div className="psd-hero-grid">
            <div className="psd-field">
              <div className="psd-label">Contract Status</div>
              <div className={`psd-pill ${contractStatusClass(staff.contractStatus)}`}>{staff.contractStatus || 'Active'}</div>
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
              <div className="psd-label">ECEWS Supervisor</div>
              <div className="psd-value">{staff.ecewsSupervisorName}</div>
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
        {/* NEW: Documents Tab */}
        <AppButton
          type="button"
          className={`psd-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
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
          Concerns {staff.concerns?.length > 0 && <span className="psd-tab-badge">{staff.concerns.length}</span>}
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
                <div className="psd-v">{staff.phoneNumber}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Email Address</div>
                <div className="psd-v">{staff.email}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Emergency Contact Name</div>
                <div className="psd-v">{staff.emergencyContactName}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Emergency Contact Phone</div>
                <div className="psd-v">{staff.emergencyContactPhone}</div>
              </div>
            </div>
          </div>

          <div className="psd-info-card">
            <div className="psd-card-title">Banking Details</div>
            <div className="psd-card-divider" />
            <div className="psd-kv-grid">
              <div className="psd-kv">
                <div className="psd-k">Bank Name</div>
                <div className="psd-v">{staff.bankName}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Account Number</div>
                <div className="psd-v">{staff.accountNumber}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Account Name</div>
                <div className="psd-v">{staff.accountName}</div>
              </div>
            </div>
          </div>

          <div className="psd-info-card">
            <div className="psd-card-title">Contract Details</div>
            <div className="psd-card-divider" />
            <div className="psd-kv-grid">
              <div className="psd-kv">
                <div className="psd-k">Designation</div>
                <div className="psd-v">{staff.designation}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Facility</div>
                <div className="psd-v">{staff.facility}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">LGA</div>
                <div className="psd-v">{staff.lga}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Employee Code/ID</div>
                <div className="psd-v">{staff.employeeCode}</div>
              </div>
              <div className="psd-kv">
                <div className="psd-k">Project</div>
                <div className="psd-v">{staff.project}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Documents Tab Content */}
      {activeTab === 'documents' && (
        <div className="psd-documents-card">
          {staffDocuments.length > 0 ? (
            staffDocuments.map((doc) => (
              <div key={doc.id} className="psd-documents-row">
                <div className="psd-documents-main">
                  <div className="psd-documents-title">Credentials</div>
                  <AppButton 
                    type="button" 
                    className="psd-documents-file"
                    onClick={() => handleViewDocument(doc)}
                  >
                    {doc.fileName}
                  </AppButton>
                </div>
                <div className="psd-documents-actions">
                  <AppButton 
                    type="button" 
                    className="psd-documents-btn psd-documents-btn--reupload"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M4.5 9.8A5.5 5.5 0 0 1 15 7.5M15.5 10.2A5.5 5.5 0 0 1 5 12.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.5 5.5h2.8v2.8M7.5 14.5H4.7v-2.8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    View Document
                  </AppButton>
                  <AppButton
                    type="button"
                    className="psd-documents-btn psd-documents-btn--delete"
                    onClick={() => handleDeleteDocumentClick(doc.id, doc.fileName)}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M3.5 5.5h13M7.5 5.5v-1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M8 8.5v6M12 8.5v6M6.5 5.5l.5 10a1 1 0 0 0 1 .95h4a1 1 0 0 0 1-.95l.5-10"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Delete
                  </AppButton>
                </div>
              </div>
            ))
          ) : (
            <div className="psd-documents-empty">
              <p>No documents uploaded for this staff member.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="psd-timesheets-card">
          <AppTable
            columns={timesheetColumns}
            data={staff.timesheets || []}
            rowKey="id"
            containerClassName="psd-timesheets-table-wrap"
            tableClassName="psd-timesheets-table"
            emptyMessage="No timesheets found"
          />
        </div>
      )}

      {activeTab === 'concerns' && (
        <div className="psd-concerns-card">
          {staff.concerns?.length > 0 ? (
            staff.concerns.map((concern) => (
              <div key={concern.id} className="psd-concern-item">
                <div className="psd-concern-header">
                  <div className="psd-concern-user">
                    <div className="psd-concern-avatar">{concern.authorAvatar}</div>
                    <div className="psd-concern-user-info">
                      <div className="psd-concern-name">{concern.authorName}</div>
                      <div className="psd-concern-role">{concern.authorRole}</div>
                    </div>
                  </div>
                  <div className="psd-concern-date">{concern.createdAt}</div>
                </div>

                <div className="psd-concern-text">{concern.concernText}</div>

                <div className="psd-concern-meta">
                  <div className="psd-concern-meta-group">
                    <span className="psd-concern-meta-label">Severity:</span>
                    <span className={`psd-concern-pill psd-concern-pill-${concern.severity?.toLowerCase()}`}>
                      {concern.severity}
                    </span>
                  </div>
                  <div className="psd-concern-meta-group">
                    <span className="psd-concern-meta-label">Type:</span>
                    <span className="psd-concern-pill psd-concern-pill-type">{concern.type}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="psd-no-concerns">No concerns raised for this staff member</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProgramsStaffDetail