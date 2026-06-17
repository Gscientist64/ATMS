import React, { useState, useEffect, useRef } from 'react'
import './Profile.css'
import AppButton from '../../shared/AppButton'
import { adHocService, authService, contractService } from '../../services/api'
import SignatureCanvas from 'react-signature-canvas'
import ContractLetterTemplate from '../../HRIS/shared/ContractLetterTemplate'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('employment')
  
  // Modal states
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
  const [contracts, setContracts] = useState([])
  const [selectedContract, setSelectedContract] = useState(null)
  const [uploadingSignature, setUploadingSignature] = useState(false)
  const [signaturePad, setSignaturePad] = useState(null)
  const [signatureColor, setSignatureColor] = useState('#000000')
  const [signatureWidth, setSignatureWidth] = useState(2)

  // Sign Contract Letter states
  const [isSignLetterModalOpen, setIsSignLetterModalOpen] = useState(false)
  const [selectedContractLetter, setSelectedContractLetter] = useState(null)
  const [signingLetter, setSigningLetter] = useState(false)
  const [signLetterError, setSignLetterError] = useState('')

  // Profile picture states
  const [profilePictureModal, setProfilePictureModal] = useState(false)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const pictureFileInputRef = useRef(null)
  
  const fileInputRef = useRef(null)
  const [successMessage, setSuccessMessage] = useState('')

  // NEW: Documents states
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const documentsUploadInputRef = useRef(null)
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false)
  const [isDocumentPreviewClosing, setIsDocumentPreviewClosing] = useState(false)
  const [documentPreviewItem, setDocumentPreviewItem] = useState(null)

  useEffect(() => {
    fetchUserData()
    fetchContracts()
    fetchUserDocuments()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const userData = await adHocService.getProfile()
      setUser(userData)
      setError('')
    } catch (err) {
      setError('Failed to load profile data')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchContracts = async () => {
    try {
      const contractData = await contractService.getMyContracts()
      setContracts(contractData)
    } catch (err) {
      console.error('Error fetching contracts:', err)
    }
  }

  const fetchUserDocuments = async () => {
    try {
      const documents = await adHocService.getUserDocuments()
      setUploadedDocuments(documents || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
    }
  }

  // Profile picture functions
  const openProfilePictureModal = () => {
    setProfilePictureModal(true)
    setProfilePicturePreview(null)
    setError('')
  }

  const closeProfilePictureModal = () => {
    setProfilePictureModal(false)
    setProfilePicturePreview(null)
  }

  const handlePictureFileChange = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result)
      setError('')
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSignature = async (signatureDataUrl) => {
    try {
      setUploadingSignature(true)
      setError('')
      
      const base64Data = signatureDataUrl.split(',')[1]
      const result = await adHocService.uploadSignature(base64Data)
      
      await fetchUserData()
      closeSignatureModal()
      setSuccessMessage('Signature uploaded successfully!')
      setIsSuccessOpen(true)
    } catch (err) {
      console.error('Error uploading signature:', err)
      setError('Failed to upload signature: ' + (err.message || 'Unknown error'))
    } finally {
      setUploadingSignature(false)
    }
  }
  
  const handleDeleteProfilePicture = async () => {
    try {
      await adHocService.deleteProfilePicture()
      setUser(prev => ({ ...prev, profileImageUrl: null }))
      closeProfilePictureModal()
    } catch (err) {
      console.error('Error deleting profile picture:', err)
      setError('Failed to delete profile picture')
    }
  }

  const cancelProfilePhotoChange = () => {
    setProfilePicturePreview(null)
    if (pictureFileInputRef.current) {
      pictureFileInputRef.current.value = ''
    }
  }

  const handleUploadProfilePicture = async () => {
    if (!profilePicturePreview) return
  
    try {
      setUploadingPicture(true)
      setError('')
      
      const response = await fetch(profilePicturePreview)
      const blob = await response.blob()
      const fileExt = blob.type.split('/')[1] || 'jpg'
      const fileName = `profile-picture.${fileExt}`
      const file = new File([blob], fileName, { type: blob.type })
      
      const result = await adHocService.uploadProfilePicture(file)
      
      if (result && result.profileImageUrl) {
        setUser(prev => ({ 
          ...prev, 
          profileImageUrl: result.profileImageUrl + '?t=' + new Date().getTime()
        }))
        
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          currentUser.profileImageUrl = result.profileImageUrl
          localStorage.setItem('user', JSON.stringify(currentUser))
        }
        
        closeProfilePictureModal()
        setError('')
      } else {
        throw new Error('No profile image URL returned')
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err)
      setError('Failed to upload profile picture: ' + (err.message || 'Unknown error'))
    } finally {
      setUploadingPicture(false)
    }
  }

  const saveProfilePhoto = () => {
    if (profilePicturePreview) {
      handleUploadProfilePicture()
    }
  }

  // Signature functions
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

  const openContractPreview = (contract, mode = 'sign') => {
    setSelectedContract(contract)
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

  const openSignLetterModal = (letter) => {
    setSignLetterError('')
    setSelectedContractLetter(letter)
    setIsSignLetterModalOpen(true)
  }

  const closeSignLetterModal = () => {
    setIsSignLetterModalOpen(false)
    setSelectedContractLetter(null)
    setSignLetterError('')
  }

  const handleConfirmSignLetter = async () => {
    if (!selectedContractLetter) return
    setSigningLetter(true)
    setSignLetterError('')
    try {
      const element = document.querySelector('.profile-sign-letter-paper .agov-pip-gcl-preview-paper')
      if (!element) throw new Error('Letter preview not found')

      const { generateContractLetterPdfFile } = await import('../../utils/contractLetterPdf')
      const pdfFile = await generateContractLetterPdfFile(
        element,
        `Signed_Contract_Letter_${user?.fullName || 'Staff'}.pdf`,
      )

      await contractService.signContractLetter(selectedContractLetter.id, pdfFile)
      closeSignLetterModal()
      await fetchUserData()
      openSuccess('Contract letter signed successfully.')
    } catch (err) {
      setSignLetterError(err.message || 'Failed to sign contract letter')
    } finally {
      setSigningLetter(false)
    }
  }

  const openSuccess = (message = 'Your contract has successfully been renewed') => {
    setSuccessMessage(message)
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

  const handleSignConfirmContinue = async () => {
    closeSignConfirm()
    
    if (selectedContract) {
      try {
        setUploadingSignature(true)
        
        if (signaturePreview) {
          const base64Data = signaturePreview.split(',')[1]
          await adHocService.uploadSignature(base64Data)
        }
        
        await contractService.signContract(selectedContract.id)
        
        await fetchUserData()
        await fetchContracts()
        
        setSignaturePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        openSuccess('Contract signed successfully!')
      } catch (err) {
        console.error('Error signing contract:', err)
        setError('Failed to sign contract: ' + (err.message || 'Unknown error'))
      } finally {
        setUploadingSignature(false)
      }
    } else {
      openSuccess()
    }
  }

  const handleSignatureUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSignatureFileChange = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setSignaturePreview(reader.result)
      setError('')
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteSignature = async () => {
    try {
      await adHocService.deleteSignature()
      setSignaturePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await fetchUserData()
    } catch (err) {
      console.error('Error deleting signature:', err)
      setError('Failed to delete signature')
    }
  }

  const handleDownloadContract = async (contract) => {
    try {
      const blob = await contractService.downloadContract(contract.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = contract.title
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading contract:', err)
      setError('Failed to download contract')
    }
  }

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  // NEW: Document Management Functions
  const handleDocumentsUploadClick = () => {
    if (documentsUploadInputRef.current) {
      documentsUploadInputRef.current.click()
    }
  }

  const handleDocumentsFileChange = async (event) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    if (!files.length) return
  
    setUploadingPicture(true)
    try {
      for (const file of files) {
        const result = await adHocService.uploadDocument(file)
        setUploadedDocuments(prev => [
          ...prev,
          {
            id: result.id,
            fileName: result.fileName,
            fileUrl: result.fileUrl,
            fileType: result.fileType,
            fileSize: result.fileSize,
            uploadedAt: result.uploadedAt
          }
        ])
      }
      setSuccessMessage('Documents uploaded successfully!')
      setIsSuccessOpen(true)
    } catch (err) {
      console.error('Error uploading documents:', err)
      setError('Failed to upload documents: ' + (err.message || 'Unknown error'))
    } finally {
      setUploadingPicture(false)
    }
  
    if (documentsUploadInputRef.current) {
      documentsUploadInputRef.current.value = ''
    }
  }

  const openDocumentPreview = (item) => {
    setDocumentPreviewItem(item)
    setIsDocumentPreviewClosing(false)
    setIsDocumentPreviewOpen(true)
  }

  const closeDocumentPreview = () => {
    setIsDocumentPreviewClosing(true)
    setTimeout(() => {
      setIsDocumentPreviewOpen(false)
      setIsDocumentPreviewClosing(false)
      setDocumentPreviewItem(null)
    }, 250)
  }

  const handleDeleteUploadedDocument = async (id) => {
    try {
      await adHocService.deleteDocument(id)
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== id))
      setSuccessMessage('Document deleted successfully!')
      setIsSuccessOpen(true)
    } catch (err) {
      console.error('Error deleting document:', err)
      setError('Failed to delete document')
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">{error}</div>
        <AppButton onClick={() => window.location.reload()} className="profile-retry-btn">
          Retry
        </AppButton>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">No user data found</div>
        <AppButton onClick={handleLogout} className="profile-logout-btn">
          Go to Login
        </AppButton>
      </div>
    )
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
            src={user.profileImageUrl 
              ? `http://localhost:5087${user.profileImageUrl}?t=${new Date().getTime()}` 
              : "./profile-images/default-avatar.png"}
            alt={user.fullName}
            className="profile-photo"
          />
          <div className="profile-photo-overlay">
            <AppButton
              type="button"
              className="profile-photo-edit-btn"
              onClick={openProfilePictureModal}
            >
              Edit
            </AppButton>
          </div>
          {profilePicturePreview && (
            <div className="profile-photo-actions">
              <AppButton type="button" className="profile-photo-cancel-btn" onClick={cancelProfilePhotoChange}>
                Cancel
              </AppButton>
              <AppButton type="button" className="profile-photo-save-btn" onClick={saveProfilePhoto}>
                Save
              </AppButton>
            </div>
          )}
          <input
            ref={pictureFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePictureFileChange}
          />
        </div>
        <div className="profile-summary">
          <div className="profile-summary-header">
            <h2 className="profile-name">{user.fullName}</h2>
          </div>
          <div className="profile-summary-grid">
            <div className="profile-summary-column">
              <div className="profile-summary-row">
                <span className="profile-summary-label">Contract Status</span>
                <span className="profile-status-badge">{user.contractStatus || 'Active'}</span>
              </div>
              <div className="profile-summary-row">
                <span className="profile-summary-label">Designation</span>
                <span className="profile-summary-value">{user.designation || 'Not specified'}</span>
              </div>
            </div>
            <div className="profile-summary-column">
              <div className="profile-summary-row">
                <span className="profile-summary-label">Department</span>
                <span className="profile-summary-value">{user.department || 'Not specified'}</span>
              </div>
              <div className="profile-summary-row">
                <span className="profile-summary-label">Facility Supervisor</span>
                <span className="profile-summary-value">{user.gonSupervisorName || 'Not assigned'}</span>
              </div>
            </div>
            <div className="profile-summary-column">
              <div className="profile-summary-row">
                <span className="profile-summary-label">Location</span>
                <span className="profile-summary-value">{user.state || 'Not specified'}</span>
              </div>
              <div className="profile-summary-row">
                <span className="profile-summary-label">ECEWS Supervisor</span>
                <span className="profile-summary-value">{user.ecewsSupervisorName || 'Not assigned'}</span>
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
          className={`profile-tab ${activeTab === 'documents' ? 'profile-tab-active' : 'profile-tab-muted'}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
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
              <div className="profile-section-row">
                <div className="profile-field">
                  <span className="profile-field-label">Phone Number</span>
                  <span className="profile-field-value">{user.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">Email Address</span>
                  <span className="profile-field-value">{user.email}</span>
                </div>
              </div>
              <div className="profile-section-row">
                <div className="profile-field">
                  <span className="profile-field-label">Emergency Contact Name</span>
                  <span className="profile-field-value">{user.emergencyContactName || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">Emergency Contact Phone</span>
                  <span className="profile-field-value">{user.emergencyContactPhone || 'Not provided'}</span>
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
                  <span className="profile-field-value">{user.bankName || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">Account Number</span>
                  <span className="profile-field-value profile-field-strong">{user.accountNumber || 'Not provided'}</span>
                </div>
              </div>
              <div className="profile-section-row">
                <div className="profile-field">
                  <span className="profile-field-label">Account Name</span>
                  <span className="profile-field-value">{user.accountName || 'Not provided'}</span>
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
                  <span className="profile-field-value">{user.designation || 'Not specified'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">Facility</span>
                  <span className="profile-field-value">{user.healthFacility || 'Not specified'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">LGA</span>
                  <span className="profile-field-value">{user.lga || 'Not specified'}</span>
                </div>
              </div>
              <div className="profile-section-row">
                <div className="profile-field">
                  <span className="profile-field-label">Employee Code/ID</span>
                  <span className="profile-field-value">{user.employeeCode || 'Not assigned'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">Project</span>
                  <span className="profile-field-value">{user.project || 'Not specified'}</span>
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
                  <span className="profile-field-value">{user.ninName || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">NIN Number</span>
                  <span className="profile-field-value profile-field-strong">{user.ninNumber || 'Not provided'}</span>
                </div>
              </div>
              <div className="profile-section-row">
                <div className="profile-field">
                  <span className="profile-field-label">TIN Name</span>
                  <span className="profile-field-value">{user.tinName || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-field-label">TIN Number</span>
                  <span className="profile-field-value profile-field-strong">{user.tinNumber || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="profile-documents-pane">
          {uploadedDocuments.length > 0 ? (
            uploadedDocuments.map((doc) => (
              <div key={doc.id} className="profile-documents-uploaded-card">
                <div className="profile-documents-main">
                  <h3 className="profile-documents-title">Credentials</h3>
                  <div className="profile-documents-uploaded-file">{doc.fileName}</div>
                </div>
                <div className="profile-documents-actions">
                  <AppButton
                    type="button"
                    className="profile-documents-action profile-documents-action-reupload"
                    onClick={() => openDocumentPreview(doc)}
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
                    className="profile-documents-action profile-documents-action-delete"
                    onClick={() => handleDeleteUploadedDocument(doc.id)}
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
            <div className="profile-documents-empty">
              <p>No documents uploaded yet.</p>
            </div>
          )}

          <div className="profile-documents-footer">
            <AppButton type="button" className="profile-documents-upload-btn" onClick={handleDocumentsUploadClick}>
              Upload
            </AppButton>
          </div>

          <input
            ref={documentsUploadInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={handleDocumentsFileChange}
          />
        </div>
      )}

      {isDocumentPreviewOpen && documentPreviewItem && (
        <div className="profile-modal-overlay" onClick={closeDocumentPreview}>
          <div
            className={`profile-doc-modal ${
              isDocumentPreviewClosing ? 'profile-doc-modal-closing' : 'profile-doc-modal-opening'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-doc-body">
              <div className="profile-doc-preview profile-upload-doc-preview">
                {documentPreviewItem?.fileUrl ? (
                  documentPreviewItem.fileType?.startsWith('image/') ? (
                    <img
                      src={`http://localhost:5087${documentPreviewItem.fileUrl}`}
                      alt={documentPreviewItem.fileName}
                      className="profile-upload-doc-image"
                    />
                  ) : (
                    <iframe
                      src={`http://localhost:5087${documentPreviewItem.fileUrl}`}
                      title={documentPreviewItem.fileName || 'Uploaded document'}
                      className="profile-upload-doc-frame"
                    />
                  )
                ) : (
                  <div className="profile-upload-doc-empty">No document preview available.</div>
                )}
              </div>
            </div>
            <div className="profile-doc-footer">
              <AppButton
                type="button"
                className="profile-doc-btn profile-doc-btn-ghost"
                onClick={closeDocumentPreview}
              >
                Close
              </AppButton>
            </div>
          </div>
        </div>
      )}

{activeTab === 'contract' && (
  <div className="profile-contract-grid">
    {/* Digital Signature Card */}
    <div className="profile-section-card profile-signature-card">
      <div className="profile-section-header">
        <h3 className="profile-section-title">Digital Signature</h3>
      </div>
      <div className="profile-signature-body">
        <div className="profile-signature-box">
          {user.digitalSignatureUrl ? (
            <img
              src={`http://localhost:5087${user.digitalSignatureUrl}?t=${new Date().getTime()}`}
              alt="Signature"
              className="profile-modal-signature-preview"
            />
          ) : signaturePreview ? (
            <img
              src={signaturePreview}
              alt="Signature preview"
              className="profile-modal-signature-preview"
            />
          ) : (
            <div className="profile-signature-placeholder">
              No signature uploaded
            </div>
          )}
        </div>
        <div className="profile-signature-actions">
          <AppButton
            type="button"
            className="profile-signature-btn profile-signature-btn-primary"
            onClick={openSignatureModal}
            disabled={uploadingSignature}
          >
            {uploadingSignature ? 'Uploading...' : (user.digitalSignatureUrl ? 'Replace' : 'Upload')}
          </AppButton>
          {(user.digitalSignatureUrl || signaturePreview) && (
            <AppButton
              type="button"
              className="profile-signature-btn profile-signature-btn-danger"
              onClick={handleDeleteSignature}
              disabled={uploadingSignature}
            >
              Delete
            </AppButton>
          )}
        </div>
      </div>
    </div>

    {/* Contracts & Contract Letters Card - Combined */}
    <div className="profile-section-card profile-contract-card">
      <div className="profile-section-header">
        <h3 className="profile-section-title">Contracts &amp; Letters</h3>
        <AppButton
          type="button"
          className="profile-refresh-btn"
          onClick={() => fetchContracts()}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 2.5V6.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.5 9.5V13.5H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.5 9.5C12.8333 11.1667 11.6667 12.3333 10 13C8.33333 13.6667 6.66667 13.6667 5 13C3.33333 12.3333 2.16667 11.1667 1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M2.5 6.5C3.16667 4.83333 4.33333 3.66667 6 3C7.66667 2.33333 9.33333 2.33333 11 3C12.6667 3.66667 13.8333 4.83333 14.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Refresh
        </AppButton>
      </div>
      <div className="profile-contract-list">
        {/* Regular Contracts */}
        {contracts.length > 0 && (
          <>
            <h4 className="profile-contract-subtitle">Signed Contracts</h4>
            {contracts.map((contract) => (
              <div key={contract.id} className="profile-contract-item">
                <div className="profile-contract-info">
                  <div className="profile-contract-title">{contract.title}</div>
                  <div className="profile-contract-period">{contract.period}</div>
                  <span className={`profile-contract-status profile-contract-status-${contract.statusClass}`}>
                    {contract.status} {contract.signedAt ? `(Signed: ${new Date(contract.signedAt).toLocaleDateString()})` : ''}
                  </span>
                </div>
                <div className="profile-contract-actions">
                  <AppButton
                    type="button"
                    className="profile-contract-btn profile-contract-btn-primary"
                    onClick={() => {
                      if (contract.status === 'Pending') {
                        openContractPreview(contract, 'sign')
                      } else {
                        handleDownloadContract(contract)
                      }
                    }}
                  >
                    {contract.status === 'Pending' ? 'Sign' : 'Download'}
                  </AppButton>
                  {contract.status === 'Signed' && (
                    <AppButton
                      type="button"
                      className="profile-contract-btn profile-contract-btn-outline"
                      onClick={() => handleDownloadContract(contract)}
                      style={{ marginLeft: '8px' }}
                    >
                      View
                    </AppButton>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Contract Letters from HR */}
        {user.contractLetters && user.contractLetters.length > 0 && (
          <>
            <h4 className="profile-contract-subtitle">Contract Letters</h4>
            {user.contractLetters.map((letter, idx) => (
              <div key={letter.id} className="profile-contract-item">
                <div className="profile-contract-info">
                  <div className="profile-contract-title">Contract Letter {idx + 1}</div>
                  <div className="profile-contract-period">Generated: {new Date(letter.generatedAt).toLocaleDateString()}</div>
                  <div className="profile-contract-filename">{letter.fileName}</div>
                  <span className={`profile-contract-status profile-contract-status-${letter.isSigned ? 'signed' : 'pending'}`}>
                    {letter.isSigned ? `Signed${letter.signedAt ? ` (${new Date(letter.signedAt).toLocaleDateString()})` : ''}` : 'Unsigned'}
                  </span>
                </div>
                <div className="profile-contract-actions">
                  {!letter.isSigned && (
                    <AppButton
                      type="button"
                      className="profile-contract-btn profile-contract-btn-primary"
                      onClick={() => openSignLetterModal(letter)}
                      disabled={!user.digitalSignatureUrl}
                      title={!user.digitalSignatureUrl ? 'Add a signature above before signing a contract letter' : undefined}
                    >
                      Sign Contract Letter
                    </AppButton>
                  )}
                  <AppButton
                    type="button"
                    className="profile-contract-btn profile-contract-btn-outline"
                    onClick={() => window.open(`http://localhost:5087${letter.fileUrl}`, '_blank')}
                  >
                    Download
                  </AppButton>
                </div>
              </div>
            ))}
          </>
        )}

        {contracts.length === 0 && (!user.contractLetters || user.contractLetters.length === 0) && (
          <div className="profile-no-contracts">No contracts or letters available</div>
        )}
      </div>
    </div>
  </div>
)}
      {/* Profile Picture Modal */}
      {profilePictureModal && (
        <div className="profile-modal-overlay" onClick={closeProfilePictureModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3 className="profile-modal-title">Update Profile Picture</h3>
              <AppButton
                type="button"
                className="profile-modal-close"
                aria-label="Close"
                onClick={closeProfilePictureModal}
              >
                ×
              </AppButton>
            </div>
            
            <div className="profile-modal-body">
              <div className="profile-picture-preview">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile preview"
                    className="profile-preview-img"
                  />
                ) : user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Current profile"
                    className="profile-preview-img"
                  />
                ) : (
                  <div className="profile-preview-placeholder">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="#ccc" strokeWidth="2" fill="none"/>
                      <path d="M20 10V20M20 30H20.01" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p>No image selected</p>
                  </div>
                )}
              </div>
              
              <input
                ref={pictureFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePictureFileChange}
              />
              
              <div className="profile-picture-actions">
                <AppButton
                  type="button"
                  className="profile-picture-btn profile-picture-btn-primary"
                  onClick={() => pictureFileInputRef.current?.click()}
                >
                  Choose Image
                </AppButton>
                
                {user.profileImageUrl && !profilePicturePreview && (
                  <AppButton
                    type="button"
                    className="profile-picture-btn profile-picture-btn-danger"
                    onClick={handleDeleteProfilePicture}
                  >
                    Delete Current
                  </AppButton>
                )}
                
                {profilePicturePreview && (
                  <AppButton
                    type="button"
                    className="profile-picture-btn profile-picture-btn-success"
                    onClick={handleUploadProfilePicture}
                    disabled={uploadingPicture}
                  >
                    {uploadingPicture ? 'Uploading...' : 'Upload'}
                  </AppButton>
                )}
              </div>
            </div>
            
            <div className="profile-modal-footer">
              <AppButton
                type="button"
                className="profile-modal-btn profile-modal-btn-ghost"
                onClick={closeProfilePictureModal}
              >
                Cancel
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {isSignatureModalOpen && (
        <div
          className="profile-modal-overlay"
          onClick={closeSignatureModal}
        >
          <div
            className={`profile-modal profile-signature-modal ${
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
              {signatureMode === 'draw' ? (
                <>
                  <div className="signature-controls">
                    <div className="signature-control-group">
                      <label>Color:</label>
                      <input
                        type="color"
                        value={signatureColor}
                        onChange={(e) => setSignatureColor(e.target.value)}
                        className="signature-color-picker"
                      />
                    </div>
                    <div className="signature-control-group">
                      <label>Width:</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={signatureWidth}
                        onChange={(e) => setSignatureWidth(parseInt(e.target.value))}
                        className="signature-width-slider"
                      />
                      <span className="signature-width-value">{signatureWidth}px</span>
                    </div>
                  </div>
                  
                  <div className="signature-canvas-container">
                    <SignatureCanvas
                      ref={(ref) => setSignaturePad(ref)}
                      penColor={signatureColor}
                      minWidth={signatureWidth}
                      maxWidth={signatureWidth}
                      canvasProps={{
                        className: 'signature-canvas',
                        width: 500,
                        height: 200,
                        style: {
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: 'white'
                        }
                      }}
                    />
                  </div>
                  
                  <div className="signature-actions">
                    <AppButton
                      type="button"
                      className="signature-clear-btn"
                      onClick={() => signaturePad?.clear()}
                    >
                      Clear
                    </AppButton>
                  </div>
                </>
              ) : (
                <>
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
                  <div className="signature-upload-actions">
                    <AppButton
                      type="button"
                      className="signature-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Image
                    </AppButton>
                  </div>
                </>
              )}
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
                onClick={signatureMode === 'draw' ? 
                  () => {
                    if (signaturePad && !signaturePad.isEmpty()) {
                      const signatureData = signaturePad.toDataURL('image/png')
                      setSignaturePreview(signatureData)
                      handleUploadSignature(signatureData)
                    } else {
                      setError('Please draw your signature first')
                    }
                  } : 
                  () => {
                    if (signaturePreview) {
                      handleUploadSignature(signaturePreview)
                    }
                  }
                }
                disabled={uploadingSignature}
              >
                {uploadingSignature ? 'Uploading...' : 'Save Signature'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
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
              <h3 className="profile-success-title">Success!</h3>
              <p className="profile-success-message">{successMessage}</p>
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

      {/* Sign Confirm Modal */}
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
                disabled={uploadingSignature}
              >
                {uploadingSignature ? 'Processing...' : 'Continue'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Contract Preview Modal */}
      {isContractPreviewOpen && selectedContract && (
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
                <h3>{selectedContract.title}</h3>
                <p><strong>Period:</strong> {selectedContract.period}</p>
                <p><strong>Status:</strong> {selectedContract.status}</p>
                <p><strong>Start Date:</strong> {new Date(selectedContract.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(selectedContract.endDate).toLocaleDateString()}</p>
                {selectedContract.signedAt && (
                  <p><strong>Signed On:</strong> {new Date(selectedContract.signedAt).toLocaleDateString()}</p>
                )}
                <div className="profile-doc-placeholder">
                  PDF preview would appear here
                </div>
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
                  onClick={() => {
                    handleDownloadContract(selectedContract)
                    closeContractPreview()
                  }}
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

      {/* Sign Contract Letter Modal */}
      {isSignLetterModalOpen && selectedContractLetter && (
        <div className="profile-modal-overlay" onClick={closeSignLetterModal}>
          <div
            className="profile-doc-modal profile-doc-modal-opening profile-sign-letter-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-doc-body profile-sign-letter-paper">
              <ContractLetterTemplate
                staffName={user.fullName}
                jobRoleLabel={selectedContractLetter.jobRoleLabel}
                projectLabel={selectedContractLetter.projectLabel}
                startDate={selectedContractLetter.startDate}
                endDate={selectedContractLetter.endDate}
                location={selectedContractLetter.location}
                reportingLine={selectedContractLetter.reportingLine}
                salary={selectedContractLetter.salary}
                contractDate={selectedContractLetter.contractDate}
                staffSignatureUrl={
                  user.digitalSignatureUrl ? `http://localhost:5087${user.digitalSignatureUrl}` : null
                }
              />
            </div>
            {signLetterError && <p className="profile-sign-letter-error">{signLetterError}</p>}
            <div className="profile-doc-footer">
              <AppButton
                type="button"
                className="profile-doc-btn profile-doc-btn-ghost"
                onClick={closeSignLetterModal}
                disabled={signingLetter}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="profile-doc-btn profile-doc-btn-primary"
                onClick={handleConfirmSignLetter}
                disabled={signingLetter}
              >
                {signingLetter ? 'Signing...' : 'Sign Contract Letter'}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile