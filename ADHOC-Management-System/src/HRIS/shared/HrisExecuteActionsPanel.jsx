// src/HRIS/shared/HrisExecuteActionsPanel.jsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
// jspdf + html2canvas are large (~1.2MB) — loaded on demand only when generating a PDF
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import ContractLetterTemplate from './ContractLetterTemplate'
import './HrisExecuteActionsPanel.css'
import { renewContract, initiatePip, terminateEmployee, sendContractLetter, getEmployeeByPublicId, saveContractLetter } from '../../services/api';
import { configurationService } from '../../services/api'
import { useActionCompletedToast } from '../../shared/ActionCompletedToast';
import { generateContractLetterPdfFile } from '../../utils/contractLetterPdf';

const CONTRACT_DURATION_OPTIONS = [
  { value: '1m', label: '1 month' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
]

const CONTRACT_LETTER_PROJECT_OPTIONS = [
  { value: 'ace-5', label: 'ACE 5' },
  { value: 'speed', label: 'SPEED' },
  { value: 'global-fund', label: 'Global Fund' },
]

const CONTRACT_LETTER_JOB_ROLE_OPTIONS = [
  { value: 'data-entry-clerk', label: 'Data Entry Clerk' },
  { value: 'case-manager', label: 'Case Manager' },
  { value: 'counsellor-tester', label: 'Counsellor Tester' },
  { value: 'it-ancillary', label: 'IT Ancillary' },
  { value: 'si-ancillary', label: 'SI Ancillary' },
  { value: 'programs-ancillary', label: 'Programs Ancillary' },
  { value: 'finance-ancillary', label: 'Finance Ancillary' },
]

const PIP_QUILL_MODULES = {
  toolbar: [
    [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    ['link', 'image'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
  ],
}

const PIP_QUILL_FORMATS = [
  'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'link', 'image', 'list', 'bullet', 'align',
]

function IconRenewContract({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 16v5h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconInitiatePip({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5L19.5 6.75V17.25L12 21.5L4.5 17.25V6.75L12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 8.25V13.25M12 16.25V16.35" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTerminate({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconGenerateContractLetter({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3h6l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3v5h5M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const TERMINATION_STEPS = [
  { id: 'details', label: 'Termination Details' },
  { id: 'clearance', label: 'Exit Clearance' },
  { id: 'review', label: 'Final Review' },
]

const EXIT_CLEARANCE_ITEMS = [
  { id: 'equipment', title: 'Company Equipment Returned', sub: 'Laptop, ID card, keys, mobile phone, etc' },
  { id: 'handover', title: 'Handover Documents Submitted', sub: 'Final reports, project files, passwords' },
  { id: 'interview', title: 'Exit Interview Completed', sub: 'HR exit interview conducted and documented' },
  { id: 'access', title: 'System Access Revoked', sub: 'Emails, databases, file systems, building access' },
  { id: 'severance', title: 'Severance Package Offered', sub: null },
]

const TERM_STEPS = 3

const INITIAL_TERM_CHECKLIST = {
  equipment: false,
  handover: false,
  interview: false,
  access: false,
  severance: false,
}

const FINAL_REVIEW_CLEARANCE = [
  { id: 'equipment', label: 'Equipment Returned' },
  { id: 'handover', label: 'Documents Submitted' },
  { id: 'interview', label: 'Exit Interview Completed' },
  { id: 'access', label: 'Access Revoked' },
  { id: 'severance', label: 'Final Payment Processed' },
]

const FINAL_REVIEW_ATTESTATION =
  "I confirm that I have reviewed all termination details and clearance items. I understand that this action will immediately terminate the staff member's employment and revoke all system access. All required documentation will be generated and this action cannot be undone."

const MENU_ID = 'agov-pip-execute-menu'

const HrisExecuteActionsPanel = ({
  showRenewContract = true,
  showInitiatePip = true,
  showGenerateContractLetter = true,
  triggerClassName = 'agov-pip-execute',
  triggerContent = 'Execute actions',
  triggerAriaLabel = 'Execute actions',
  publicId,           
  employeeCode,       
  staffName,
  staffEmail = ''
}) => {

//  const { showActionCompleted } = useActionCompletedToast();
  // Guard clause - check if publicId exists
  if (!publicId) {
    return null; // Return null to prevent rendering
  }



  const [executeMenuOpen, setExecuteMenuOpen] = useState(false)
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [renewSuccessOpen, setRenewSuccessOpen] = useState(false)
  const [pipModalOpen, setPipModalOpen] = useState(false)
  const [pipSuccessOpen, setPipSuccessOpen] = useState(false)
  const [termModalOpen, setTermModalOpen] = useState(false)
  const [termEffectiveDate, setTermEffectiveDate] = useState(null)
  const [termEffectiveDateOpen, setTermEffectiveDateOpen] = useState(false)
  const [termReason, setTermReason] = useState('')
  const [termNotes, setTermNotes] = useState('')
  const [termStep, setTermStep] = useState(1)
  const [termChecklistNa, setTermChecklistNa] = useState(false)
  const [termChecklist, setTermChecklist] = useState(() => ({ ...INITIAL_TERM_CHECKLIST }))
  const [termFinalReviewConfirm, setTermFinalReviewConfirm] = useState(false)
  const [termShowWarning, setTermShowWarning] = useState(false)
  const [termSuccessOpen, setTermSuccessOpen] = useState(false)
  const [contractDuration, setContractDuration] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
  const [pipStartDate, setPipStartDate] = useState(null)
  const [pipEndDate, setPipEndDate] = useState(null)
  const [pipStartDateOpen, setPipStartDateOpen] = useState(false)
  const [pipEndDateOpen, setPipEndDateOpen] = useState(false)
  const [pipObjective, setPipObjective] = useState('')
  const [pipActionPlan, setPipActionPlan] = useState('')
  const [processing, setProcessing] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const { showActionCompleted } = useActionCompletedToast();

  // Contract letter states
  const [contractLetterModalOpen, setContractLetterModalOpen] = useState(false)
  const [contractLetterProject, setContractLetterProject] = useState('')
  const [contractLetterJobRole, setContractLetterJobRole] = useState('')
  const [contractLetterStartDate, setContractLetterStartDate] = useState(null)
  const [contractLetterStartDateOpen, setContractLetterStartDateOpen] = useState(false)
  const [contractLetterEndDate, setContractLetterEndDate] = useState(null)
  const [contractLetterEndDateOpen, setContractLetterEndDateOpen] = useState(false)
  const [contractLetterLocation, setContractLetterLocation] = useState('')
  const [contractLetterReportingLine, setContractLetterReportingLine] = useState('')
  const [contractLetterSalary, setContractLetterSalary] = useState('')
  const [contractLetterDate, setContractLetterDate] = useState(null)
  const [contractLetterDateOpen, setContractLetterDateOpen] = useState(false)
  const [contractPreviewModalOpen, setContractPreviewModalOpen] = useState(false)
  const [forwardSuccessOpen, setForwardSuccessOpen] = useState(false)

  const executeWrapRef = useRef(null)
  const openRenewSuccessAfterFormCloseRef = useRef(false)
  const openTermSuccessAfterFormCloseRef = useRef(false)
  const openContractPreviewAfterFormCloseRef = useRef(false)
  const openForwardSuccessAfterPreviewCloseRef = useRef(false)

  // Close menu when clicking outside
  useEffect(() => {
    if (!executeMenuOpen) return
    const onDown = (e) => {
      if (executeWrapRef.current && !executeWrapRef.current.contains(e.target)) setExecuteMenuOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setExecuteMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [executeMenuOpen])

  // Escape key handlers for open modals
  useEffect(() => {
    if (!renewModalOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeRenewModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [renewModalOpen])
  useEffect(() => {
    if (!renewSuccessOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeRenewSuccessModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [renewSuccessOpen])
  useEffect(() => {
    if (!pipModalOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closePipModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [pipModalOpen])
  useEffect(() => {
    if (!contractLetterModalOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeContractLetterModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [contractLetterModalOpen])
  useEffect(() => {
    if (!contractPreviewModalOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeContractPreviewModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [contractPreviewModalOpen])
  useEffect(() => {
    if (!forwardSuccessOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeForwardSuccessModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [forwardSuccessOpen])
  useEffect(() => {
    if (!termModalOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeTermModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [termModalOpen])
  useEffect(() => {
    if (!termSuccessOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeTermSuccessModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [termSuccessOpen])

  // Close functions (immediate, no animation dependency)
  const closeRenewModal = () => {
    setRenewModalOpen(false)
    setStartDatePickerOpen(false)
    if (openRenewSuccessAfterFormCloseRef.current) {
      openRenewSuccessAfterFormCloseRef.current = false
      setRenewSuccessOpen(true)
    }
  }
  const closeRenewSuccessModal = () => setRenewSuccessOpen(false)
  const closePipModal = () => {
    setPipModalOpen(false)
    setPipStartDateOpen(false)
    setPipEndDateOpen(false)
  }
  const closeTermModal = () => {
    setTermModalOpen(false)
    setTermEffectiveDateOpen(false)
    setTermStep(1)
    setTermChecklistNa(false)
    setTermChecklist({ ...INITIAL_TERM_CHECKLIST })
    setTermFinalReviewConfirm(false)
    if (openTermSuccessAfterFormCloseRef.current) {
      openTermSuccessAfterFormCloseRef.current = false
      setTermSuccessOpen(true)
    }
  }
  const closeTermSuccessModal = () => setTermSuccessOpen(false)
  const closeContractLetterModal = () => {
    setContractLetterModalOpen(false)
    setContractLetterStartDateOpen(false)
    setContractLetterEndDateOpen(false)
    setContractLetterDateOpen(false)
    if (openContractPreviewAfterFormCloseRef.current) {
      openContractPreviewAfterFormCloseRef.current = false
      setContractPreviewModalOpen(true)
    }
  }
  const closeContractPreviewModal = () => {
    setContractPreviewModalOpen(false)
    if (openForwardSuccessAfterPreviewCloseRef.current) {
      openForwardSuccessAfterPreviewCloseRef.current = false
      setForwardSuccessOpen(true)
    }
  }
  const closeForwardSuccessModal = () => setForwardSuccessOpen(false)

  // Open handlers
  const openRenewModal = () => { setExecuteMenuOpen(false); setContractDuration(''); setStartDate(null); setRenewModalOpen(true) }
  const openPipModal = () => { setExecuteMenuOpen(false); setPipStartDate(null); setPipEndDate(null); setPipObjective(''); setPipActionPlan(''); setPipModalOpen(true) }
  const openTermModal = () => { setExecuteMenuOpen(false); setTermEffectiveDate(null); setTermReason(''); setTermNotes(''); setTermStep(1); setTermChecklistNa(false); setTermChecklist({ ...INITIAL_TERM_CHECKLIST }); setTermFinalReviewConfirm(false); setTermShowWarning(false); setTermModalOpen(true) }
  const openContractLetterModal = () => { setExecuteMenuOpen(false); setContractLetterProject(''); setContractLetterJobRole(''); setContractLetterStartDate(null); setContractLetterEndDate(null); setContractLetterLocation(''); setContractLetterReportingLine(''); setContractLetterSalary(''); setContractLetterDate(null); setContractLetterModalOpen(true) }

  // API Handlers
  const handleSubmitRenewContract = async () => {
    if (!contractDuration || !startDate) { alert('Please select duration and start date'); return }
    setProcessing(true)
    try {
      await renewContract({ userPublicId: publicId, duration: contractDuration, startDate })
      openRenewSuccessAfterFormCloseRef.current = true
      closeRenewModal()
    } catch (err) { alert(err.response?.data?.message || 'Renewal failed') } finally { setProcessing(false) }
  }

  const handleSubmitPip = async () => {
    if (!pipStartDate || !pipEndDate || !pipObjective.trim()) {
      alert('Please fill all PIP fields');
      return;
    }
    setProcessing(true);
    try {
      const payload = {
        employeeCode: employeeCode,  // Use employeeCode instead of staffId
        startDate: pipStartDate,
        endDate: pipEndDate,
        objective: pipObjective,
        actionPlan: pipActionPlan,
      };
      const result = await initiatePip(payload);
      setPipModalOpen(false);
      setPipSuccessOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate PIP');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteTermination = async () => {
    if (!termEffectiveDate || !termReason.trim()) { alert('Please provide effective date and reason'); return }
    if (!termChecklistNa && Object.values(termChecklist).some(v => !v)) { alert('Please complete all clearance items or check "Checklist does not apply"'); return }
    setProcessing(true)
    try {
      await terminateEmployee({
        staffPublicId: publicId,
        effectiveDate: termEffectiveDate,
        reason: termReason,
        additionalNotes: termNotes,
        equipmentReturned: termChecklist.equipment,
        handoverDocumentsSubmitted: termChecklist.handover,
        exitInterviewCompleted: termChecklist.interview,
        systemAccessRevoked: termChecklist.access,
        severanceProcessed: termChecklist.severance,
        checklistNotApplicable: termChecklistNa,
      })
      openTermSuccessAfterFormCloseRef.current = true
      closeTermModal()
    } catch (err) { alert(err.response?.data?.message || 'Termination failed') } finally { setProcessing(false) }
  }

  const handleGeneratePreview = () => {
    openContractPreviewAfterFormCloseRef.current = true
    closeContractLetterModal()
  }

  const [canGenerateContractLetter, setCanGenerateContractLetter] = useState(showGenerateContractLetter)

  useEffect(() => {
      checkContractLetterPermission()
  }, [])

  useEffect(() => {
      if (publicId && showGenerateContractLetter) {
          checkContractLetterPermission()
      }
  }, [publicId, showGenerateContractLetter])

  const checkContractLetterPermission = async () => {
    try {
        // Check if the current user has permission to generate contract letters
        const result = await configurationService.hasPermission('contractLetters')
        setCanGenerateContractLetter(result.hasPermission === true)
    } catch (err) {
        setCanGenerateContractLetter(false)
    }
  }

  // PDF Download with multi-page support
  const handleDownloadPDF = async () => {
    setGeneratingPDF(true)
    const element = document.querySelector('.agov-pip-gcl-preview-paper')
    if (!element) {
      alert('Preview content not found')
      setGeneratingPDF(false)
      return
    }
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210
      const pdfHeight = 297
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0
      let pageCount = 1

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
        pageCount++
      }
      pdf.save(`Contract_Letter_${staffName || 'Staff'}.pdf`)
    } catch (error) {
      alert('Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  // Forward to staff (send email)
  const handleForwardToStaff = async () => {
      setProcessing(true);
      try {
          const element = document.querySelector('.agov-pip-gcl-preview-paper');
          if (!element) throw new Error('Preview content not found');

          const pdfFile = await generateContractLetterPdfFile(element, `Contract_Letter_${staffName || 'Staff'}.pdf`);

          // Fetch staff details to get user ID
          const staffDetails = await getEmployeeByPublicId(publicId);
          if (staffDetails && staffDetails.id) {
              await saveContractLetter({
                  userId: staffDetails.id,
                  file: pdfFile,
                  fileName: `Contract_Letter_${staffName || 'Staff'}_${new Date().toISOString().split('T')[0]}.pdf`,
                  jobRoleLabel: contractLetterJobRole ? CONTRACT_LETTER_JOB_ROLE_OPTIONS.find(opt => opt.value === contractLetterJobRole)?.label : '',
                  projectLabel: contractLetterProject ? CONTRACT_LETTER_PROJECT_OPTIONS.find(opt => opt.value === contractLetterProject)?.label : '',
                  startDate: contractLetterStartDate,
                  endDate: contractLetterEndDate,
                  location: contractLetterLocation,
                  reportingLine: contractLetterReportingLine,
                  salary: contractLetterSalary,
                  contractDate: contractLetterDate,
              });
              showActionCompleted('Contract letter saved successfully. Staff can download it from their profile.');
          }

          openForwardSuccessAfterPreviewCloseRef.current = true;
          closeContractPreviewModal();
      } catch (err) {
          alert(err.message || 'Failed to save contract letter');
      } finally {
          setProcessing(false);
      }
  };

  const setChecklistValue = (id, checked) => setTermChecklist(prev => ({ ...prev, [id]: checked }))

  return (
    <>
      <div className="agov-pip-execute-wrap" ref={executeWrapRef}>
        <AppButton
          type="button"
          className={triggerClassName}
          aria-label={triggerAriaLabel}
          aria-haspopup="menu"
          aria-expanded={executeMenuOpen}
          aria-controls={MENU_ID}
          onClick={() => setExecuteMenuOpen(o => !o)}
        >
          {triggerContent}
        </AppButton>
        {executeMenuOpen && (
          <div className="agov-pip-execute-menu" id={MENU_ID} role="menu" aria-label="Actions">
            {showRenewContract && (
              <AppButton type="button" className="agov-pip-execute-item agov-pip-execute-item--green" role="menuitem" onClick={openRenewModal}>
                <IconRenewContract className="agov-pip-execute-item-icon" />
                Renew Contract
              </AppButton>
            )}
            {showInitiatePip && (
              <AppButton type="button" className="agov-pip-execute-item agov-pip-execute-item--amber" role="menuitem" onClick={openPipModal}>
                <IconInitiatePip className="agov-pip-execute-item-icon" />
                Initiate PIP
              </AppButton>
            )}
            {showGenerateContractLetter && canGenerateContractLetter && (
                <AppButton type="button" className="agov-pip-execute-item agov-pip-execute-item--green" role="menuitem" onClick={openContractLetterModal}>
                    <IconGenerateContractLetter className="agov-pip-execute-item-icon" />
                    Generate Contract Letter
                </AppButton>
            )}
            <AppButton type="button" className="agov-pip-execute-item agov-pip-execute-item--coral" role="menuitem" onClick={openTermModal}>
              <IconTerminate className="agov-pip-execute-item-icon" />
              Terminate
            </AppButton>
          </div>
        )}
      </div>

      {/* Renew Contract Modal */}
      {showRenewContract && renewModalOpen && (
        <div className="agov-pip-renew-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={closeRenewModal} aria-hidden="true" />
          <div className="agov-pip-renew-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-renew-title">
            <div className="agov-pip-renew-head">
              <h2 id="agov-pip-renew-title" className="agov-pip-renew-title">Renew Contract</h2>
              <AppButton type="button" className="agov-pip-renew-close" onClick={closeRenewModal} aria-label="Close">×</AppButton>
            </div>
            <div className="agov-pip-renew-body">
              <div className="agov-pip-renew-field">
                <span className="agov-pip-renew-label" id="agov-pip-renew-duration-label">Contract Duration</span>
                <AppDropdown className="agov-pip-renew-dropdown" value={contractDuration} onChange={setContractDuration} placeholder="Select" options={CONTRACT_DURATION_OPTIONS} ariaLabel="Contract duration" />
              </div>
              <div className="agov-pip-renew-field">
                <span className="agov-pip-renew-label" id="agov-pip-renew-start-label">Start Date</span>
                <div className="agov-pip-renew-date-wrap">
                  <DatePicker
                    id="agov-pip-renew-start"
                    selected={startDate}
                    onChange={d => { setStartDate(d); setStartDatePickerOpen(false) }}
                    open={startDatePickerOpen}
                    onInputClick={() => setStartDatePickerOpen(true)}
                    onClickOutside={() => setStartDatePickerOpen(false)}
                    shouldCloseOnSelect
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    className="agov-pip-renew-date-input"
                    popperClassName="agov-pip-renew-dp-popper"
                    popperPlacement="bottom-start"
                    ariaLabelledBy="agov-pip-renew-start-label"
                    autoComplete="off"
                  />
                  <AppButton type="button" className="agov-pip-renew-date-icon-btn" onClick={() => setStartDatePickerOpen(o => !o)} tabIndex={-1} aria-label="Open calendar">
                    <svg className="agov-pip-renew-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </AppButton>
                </div>
              </div>
            </div>
            <div className="agov-pip-renew-footer">
              <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--cancel" onClick={closeRenewModal}>Cancel</AppButton>
              <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--primary" onClick={handleSubmitRenewContract} disabled={processing}>Renew Contract</AppButton>
            </div>
          </div>
        </div>
      )}

      {/* PIP Modal */}
      {showInitiatePip && pipModalOpen && (
        <div className="agov-pip-pip-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={closePipModal} aria-hidden="true" />
          <div className="agov-pip-pip-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-pip-form-title">
            <div className="agov-pip-pip-head">
              <h2 id="agov-pip-pip-form-title" className="agov-pip-pip-title">Performance Improvement Plan</h2>
              <AppButton type="button" className="agov-pip-pip-close" onClick={closePipModal} aria-label="Close">×</AppButton>
            </div>
            <div className="agov-pip-pip-body">
              <div className="agov-pip-pip-row-dates">
                <div className="agov-pip-pip-field">
                  <span className="agov-pip-pip-label" id="agov-pip-start-label">Start Date</span>
                  <div className="agov-pip-renew-date-wrap">
                    <DatePicker
                      id="agov-pip-form-start"
                      selected={pipStartDate}
                      onChange={d => { setPipStartDate(d); setPipStartDateOpen(false) }}
                      open={pipStartDateOpen}
                      onInputClick={() => { setPipStartDateOpen(true); setPipEndDateOpen(false) }}
                      onClickOutside={() => setPipStartDateOpen(false)}
                      shouldCloseOnSelect
                      dateFormat="MM/dd/yyyy"
                      placeholderText="mm/dd/yyyy"
                      className="agov-pip-renew-date-input"
                      popperClassName="agov-pip-pip-dp-popper"
                      popperPlacement="bottom-start"
                      ariaLabelledBy="agov-pip-start-label"
                      autoComplete="off"
                    />
                    <AppButton type="button" className="agov-pip-renew-date-icon-btn" onClick={() => { setPipEndDateOpen(false); setPipStartDateOpen(o => !o) }} tabIndex={-1} aria-label="Open calendar">
                      <svg className="agov-pip-renew-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </AppButton>
                  </div>
                </div>
                <div className="agov-pip-pip-field">
                  <span className="agov-pip-pip-label" id="agov-pip-end-label">End Date</span>
                  <div className="agov-pip-renew-date-wrap">
                    <DatePicker
                      id="agov-pip-form-end"
                      selected={pipEndDate}
                      onChange={d => { setPipEndDate(d); setPipEndDateOpen(false) }}
                      open={pipEndDateOpen}
                      onInputClick={() => { setPipEndDateOpen(true); setPipStartDateOpen(false) }}
                      onClickOutside={() => setPipEndDateOpen(false)}
                      shouldCloseOnSelect
                      dateFormat="MM/dd/yyyy"
                      placeholderText="mm/dd/yyyy"
                      className="agov-pip-renew-date-input"
                      popperClassName="agov-pip-pip-dp-popper"
                      popperPlacement="bottom-start"
                      ariaLabelledBy="agov-pip-end-label"
                      autoComplete="off"
                    />
                    <AppButton type="button" className="agov-pip-renew-date-icon-btn" onClick={() => { setPipStartDateOpen(false); setPipEndDateOpen(o => !o) }} tabIndex={-1} aria-label="Open calendar for end date">
                      <svg className="agov-pip-renew-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </AppButton>
                  </div>
                </div>
              </div>
              <div className="agov-pip-pip-field agov-pip-pip-field--objective">
                <label className="agov-pip-pip-label" htmlFor="agov-pip-objective">Objective</label>
                <input id="agov-pip-objective" type="text" className="agov-pip-pip-input" value={pipObjective} onChange={e => setPipObjective(e.target.value)} placeholder="Describe the objective..." autoComplete="off" />
              </div>
              <div className="agov-pip-pip-field agov-pip-pip-field--action">
                <span className="agov-pip-pip-label" id="agov-pip-action-label">Action Plan</span>
                <div className="agov-pip-pip-quill-wrap">
                  <ReactQuill theme="snow" value={pipActionPlan} onChange={setPipActionPlan} className="agov-pip-pip-quill" placeholder="Describe action plan..." modules={PIP_QUILL_MODULES} formats={PIP_QUILL_FORMATS} />
                </div>
              </div>
            </div>
            <div className="agov-pip-pip-footer">
              <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--cancel" onClick={closePipModal}>Cancel</AppButton>
              <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--primary" onClick={handleSubmitPip} disabled={processing}>Start PIP</AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Generate Contract Letter Modal */}
      {showGenerateContractLetter && contractLetterModalOpen && (
        <div className="agov-pip-gcl-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={closeContractLetterModal} aria-hidden="true" />
          <div className="agov-pip-gcl-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-gcl-title">
            <div className="agov-pip-gcl-head">
              <h2 id="agov-pip-gcl-title" className="agov-pip-gcl-title">Generate Contract Letter</h2>
              <AppButton type="button" className="agov-pip-gcl-close" onClick={closeContractLetterModal} aria-label="Close">×</AppButton>
            </div>
            <div className="agov-pip-gcl-body">
              <div className="agov-pip-gcl-field">
                <span className="agov-pip-gcl-label">Project</span>
                <AppDropdown className="agov-pip-gcl-dropdown" value={contractLetterProject} onChange={setContractLetterProject} placeholder="Select project" options={CONTRACT_LETTER_PROJECT_OPTIONS} ariaLabel="Project" />
              </div>
              <div className="agov-pip-gcl-field">
                <span className="agov-pip-gcl-label">Job Role</span>
                <AppDropdown className="agov-pip-gcl-dropdown" value={contractLetterJobRole} onChange={setContractLetterJobRole} placeholder="Select job role" options={CONTRACT_LETTER_JOB_ROLE_OPTIONS} ariaLabel="Job Role" />
              </div>
              <div className="agov-pip-gcl-field">
                <span className="agov-pip-gcl-label" id="agov-pip-gcl-start-label">Start Date</span>
                <div className="agov-pip-renew-date-wrap">
                  <DatePicker
                    id="agov-pip-gcl-start"
                    selected={contractLetterStartDate}
                    onChange={d => { setContractLetterStartDate(d); setContractLetterStartDateOpen(false) }}
                    open={contractLetterStartDateOpen}
                    onInputClick={() => { setContractLetterStartDateOpen(true); setContractLetterEndDateOpen(false); setContractLetterDateOpen(false) }}
                    onClickOutside={() => setContractLetterStartDateOpen(false)}
                    shouldCloseOnSelect
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    className="agov-pip-renew-date-input"
                    popperClassName="agov-pip-gcl-dp-popper"
                    popperPlacement="bottom-start"
                    ariaLabelledBy="agov-pip-gcl-start-label"
                    autoComplete="off"
                  />
                  <AppButton type="button" className="agov-pip-renew-date-icon-btn" onClick={() => { setContractLetterEndDateOpen(false); setContractLetterDateOpen(false); setContractLetterStartDateOpen(o => !o) }} tabIndex={-1} aria-label="Open calendar">
                    <svg className="agov-pip-renew-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </AppButton>
                </div>
              </div>
              <div className="agov-pip-gcl-field">
                <span className="agov-pip-gcl-label" id="agov-pip-gcl-end-label">End Date</span>
                <div className="agov-pip-renew-date-wrap">
                  <DatePicker
                    id="agov-pip-gcl-end"
                    selected={contractLetterEndDate}
                    onChange={d => { setContractLetterEndDate(d); setContractLetterEndDateOpen(false) }}
                    open={contractLetterEndDateOpen}
                    onInputClick={() => { setContractLetterEndDateOpen(true); setContractLetterStartDateOpen(false); setContractLetterDateOpen(false) }}
                    onClickOutside={() => setContractLetterEndDateOpen(false)}
                    shouldCloseOnSelect
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    className="agov-pip-renew-date-input"
                    popperClassName="agov-pip-gcl-dp-popper"
                    popperPlacement="bottom-start"
                    ariaLabelledBy="agov-pip-gcl-end-label"
                    autoComplete="off"
                  />
                  <AppButton type="button" className="agov-pip-renew-date-icon-btn" onClick={() => { setContractLetterStartDateOpen(false); setContractLetterDateOpen(false); setContractLetterEndDateOpen(o => !o) }} tabIndex={-1} aria-label="Open calendar">
                    <svg className="agov-pip-renew-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </AppButton>
                </div>
              </div>
              <div className="agov-pip-gcl-field">
                <label className="agov-pip-gcl-label" htmlFor="agov-pip-gcl-location">Location</label>
                <input id="agov-pip-gcl-location" type="text" className="agov-pip-gcl-input" value={contractLetterLocation} onChange={e => setContractLetterLocation(e.target.value)} placeholder="Enter location" autoComplete="off" />
              </div>
              <div className="agov-pip-gcl-field">
                <label className="agov-pip-gcl-label" htmlFor="agov-pip-gcl-reporting-line">Reporting Line</label>
                <input id="agov-pip-gcl-reporting-line" type="text" className="agov-pip-gcl-input" value={contractLetterReportingLine} onChange={e => setContractLetterReportingLine(e.target.value)} placeholder="Describe reporting line" autoComplete="off" />
              </div>
              <div className="agov-pip-gcl-field">
                <label className="agov-pip-gcl-label" htmlFor="agov-pip-gcl-salary">Salary amount</label>
                <input id="agov-pip-gcl-salary" type="text" className="agov-pip-gcl-input" value={contractLetterSalary} onChange={e => setContractLetterSalary(e.target.value)} placeholder="Enter salary" autoComplete="off" />
              </div>
              <div className="agov-pip-gcl-field">
                <span className="agov-pip-gcl-label" id="agov-pip-gcl-contract-date-label">Contract Date</span>
                <div className="agov-pip-renew-date-wrap">
                  <DatePicker
                    id="agov-pip-gcl-contract-date"
                    selected={contractLetterDate}
                    onChange={d => { setContractLetterDate(d); setContractLetterDateOpen(false) }}
                    open={contractLetterDateOpen}
                    onInputClick={() => { setContractLetterDateOpen(true); setContractLetterStartDateOpen(false); setContractLetterEndDateOpen(false) }}
                    onClickOutside={() => setContractLetterDateOpen(false)}
                    shouldCloseOnSelect
                    dateFormat="MM/dd/yyyy"
                    placeholderText="mm/dd/yyyy"
                    className="agov-pip-renew-date-input"
                    popperClassName="agov-pip-gcl-dp-popper"
                    popperPlacement="bottom-start"
                    ariaLabelledBy="agov-pip-gcl-contract-date-label"
                    autoComplete="off"
                  />
                  <AppButton type="button" className="agov-pip-renew-date-icon-btn" onClick={() => { setContractLetterStartDateOpen(false); setContractLetterEndDateOpen(false); setContractLetterDateOpen(o => !o) }} tabIndex={-1} aria-label="Open calendar">
                    <svg className="agov-pip-renew-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </AppButton>
                </div>
              </div>
            </div>
            <div className="agov-pip-gcl-footer">
              <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--cancel" onClick={closeContractLetterModal}>Cancel</AppButton>
              <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--primary" onClick={handleGeneratePreview}>Generate Preview</AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Contract Preview Modal – with PDF and email buttons */}
      {showGenerateContractLetter && contractPreviewModalOpen && (
        <div className="agov-pip-gcl-preview-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={closeContractPreviewModal} aria-hidden="true" />
          <div className="agov-pip-gcl-preview-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Contract letter preview">
            <AppButton type="button" className="agov-pip-gcl-preview-close" onClick={closeContractPreviewModal} aria-label="Close">×</AppButton>
            <ContractLetterTemplate
              staffName={staffName}
              jobRoleLabel={contractLetterJobRole ? CONTRACT_LETTER_JOB_ROLE_OPTIONS.find(opt => opt.value === contractLetterJobRole)?.label : ''}
              projectLabel={contractLetterProject ? CONTRACT_LETTER_PROJECT_OPTIONS.find(opt => opt.value === contractLetterProject)?.label : ''}
              startDate={contractLetterStartDate}
              endDate={contractLetterEndDate}
              location={contractLetterLocation}
              reportingLine={contractLetterReportingLine}
              salary={contractLetterSalary}
              contractDate={contractLetterDate}
            />
            <div className="agov-pip-gcl-preview-actions">
              <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--cancel" onClick={closeContractPreviewModal}>Cancel</AppButton>
              <AppButton type="button" className="agov-pip-gcl-preview-download" onClick={handleDownloadPDF} disabled={generatingPDF}>
                {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
              </AppButton>
              <AppButton type="button" className="agov-pip-gcl-preview-forward" onClick={handleForwardToStaff} disabled={processing}>
                  {processing ? 'Saving...' : 'Save Contract Letter'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Forward Success Modal */}
      {showGenerateContractLetter && forwardSuccessOpen && (
          <div className="agov-pip-forward-success-layer" role="presentation">
              <div className="agov-pip-renew-backdrop" onClick={closeForwardSuccessModal} aria-hidden="true" />
              <div className="agov-pip-forward-success-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-forward-success-title">
                  <div className="agov-pip-forward-success-head">
                      <h2 id="agov-pip-forward-success-title" className="agov-pip-forward-success-title">Done!</h2>
                      <AppButton type="button" className="agov-pip-forward-success-close" onClick={closeForwardSuccessModal} aria-label="Close">×</AppButton>
                  </div>
                  <p className="agov-pip-forward-success-text">Contract letter saved successfully. Staff can download it from their profile.</p>
                  <div className="agov-pip-forward-success-footer">
                      <AppButton type="button" className="agov-pip-forward-success-ok" onClick={closeForwardSuccessModal}>Okay</AppButton>
                  </div>
              </div>
          </div>
      )}

      {/* PIP Success Modal */}
      {showInitiatePip && pipSuccessOpen && (
        <div className="agov-pip-success-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={() => setPipSuccessOpen(false)} aria-hidden="true" />
          <div className="agov-pip-success-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-renew-success-title">
            <div className="agov-pip-success-head">
              <h2 id="agov-pip-renew-success-title" className="agov-pip-success-title">Done!</h2>
              <AppButton type="button" className="agov-pip-success-close" onClick={() => setPipSuccessOpen(false)} aria-label="Close">×</AppButton>
            </div>
            <p className="agov-pip-success-text">PIP has been initiated successfully.</p>
            <div className="agov-pip-success-footer">
              <AppButton type="button" className="agov-pip-success-ok" onClick={() => setPipSuccessOpen(false)}>Okay</AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Termination Modal */}
      {termModalOpen && (
        <div className="agov-pip-term-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={closeTermModal} aria-hidden="true" />
          <div className="agov-pip-term-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-term-title">
            <div className="agov-pip-term-head">
              <h2 id="agov-pip-term-title" className="agov-pip-term-title">Staff Termination Process</h2>
              <AppButton type="button" className="agov-pip-term-close" onClick={closeTermModal} aria-label="Close">×</AppButton>
            </div>
            <p className="agov-pip-term-kicker">Step {termStep} of {TERM_STEPS}</p>
            <div className="agov-pip-term-stepper" role="tablist" aria-label="Termination process steps">
              {TERMINATION_STEPS.map((s, i) => {
                const isProgress = i < termStep
                const isActive = i === termStep - 1
                const isFuture = i >= termStep
                return (
                  <div
                    key={s.id}
                    className={`agov-pip-term-step${isProgress ? ' agov-pip-term-step--progress' : ''}${isActive ? ' agov-pip-term-step--active' : ''}${isFuture ? ' agov-pip-term-step--future' : ''}`}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={-1}
                  >
                    <span className="agov-pip-term-step-text">{s.label}</span>
                    <span className="agov-pip-term-step-bar" aria-hidden="true" />
                  </div>
                )
              })}
            </div>
            {termStep === 1 && (
              <>
                <div className="agov-pip-term-warn">
                  <span className="agov-pip-term-warn-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L2.5 20.5h19L12 3z" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M12 9v4.5M12 16.5h.01" stroke="#dc2626" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="agov-pip-term-warn-body">
                    <p className="agov-pip-term-warn-heading">Staff to be Terminated</p>
                    <p className="agov-pip-term-warn-name">{staffName || 'Unknown'}</p>
                    <p className="agov-pip-term-warn-id">Staff ID: {publicId || 'N/A'}</p>
                  </div>
                </div>
                <div className="agov-pip-term-body">
                  {termShowWarning && (!termEffectiveDate || !termReason.trim()) && (
                    <div className="agov-pip-term-warning">Please fill in the <strong>Effective Date</strong> and <strong>Termination Reason</strong> to proceed.</div>
                  )}
                  <div className="agov-pip-term-field">
                    <span className="agov-pip-term-label" id="agov-pip-term-effective-label">Effective Date <span className="agov-pip-term-required">*</span></span>
                    <div className="agov-pip-renew-date-wrap">
                      <DatePicker
                        id="agov-pip-term-effective"
                        selected={termEffectiveDate}
                        onChange={d => { setTermEffectiveDate(d); setTermEffectiveDateOpen(false) }}
                        open={termEffectiveDateOpen}
                        onInputClick={() => setTermEffectiveDateOpen(true)}
                        onClickOutside={() => setTermEffectiveDateOpen(false)}
                        shouldCloseOnSelect
                        dateFormat="MM/dd/yyyy"
                        placeholderText="mm/dd/yyyy"
                        className="agov-pip-renew-date-input"
                        popperClassName="agov-pip-term-dp-popper"
                        popperPlacement="bottom-start"
                        ariaLabelledBy="agov-pip-term-effective-label"
                        autoComplete="off"
                      />
                      <AppButton type="button" className="agov-pip-renew-date-icon-btn" onClick={() => setTermEffectiveDateOpen(o => !o)} tabIndex={-1} aria-label="Open calendar">
                        <svg className="agov-pip-renew-cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </AppButton>
                    </div>
                  </div>
                  <div className="agov-pip-term-field">
                    <label className="agov-pip-term-label" htmlFor="agov-pip-term-reason">Termination Reason <span className="agov-pip-term-required">*</span></label>
                    <textarea id="agov-pip-term-reason" className="agov-pip-term-textarea" value={termReason} onChange={e => setTermReason(e.target.value)} rows={4} placeholder="Provide detailed reason for termination..." />
                  </div>
                  <div className="agov-pip-term-field">
                    <label className="agov-pip-term-label" htmlFor="agov-pip-term-notes">Additional Notes</label>
                    <textarea id="agov-pip-term-notes" className="agov-pip-term-textarea" value={termNotes} onChange={e => setTermNotes(e.target.value)} rows={4} placeholder="Any additional information..." />
                  </div>
                </div>
              </>
            )}
            {termStep === 2 && (
              <div className="agov-pip-term-exit">
                <div className="agov-pip-term-exit-info">
                  <span className="agov-pip-term-exit-check" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9.5" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
                      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#c2410c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="agov-pip-term-exit-title">Exit Clearance Checklist</p>
                    <p className="agov-pip-term-exit-desc">Please confirm all clearance items before proceeding with termination</p>
                  </div>
                </div>
                <div className="agov-pip-term-na-row">
                  <label className="agov-pip-term-na">
                    <input 
                      type="checkbox" 
                      className="agov-pip-term-na-input" 
                      role="switch" 
                      checked={termChecklistNa} 
                      onChange={e => setTermChecklistNa(e.target.checked)} 
                    />
                    <span className="agov-pip-term-na-switch" aria-hidden="true" />
                    <span className="agov-pip-term-na-label">Checklist does not apply to this staff</span>
                  </label>
                  <AppButton type="button" className="agov-pip-term-hint" title="Information" aria-label="More information">i</AppButton>
                </div>
                {/* Always show checklist but disable when termChecklistNa is true */}
                <ul className="agov-pip-exit-list">
                  {EXIT_CLEARANCE_ITEMS.map(item => (
                    <li key={item.id} className="agov-pip-exit-item">
                      <input 
                        type="checkbox" 
                        id={`agov-exit-${item.id}`} 
                        className="agov-pip-exit-check" 
                        checked={!!termChecklist[item.id]} 
                        onChange={e => setChecklistValue(item.id, e.target.checked)}
                        disabled={termChecklistNa}  // ← Disable when toggle is ON
                      />
                      <label 
                        htmlFor={`agov-exit-${item.id}`} 
                        className={`agov-pip-exit-item-text ${termChecklistNa ? 'agov-pip-exit-item-text--disabled' : ''}`}
                        style={termChecklistNa ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                      >
                        <span className="agov-pip-exit-item-title">{item.title}</span>
                        {item.sub && <span className="agov-pip-exit-item-sub">{item.sub}</span>}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {termStep === 3 && (
              <div className="agov-pip-term-final">
                <div className="agov-pip-term-final-warn">
                  <span className="agov-pip-term-final-warn-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L2.5 20.5h19L12 3z" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M12 9v4.5M12 16.5h.01" stroke="#dc2626" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="agov-pip-term-final-warn-title">Final Confirmation Required</p>
                    <p className="agov-pip-term-final-warn-text">This action is irreversible. Please review all details carefully before proceeding.</p>
                  </div>
                </div>
                <div className="agov-pip-term-panel agov-pip-term-panel--summary">
                  <h3 className="agov-pip-term-panel-title">Termination Summary</h3>
                  <dl className="agov-pip-term-dl">
                    <div className="agov-pip-term-dl-row"><dt>Staff Name</dt><dd>{staffName || 'Unknown'}</dd></div>
                    <div className="agov-pip-term-dl-row"><dt>Staff ID</dt><dd>{publicId || 'N/A'}</dd></div>
                    <div className="agov-pip-term-dl-row"><dt>Effective Date</dt><dd>{termEffectiveDate ? format(termEffectiveDate, 'dd-MM-yyyy') : '—'}</dd></div>
                  </dl>
                </div>
                <div className="agov-pip-term-panel agov-pip-term-panel--clearance">
                  <h3 className="agov-pip-term-panel-title">Clearance Status</h3>
                  <ul className="agov-pip-term-final-clearance">
                    {FINAL_REVIEW_CLEARANCE.map(row => {
                      // Determine status based on checklist NA toggle
                      let status = 'pending'; // pending, cleared, na
                      
                      if (termChecklistNa) {
                        status = 'na'; // Not applicable - show grey dash/circle
                      } else {
                        // Map clearance item to actual checklist value
                        switch(row.id) {
                          case 'equipment':
                            status = termChecklist.equipment ? 'cleared' : 'pending';
                            break;
                          case 'handover':
                            status = termChecklist.handover ? 'cleared' : 'pending';
                            break;
                          case 'interview':
                            status = termChecklist.interview ? 'cleared' : 'pending';
                            break;
                          case 'access':
                            status = termChecklist.access ? 'cleared' : 'pending';
                            break;
                          case 'severance':
                            status = termChecklist.severance ? 'cleared' : 'pending';
                            break;
                          default:
                            status = 'pending';
                        }
                      }
                      
                      return (
                        <li key={row.id} className="agov-pip-term-final-clearance-row">
                          <span className="agov-pip-term-final-clearance-label">{row.label}</span>
                          <span className="agov-pip-term-final-check" aria-label={status === 'cleared' ? "Cleared" : (status === 'na' ? "Not applicable" : "Not cleared")} title={status === 'cleared' ? "Cleared" : (status === 'na' ? "Not applicable" : "Not cleared")}>
                            {status === 'cleared' ? (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" fill="#ecfdf5" stroke="#096D49" strokeWidth="1.5" />
                                <path d="M8 12.5l2.3 2.2L16 9.5" stroke="#096D49" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : status === 'na' ? (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.5" />
                                <line x1="8" y1="12" x2="16" y2="12" stroke="#9ca3af" strokeWidth="1.75" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
                                <path d="M9 9L15 15M15 9L9 15" stroke="#dc2626" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="agov-pip-term-attest">
                  {termShowWarning && !termFinalReviewConfirm && (
                    <div className="agov-pip-term-warning">Please tick the confirmation checkbox above to proceed.</div>
                  )}
                  <label className="agov-pip-term-attest-label">
                    <input type="checkbox" className="agov-pip-term-attest-check" checked={termFinalReviewConfirm} onChange={e => setTermFinalReviewConfirm(e.target.checked)} />
                    <span className="agov-pip-term-attest-text">{FINAL_REVIEW_ATTESTATION}</span>
                  </label>
                </div>
              </div>
            )}
            <div className="agov-pip-term-footer">
              {termStep === 1 && (
                <>
                  <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--cancel" onClick={closeTermModal}>Cancel</AppButton>
                  <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--primary" onClick={() => { if (!termEffectiveDate || !termReason.trim()) { setTermShowWarning(true); return; } setTermShowWarning(false); setTermStep(2); }}>Next</AppButton>
                </>
              )}
              {termStep === 2 && (
                <>
                  <AppButton type="button" className="agov-pip-term-btn-prev" onClick={() => setTermStep(1)}>Previous</AppButton>
                  <AppButton type="button" className="agov-pip-renew-btn agov-pip-renew-btn--primary" onClick={() => setTermStep(3)}>Next</AppButton>
                </>
              )}
              {termStep === 3 && (
                <>
                  <AppButton type="button" className="agov-pip-term-btn-prev" onClick={() => setTermStep(2)}>Previous</AppButton>
                  <AppButton 
                    type="button" 
                    className="agov-pip-term-btn-terminate" 
                    disabled={processing}
                    onClick={() => { if (!termFinalReviewConfirm) { setTermShowWarning(true); return; } setTermShowWarning(false); handleCompleteTermination(); }} 
                  >
                    {processing ? 'Processing...' : 'Complete Termination'}
                  </AppButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Renew Success Modal */}
      {renewSuccessOpen && (
        <div className="agov-pip-success-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={closeRenewSuccessModal} aria-hidden="true" />
          <div className="agov-pip-success-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-renew-success-title">
            <div className="agov-pip-success-head">
              <h2 id="agov-pip-renew-success-title" className="agov-pip-success-title">Done!</h2>
              <AppButton type="button" className="agov-pip-success-close" onClick={closeRenewSuccessModal} aria-label="Close">×</AppButton>
            </div>
            <p className="agov-pip-success-text">Contract renewal has been successful</p>
            <div className="agov-pip-success-footer">
              <AppButton type="button" className="agov-pip-success-ok" onClick={closeRenewSuccessModal}>Okay</AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Termination Success Modal */}
      {termSuccessOpen && (
        <div className="agov-pip-term-success-layer" role="presentation">
          <div className="agov-pip-renew-backdrop" onClick={closeTermSuccessModal} aria-hidden="true" />
          <div className="agov-pip-term-success-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="agov-pip-term-success-title">
            <AppButton type="button" className="agov-pip-term-success-close" onClick={closeTermSuccessModal} aria-label="Close">×</AppButton>
            <div className="agov-pip-term-success-content">
              <div className="agov-pip-term-success-icon-wrap" aria-hidden="true">
                <svg className="agov-pip-term-success-icon" width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
                  <defs>
                    <linearGradient id="agovPipTermSuccessCheckGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#6ee7b7" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                  <circle cx="36" cy="36" r="32" fill="url(#agovPipTermSuccessCheckGrad)" stroke="#ecfdf5" strokeWidth="1.5" />
                  <path d="M22 37l8.5 8.5L50 25" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <h2 id="agov-pip-term-success-title" className="agov-pip-term-success-title">Done!</h2>
              <p className="agov-pip-term-success-text">Termination executed successfully.</p>
              <p className="agov-pip-term-success-text agov-pip-term-success-text--sub">Staff access has been revoked</p>
            </div>
            <div className="agov-pip-term-success-footer">
              <AppButton type="button" className="agov-pip-term-success-done" onClick={closeTermSuccessModal}>Done</AppButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HrisExecuteActionsPanel