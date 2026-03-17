import { useState, useRef } from 'react'
import './Profile.css'
import AppButton from '../../shared/AppButton'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('employment')
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [signatureMode, setSignatureMode] = useState('draw')
  const [isContractPreviewOpen, setIsContractPreviewOpen] = useState(false)
  const [contractPreviewMode, setContractPreviewMode] = useState('sign')
  const [isSignatureModalClosing, setIsSignatureModalClosing] = useState(false)
  const [isContractPreviewClosing, setIsContractPreviewClosing] = useState(false)
  const [isSignConfirmOpen, setIsSignConfirmOpen] = useState(false)
  const [isSignConfirmClosing, setIsSignConfirmClosing] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isSuccessClosing, setIsSuccessClosing] = useState(false)
  const [signaturePreview, setSignaturePreview] = useState(null)
  const fileInputRef = useRef(null)

  const openSignatureModal = () => {
    setSignatureMode('draw')
    setIsSignatureModalClosing(false)
    setIsSignatureModalOpen(true)
  }

  const closeSignatureModal = () => {
    setIsSignatureModalClosing(true)
    setTimeout(() => {
      setIsSignatureModalOpen(false)
      setIsSignatureModalClosing(false)
    }, 250)
  }

  const openContractPreview = (mode = 'sign') => {
    setContractPreviewMode(mode)
    setIsContractPreviewClosing(false)
    setIsContractPreviewOpen(true)
  }

  const closeContractPreview = () => {
    setIsContractPreviewClosing(true)
    setTimeout(() => {
      setIsContractPreviewOpen(false)
      setIsContractPreviewClosing(false)
    }, 250)
  }

  const openSignConfirm = () => {
    setIsContractPreviewOpen(false)
    setIsContractPreviewClosing(false)
    setIsSignConfirmClosing(false)
    setIsSignConfirmOpen(true)
  }

  const closeSignConfirm = () => {
    setIsSignConfirmClosing(true)
    setTimeout(() => {
      setIsSignConfirmOpen(false)
      setIsSignConfirmClosing(false)
    }, 250)
  }

  const openSuccess = () => {
    setIsSuccessClosing(false)
    setIsSuccessOpen(true)
  }

  const closeSuccess = () => {
    setIsSuccessClosing(true)
    setTimeout(() => {
      setIsSuccessOpen(false)
      setIsSuccessClosing(false)
    }, 250)
  }

  const handleSignConfirmContinue = () => {
    closeSignConfirm()
    openSuccess()
  }

  const handleSignatureUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSignatureFileChange = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setSignaturePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your personal information and digital signature</p>
      </div>

      <div className="profile-top-card">
        <div className="profile-photo-wrapper">
          <img
            src="./profile-images/profile-photo.png"
            alt="John Adeyemi"
            className="profile-photo"
          />
        </div>
        <div className="profile-summary">
          <div className="profile-summary-header">
            <h2 className="profile-name">John Adeyemi</h2>
          </div>
          <div className="profile-summary-grid">
            <div className="profile-summary-column">
              <div className="profile-summary-row">
                <span className="profile-summary-label">Contract Status</span>
                <span className="profile-status-badge">Active</span>
              </div>
              <div className="profile-summary-row">
                <span className="profile-summary-label">Designation</span>
                <span className="profile-summary-value">Case Manager</span>
              </div>
            </div>
            <div className="profile-summary-column">
              <div className="profile-summary-row">
                <span className="profile-summary-label">Department</span>
                <span className="profile-summary-value">Field Operations</span>
              </div>
              <div className="profile-summary-row">
                <span className="profile-summary-label">GON Supervisor</span>
                <span className="profile-summary-value">Amina Mohammed</span>
              </div>
            </div>
            <div className="profile-summary-column">
              <div className="profile-summary-row">
                <span className="profile-summary-label">Location</span>
                <span className="profile-summary-value">Akwa Ibom</span>
              </div>
              <div className="profile-summary-row">
                <span className="profile-summary-label">ECEWS Supervisor</span>
                <span className="profile-summary-value">Mike Bolaji</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <AppButton
          type="button"
          className={`profile-tab ${activeTab === 'employment' ? 'profile-tab-active' : ''}`}
          onClick={() => setActiveTab('employment')}
        >
          Employment Information
        </AppButton>
        <AppButton
          type="button"
          className={`profile-tab ${activeTab === 'contract' ? 'profile-tab-active' : 'profile-tab-muted'}`}
          onClick={() => setActiveTab('contract')}
        >
          Contract
        </AppButton>
      </div>

      {activeTab === 'employment' && (
        <div className="profile-sections-grid">
        <div className="profile-section-card">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Contact Information</h3>
          </div>
          <div className="profile-section-body">
            <div className="profile-section-row ">
              <div className="profile-field">
                <span className="profile-field-label">Phone Number</span>
                <span className="profile-field-value">Field Operations</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Email Address</span>
                <span className="profile-field-value">Lagos State</span>
              </div>
            </div>
            <div className="profile-section-row">
              <div className="profile-field">
                <span className="profile-field-label">Emergency Contact Name</span>
                <span className="profile-field-value">Amina Mohammed</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Emergency Contact Phone</span>
                <span className="profile-field-value">Mike Bolaji</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section-card">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Banking Details</h3>
          </div>
          <div className="profile-section-body">
            <div className="profile-section-row profile-section-row-three">
              <div className="profile-field">
                <span className="profile-field-label">Bank Name</span>
                <span className="profile-field-value">First Bank</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Account Number</span>
                <span className="profile-field-value profile-field-strong">0123456789</span>
              </div>
            </div>
            <div className="profile-section-row">
              <div className="profile-field">
                <span className="profile-field-label">Account Name</span>
                <span className="profile-field-value">John Adeyemi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section-card">
          <div className="profile-section-header">
            <h3 className="profile-section-title">Contract Details</h3>
          </div>
          <div className="profile-section-body">
            <div className="profile-section-row">
              <div className="profile-field">
                <span className="profile-field-label">Designation</span>
                <span className="profile-field-value">Case Manager</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Facility</span>
                <span className="profile-field-value">UUTH</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">LGA</span>
                <span className="profile-field-value">Uyo</span>
              </div>
            </div>
            <div className="profile-section-row">
              <div className="profile-field">
                <span className="profile-field-label">Employee Code/ID</span>
                <span className="profile-field-value">AKS/UYO/09123</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Project</span>
                <span className="profile-field-value">ACE5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section-card">
          <div className="profile-section-header">
            <h3 className="profile-section-title">NIN and TIN Details</h3>
          </div>
          <div className="profile-section-body">
            <div className="profile-section-row">
              <div className="profile-field">
                <span className="profile-field-label">NIN Name</span>
                <span className="profile-field-value">John Adeyemi</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">NIN Number</span>
                <span className="profile-field-value profile-field-strong">1234567890</span>
              </div>
            </div>
            <div className="profile-section-row">
              <div className="profile-field">
                <span className="profile-field-label">TIN Name</span>
                <span className="profile-field-value">John Adeyemi</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">TIN Number</span>
                <span className="profile-field-value profile-field-strong">1234567890</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'contract' && (
        <div className="profile-contract-grid">
          <div className="profile-section-card profile-signature-card">
            <div className="profile-section-header">
              <h3 className="profile-section-title">Digital Signature</h3>
            </div>
            <div className="profile-signature-body">
              <div className="profile-signature-box">
                {signaturePreview && (
                  <img
                    src={signaturePreview}
                    alt="Signature preview"
                    className="profile-modal-signature-preview"
                  />
                )}
              </div>
              <div className="profile-signature-actions">
                <AppButton
                  type="button"
                  className="profile-signature-btn profile-signature-btn-primary"
                  onClick={openSignatureModal}
                >
                  Replace
                </AppButton>
                <AppButton
                  type="button"
                  className="profile-signature-btn profile-signature-btn-danger"
                  onClick={() => {
                    setSignaturePreview(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  Delete
                </AppButton>
              </div>
            </div>
          </div>

          <div className="profile-section-card profile-contract-card">
            <div className="profile-section-header">
              <h3 className="profile-section-title">Contract Letter</h3>
            </div>
            <div className="profile-contract-list">
              <div className="profile-contract-item">
                <div className="profile-contract-info">
                  <div className="profile-contract-title">Letter of Renewal - Sep, 2026.pdf</div>
                  <div className="profile-contract-period">Sep, 2025 - Mar, 2026</div>
                  <span className="profile-contract-status profile-contract-status-pending">Pending</span>
                </div>
                <div className="profile-contract-actions">
                  {/* <AppButton type="button" className="profile-contract-btn profile-contract-btn-ghost">
                    View
                  </AppButton> */}
                  <AppButton
                    type="button"
                    className="profile-contract-btn profile-contract-btn-primary"
                    onClick={() => openContractPreview('sign')}
                  >
                    Sign
                  </AppButton>
                </div>
              </div>

              <div className="profile-contract-item">
                <div className="profile-contract-info">
                  <div className="profile-contract-title">Letter of Renewal - Mar, 2025.pdf</div>
                  <div className="profile-contract-period">Mar, 2025 - Aug, 2026</div>
                  <span className="profile-contract-status profile-contract-status-signed">Signed</span>
                </div>
                <div className="profile-contract-actions">
                  {/* <AppButton type="button" className="profile-contract-btn profile-contract-btn-ghost">
                    View
                  </AppButton> */}
                  <AppButton
                    type="button"
                    className="profile-contract-btn profile-contract-btn-outline"
                    onClick={() => openContractPreview('download')}
                  >
                    Download
                  </AppButton>
                </div>
              </div>

              <div className="profile-contract-item">
                <div className="profile-contract-info">
                  <div className="profile-contract-title">Letter of Renewal - Sep, 2026.pdf</div>
                  <div className="profile-contract-period">Sep, 2025 - Mar, 2026</div>
                  <span className="profile-contract-status profile-contract-status-signed">Signed</span>
                </div>
                <div className="profile-contract-actions">
                  {/* <AppButton type="button" className="profile-contract-btn profile-contract-btn-ghost">
                    View
                  </AppButton> */}
                  <AppButton
                    type="button"
                    className="profile-contract-btn profile-contract-btn-outline"
                    onClick={() => openContractPreview('download')}
                  >
                    Download
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSignatureModalOpen && (
        <div
          className="profile-modal-overlay"
          onClick={closeSignatureModal}
        >
          <div
            className={`profile-modal ${
              isSignatureModalClosing ? 'profile-modal-closing' : 'profile-modal-opening'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Digital Signature</h3>
              <AppButton
                type="button"
                className="profile-modal-close"
                aria-label="Close"
                onClick={closeSignatureModal}
              >
                ×
              </AppButton>
            </div>
            <div className="profile-modal-tabs">
              <AppButton
                type="button"
                className={`profile-modal-tab ${
                  signatureMode === 'draw' ? 'profile-modal-tab-active' : ''
                }`}
                onClick={() => setSignatureMode('draw')}
              >
                Draw signature
              </AppButton>
              <AppButton
                type="button"
                className={`profile-modal-tab ${
                  signatureMode === 'upload' ? 'profile-modal-tab-active' : ''
                }`}
                onClick={() => setSignatureMode('upload')}
              >
                Upload signature
              </AppButton>
            </div>
            <div className="profile-modal-body">
              <div className="profile-modal-signature-box">
                {signaturePreview && (
                  <img
                    src={signaturePreview}
                    alt="Signature preview"
                    className="profile-modal-signature-preview"
                  />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="profile-modal-file-input"
                 accept="image/*"
                style={{ display: 'none' }}
                 onChange={handleSignatureFileChange}
              />
            </div>
            <div className="profile-modal-footer">
              <AppButton
                type="button"
                className="profile-modal-btn profile-modal-btn-ghost"
                onClick={closeSignatureModal}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="profile-modal-btn profile-modal-btn-primary"
                onClick={handleSignatureUploadClick}
              >
                Upload
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isSuccessOpen && (
        <div
          className="profile-modal-overlay profile-sign-confirm-overlay"
          onClick={closeSuccess}
        >
          <div
            className={`profile-modal profile-success-modal ${
              isSuccessClosing ? 'profile-modal-closing' : 'profile-modal-opening'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <AppButton
              type="button"
              className="profile-modal-close profile-success-close"
              aria-label="Close"
              onClick={closeSuccess}
            >
              ×
            </AppButton>
            <div className="profile-success-body">
              <div className="profile-success-check">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#096D49" />
                  <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="profile-success-title">Congratulations!</h3>
              <p className="profile-success-message">Your contract has successfully been renewed</p>
            </div>
            <div className="profile-success-footer">
              <AppButton
                type="button"
                className="profile-modal-btn profile-modal-btn-primary profile-success-ok-btn"
                onClick={closeSuccess}
              >
                Okay
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isSignConfirmOpen && (
        <div
          className="profile-modal-overlay profile-sign-confirm-overlay"
          onClick={closeSignConfirm}
        >
          <div
            className={`profile-modal profile-sign-confirm-modal ${
              isSignConfirmClosing ? 'profile-modal-closing' : 'profile-modal-opening'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Sign Contract?</h3>
              <AppButton
                type="button"
                className="profile-modal-close"
                aria-label="Close"
                onClick={closeSignConfirm}
              >
                ×
              </AppButton>
            </div>
            <div className="profile-sign-confirm-body">
              <p className="profile-sign-confirm-text">
                By signing this contract, you confirm that you have read, understood, and agreed to all the terms and conditions outlined within. A signed copy will automatically be forwarded to the HR team for record-keeping.
              </p>
              <p className="profile-sign-confirm-question">Do you wish to proceed?</p>
            </div>
            <div className="profile-sign-confirm-footer">
              <AppButton
                type="button"
                className="profile-modal-btn profile-modal-btn-primary"
                onClick={handleSignConfirmContinue}
              >
                Continue
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isContractPreviewOpen && (
        <div
          className="profile-modal-overlay"
          onClick={closeContractPreview}
        >
          <div
            className={`profile-doc-modal ${
              isContractPreviewClosing ? 'profile-doc-modal-closing' : 'profile-doc-modal-opening'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-doc-body">
              <div className="profile-doc-preview">
                {/* Static preview of the contract document goes here */}
              </div>
            </div>
            <div className="profile-doc-footer">
              <AppButton
                type="button"
                className="profile-doc-btn profile-doc-btn-ghost"
                onClick={closeContractPreview}
              >
                Cancel
              </AppButton>
              {contractPreviewMode === 'download' && (
                <AppButton
                  type="button"
                  className="profile-doc-btn profile-doc-btn-outline"
                >
                  Download PDF
                </AppButton>
              )}
              {contractPreviewMode === 'sign' && (
                <AppButton
                  type="button"
                  className="profile-doc-btn profile-doc-btn-primary"
                  onClick={openSignConfirm}
                >
                  Sign Contract
                </AppButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile

