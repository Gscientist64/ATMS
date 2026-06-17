// src/HRIS/ETMS_HR/components/AncillaryCreateEmployeeAccount.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from '../../../shared/AppButton'
import AppDropdown from '../../../shared/AppDropdown'
import { createEmployee, getEcewsEmployees } from '../../../services/api'
import './AncillaryCreateEmployeeAccount.css'

const STEPS = [
  { id: 1, label: 'Staff Details' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'Contract' },
  { id: 4, label: 'Bank Details' },
  { id: 5, label: 'NIN & TIN' },
]

const departmentOptions = [
  { value: '', label: 'Select department' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Case Manager' },
  { value: 'me-dec', label: 'M&E DEC' },
  { value: 'lab-dec', label: 'Lab DEC' },
  { value: 'pharmacy-dec', label: 'Pharmacy DEC' },
  { value: 'others', label: 'Others' },
]

const locationOptions = [
  { value: '', label: 'Select location' },
  { value: 'Cross River', label: 'Cross River' },
  { value: 'Osun', label: 'Osun' },
  { value: 'Ekiti', label: 'Ekiti' },
  { value: 'Lagos', label: 'Lagos' },
  { value: 'Delta', label: 'Delta' },
  { value: 'Akwa Ibom', label: 'Akwa Ibom' },
  { value: 'Ebonyi', label: 'Ebonyi' },
]

const projectOptions = [
  { value: '', label: 'Select' },
  { value: 'ACE-5', label: 'ACE-5' },
  { value: 'GC7', label: 'GC7' },
  { value: 'CHIS', label: 'CHIS' },
  { value: 'Speed', label: 'Speed' },
  { value: 'MNEP', label: 'MNEP' },
]

// Function to get LGA options based on selected state
const getLgaOptions = (selectedState) => {
  if (!selectedState) return [{ value: '', label: 'Select LGA' }]
  const lgas = lgaMapping[selectedState]
  if (!lgas || lgas.length === 0) return [{ value: '', label: 'No LGAs available' }]
  return [{ value: '', label: 'Select LGA' }, ...lgas]
}

// LGA mapping for each state
const lgaMapping = {
  'Cross River': [
    { value: 'Abi', label: 'Abi' },
    { value: 'Akamkpa', label: 'Akamkpa' },
    { value: 'Akpabuyo', label: 'Akpabuyo' },
    { value: 'Bakassi', label: 'Bakassi' },
    { value: 'Bekwarra', label: 'Bekwarra' },
    { value: 'Biase', label: 'Biase' },
    { value: 'Boki', label: 'Boki' },
    { value: 'Calabar Municipal', label: 'Calabar Municipal' },
    { value: 'Calabar South', label: 'Calabar South' },
    { value: 'Etung', label: 'Etung' },
    { value: 'Ikom', label: 'Ikom' },
    { value: 'Obanliku', label: 'Obanliku' },
    { value: 'Obubra', label: 'Obubra' },
    { value: 'Obudu', label: 'Obudu' },
    { value: 'Odukpani', label: 'Odukpani' },
    { value: 'Ogoja', label: 'Ogoja' },
    { value: 'Yakuur', label: 'Yakuur' },
    { value: 'Yala', label: 'Yala' },
  ],
  'Osun': [
    { value: 'Aiyedaade', label: 'Aiyedaade' },
    { value: 'Aiyedire', label: 'Aiyedire' },
    { value: 'Atakunmosa East', label: 'Atakunmosa East' },
    { value: 'Atakunmosa West', label: 'Atakunmosa West' },
    { value: 'Boluwaduro', label: 'Boluwaduro' },
    { value: 'Boripe', label: 'Boripe' },
    { value: 'Ede North', label: 'Ede North' },
    { value: 'Ede South', label: 'Ede South' },
    { value: 'Egbedore', label: 'Egbedore' },
    { value: 'Ejigbo', label: 'Ejigbo' },
    { value: 'Ife Central', label: 'Ife Central' },
    { value: 'Ife East', label: 'Ife East' },
    { value: 'Ife North', label: 'Ife North' },
    { value: 'Ife South', label: 'Ife South' },
    { value: 'Ifedayo', label: 'Ifedayo' },
    { value: 'Ifelodun', label: 'Ifelodun' },
    { value: 'Ila', label: 'Ila' },
    { value: 'Ilesa East', label: 'Ilesa East' },
    { value: 'Ilesa West', label: 'Ilesa West' },
    { value: 'Irepodun', label: 'Irepodun' },
    { value: 'Irewole', label: 'Irewole' },
    { value: 'Isokan', label: 'Isokan' },
    { value: 'Iwo', label: 'Iwo' },
    { value: 'Obokun', label: 'Obokun' },
    { value: 'Odo Otin', label: 'Odo Otin' },
    { value: 'Ola Oluwa', label: 'Ola Oluwa' },
    { value: 'Olorunda', label: 'Olorunda' },
    { value: 'Oriade', label: 'Oriade' },
    { value: 'Orolu', label: 'Orolu' },
    { value: 'Osogbo', label: 'Osogbo' },
  ],
  'Ekiti': [
    { value: 'Ado Ekiti', label: 'Ado Ekiti' },
    { value: 'Efon', label: 'Efon' },
    { value: 'Ekiti East', label: 'Ekiti East' },
    { value: 'Ekiti South West', label: 'Ekiti South West' },
    { value: 'Ekiti West', label: 'Ekiti West' },
    { value: 'Emure', label: 'Emure' },
    { value: 'Gbonyin', label: 'Gbonyin' },
    { value: 'Ido Osi', label: 'Ido Osi' },
    { value: 'Ijero', label: 'Ijero' },
    { value: 'Ikere', label: 'Ikere' },
    { value: 'Ikole', label: 'Ikole' },
    { value: 'Ilejemeje', label: 'Ilejemeje' },
    { value: 'Irepodun/Ifelodun', label: 'Irepodun/Ifelodun' },
    { value: 'Ise/Orun', label: 'Ise/Orun' },
    { value: 'Moba', label: 'Moba' },
    { value: 'Oye', label: 'Oye' },
  ],
  'Lagos': [
    { value: 'Agege', label: 'Agege' },
    { value: 'Ajeromi-Ifelodun', label: 'Ajeromi-Ifelodun' },
    { value: 'Alimosho', label: 'Alimosho' },
    { value: 'Amuwo-Odofin', label: 'Amuwo-Odofin' },
    { value: 'Apapa', label: 'Apapa' },
    { value: 'Badagry', label: 'Badagry' },
    { value: 'Epe', label: 'Epe' },
    { value: 'Eti-Osa', label: 'Eti-Osa' },
    { value: 'Ibeju-Lekki', label: 'Ibeju-Lekki' },
    { value: 'Ifako-Ijaiye', label: 'Ifako-Ijaiye' },
    { value: 'Ikeja', label: 'Ikeja' },
    { value: 'Ikorodu', label: 'Ikorodu' },
    { value: 'Kosofe', label: 'Kosofe' },
    { value: 'Lagos Island', label: 'Lagos Island' },
    { value: 'Lagos Mainland', label: 'Lagos Mainland' },
    { value: 'Mushin', label: 'Mushin' },
    { value: 'Ojo', label: 'Ojo' },
    { value: 'Oshodi-Isolo', label: 'Oshodi-Isolo' },
    { value: 'Somolu', label: 'Somolu' },
    { value: 'Surulere', label: 'Surulere' },
  ],
  'Delta': [
    { value: 'Aniocha North', label: 'Aniocha North' },
    { value: 'Aniocha South', label: 'Aniocha South' },
    { value: 'Bomadi', label: 'Bomadi' },
    { value: 'Burutu', label: 'Burutu' },
    { value: 'Ethiope East', label: 'Ethiope East' },
    { value: 'Ethiope West', label: 'Ethiope West' },
    { value: 'Ika North East', label: 'Ika North East' },
    { value: 'Ika South', label: 'Ika South' },
    { value: 'Isoko North', label: 'Isoko North' },
    { value: 'Isoko South', label: 'Isoko South' },
    { value: 'Ndokwa East', label: 'Ndokwa East' },
    { value: 'Ndokwa West', label: 'Ndokwa West' },
    { value: 'Okpe', label: 'Okpe' },
    { value: 'Oshimili North', label: 'Oshimili North' },
    { value: 'Oshimili South', label: 'Oshimili South' },
    { value: 'Patani', label: 'Patani' },
    { value: 'Sapele', label: 'Sapele' },
    { value: 'Udu', label: 'Udu' },
    { value: 'Ughelli North', label: 'Ughelli North' },
    { value: 'Ughelli South', label: 'Ughelli South' },
    { value: 'Ukwuani', label: 'Ukwuani' },
    { value: 'Uvwie', label: 'Uvwie' },
    { value: 'Warri North', label: 'Warri North' },
    { value: 'Warri South', label: 'Warri South' },
    { value: 'Warri South West', label: 'Warri South West' },
  ],
  'Akwa Ibom': [
    { value: 'Abak', label: 'Abak' },
    { value: 'Eastern Obolo', label: 'Eastern Obolo' },
    { value: 'Eket', label: 'Eket' },
    { value: 'Esit Eket', label: 'Esit Eket' },
    { value: 'Essien Udim', label: 'Essien Udim' },
    { value: 'Etim Ekpo', label: 'Etim Ekpo' },
    { value: 'Etinan', label: 'Etinan' },
    { value: 'Ibeno', label: 'Ibeno' },
    { value: 'Ibesikpo Asutan', label: 'Ibesikpo Asutan' },
    { value: 'Ibiono Ibom', label: 'Ibiono Ibom' },
    { value: 'Ika', label: 'Ika' },
    { value: 'Ikono', label: 'Ikono' },
    { value: 'Ikot Abasi', label: 'Ikot Abasi' },
    { value: 'Ikot Ekpene', label: 'Ikot Ekpene' },
    { value: 'Ini', label: 'Ini' },
    { value: 'Itu', label: 'Itu' },
    { value: 'Mbo', label: 'Mbo' },
    { value: 'Mkpat Enin', label: 'Mkpat Enin' },
    { value: 'Nsit Atai', label: 'Nsit Atai' },
    { value: 'Nsit Ibom', label: 'Nsit Ibom' },
    { value: 'Nsit Ubium', label: 'Nsit Ubium' },
    { value: 'Obot Akara', label: 'Obot Akara' },
    { value: 'Okobo', label: 'Okobo' },
    { value: 'Onna', label: 'Onna' },
    { value: 'Oron', label: 'Oron' },
    { value: 'Oruk Anam', label: 'Oruk Anam' },
    { value: 'Udung Uko', label: 'Udung Uko' },
    { value: 'Ukanafun', label: 'Ukanafun' },
    { value: 'Uruan', label: 'Uruan' },
    { value: 'Urue-Offong/Oruko', label: 'Urue-Offong/Oruko' },
    { value: 'Uyo', label: 'Uyo' },
  ],
  'Ebonyi': [
    { value: 'Abakaliki', label: 'Abakaliki' },
    { value: 'Afikpo North', label: 'Afikpo North' },
    { value: 'Afikpo South', label: 'Afikpo South' },
    { value: 'Ebonyi', label: 'Ebonyi' },
    { value: 'Ezza North', label: 'Ezza North' },
    { value: 'Ezza South', label: 'Ezza South' },
    { value: 'Ikwo', label: 'Ikwo' },
    { value: 'Ishielu', label: 'Ishielu' },
    { value: 'Ivo', label: 'Ivo' },
    { value: 'Izzi', label: 'Izzi' },
    { value: 'Ohaozara', label: 'Ohaozara' },
    { value: 'Ohaukwu', label: 'Ohaukwu' },
    { value: 'Onicha', label: 'Onicha' },
  ]
}

function StepCheckIcon() {
  return (
    <svg className="acea-step-check-icon" width="14" height="11" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path d="M1 5.5L5.5 10L15 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const AncillaryCreateEmployeeAccount = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [ecewsSupervisors, setEcewsSupervisors] = useState([])
  const [ecewsSupervisorsLoading, setEcewsSupervisorsLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    gender: '',
    department: '',
    primaryLocation: '',
    gonSupervisor: '',
    ecewsSupervisor: '',
    ecewsSupervisorId: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    contractProject: '',
    contractLga: '',
    facilityName: '',
    employeeCode: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    ninName: '',
    ninNumber: '',
    tinName: '',
    tinNumber: ''
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Fetch ECEWS supervisors on mount
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await getEcewsEmployees()
        setEcewsSupervisors(res.data || res || [])
      } catch (err) {
        console.error('Error fetching ECEWS supervisors:', err)
      } finally {
        setEcewsSupervisorsLoading(false)
      }
    }
    fetchSupervisors()
  }, [])

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const resetForm = () => {
    setStep(1)
    setFormData({
      fullName: '',
      department: '',
      primaryLocation: '',
      ecewsSupervisorId: '',
      phone: '',
      email: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      contractProject: '',
      contractLga: '',
      facilityName: '',
      employeeCode: '',
      bankName: '',
      bankAccountNumber: '',
      ninName: '',
      ninNumber: '',
      tinName: '',
      tinNumber: '',
    })
    setError('')
  }

  // Validate required fields for current step
  const validateStep = () => {
    const requiredFields = {
      1: ['fullName', 'department', 'primaryLocation', 'ecewsSupervisorId'],
      2: ['phone', 'email'],
      3: ['contractProject', 'employeeCode'],
      4: ['bankName', 'bankAccountNumber'],
      5: []
    }
    
    const fields = requiredFields[step] || []
    for (const field of fields) {
      if (!formData[field] || formData[field].trim() === '') {
        const fieldLabels = {
          fullName: 'Full Name',
          department: 'Department',
          primaryLocation: 'Location',
          ecewsSupervisorId: 'ECEWS Supervisor',
          phone: 'Phone Number',
          email: 'Email Address',
          contractProject: 'Project',
          employeeCode: 'Employee Code/ID',
          bankName: 'Bank Name',
          bankAccountNumber: 'Account Number'
        }
        setError(`${fieldLabels[field] || field} is required`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phone,
        gender: formData.gender,
        employeeCode: formData.employeeCode,
        department: formData.department,
        state: formData.primaryLocation,
        project: formData.contractProject,
        lga: formData.contractLga,
        healthFacility: formData.facilityName,
        bankName: formData.bankName,
        accountNumber: formData.bankAccountNumber,
        accountName: formData.fullName,
        ninName: formData.ninName,
        ninNumber: formData.ninNumber,
        tinName: formData.tinName,
        tinNumber: formData.tinNumber,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        ecewsSupervisorId: formData.ecewsSupervisorId ? parseInt(formData.ecewsSupervisorId) : null,
        gonSupervisorId: null,
        Role: 'AdHoc',
        contractStatus: 'Active',
        password: 'Password123@'
      }
      await createEmployee(payload)
      setShowSuccessModal(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContinue = () => {
    if (!validateStep()) return
    
    if (step < STEPS.length) {
      setStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => setStep(s => Math.max(1, s - 1))
  const handleSuccessDone = () => {
    setShowSuccessModal(false)
    navigate('/hris/ancillary-staff/personnel')
  }
  const handleAddNewStaff = () => {
    setShowSuccessModal(false)
    resetForm()
  }

  useEffect(() => {
    if (showSuccessModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [showSuccessModal])

  // Get ECEWS supervisor display name
  const getSupervisorName = (supervisor) => {
    return supervisor.fullName || supervisor.name || `${supervisor.firstName} ${supervisor.lastName}` || 'Unknown'
  }

  return (
    <>
      <div className="acea-page">
        <div className="acea-header">
          <div className="acea-header-text">
            <h1 className="acea-title">Create employee account</h1>
            <p className="acea-subtitle">Add and welcome new staff to the ATMS</p>
          </div>
          <AppButton to="/hris/ancillary-staff/personnel" className="acea-cancel-btn">
            Cancel
          </AppButton>
        </div>

        <div className="acea-card">
          <div className="acea-stepper" role="list" aria-label="Form progress">
            {STEPS.map((s, index) => (
              <div key={s.id} className="acea-stepper-segment" role="listitem">
                <div className={['acea-step', step === s.id && 'is-active', step > s.id && 'is-complete', step < s.id && 'is-upcoming'].filter(Boolean).join(' ')}>
                  <span className={step > s.id ? 'acea-step-circle acea-step-circle--complete' : 'acea-step-circle'} aria-hidden="true">
                    {step > s.id ? <StepCheckIcon /> : s.id}
                  </span>
                  <span className="acea-step-name">{s.label}</span>
                </div>
                {index < STEPS.length - 1 && <div className={`acea-step-line ${step > s.id ? 'is-complete' : ''}`} aria-hidden="true" />}
              </div>
            ))}
          </div>

          <div className="acea-form-column">
            {step === 1 && (
              <div className="acea-panel">
                <h2 className="acea-section-title">Staff Details</h2>
                
                <label className="acea-field">
                  <span className="acea-label">Full Name <span className="acea-required">*</span></span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.fullName}
                    onChange={e => updateField('fullName', e.target.value)}
                    placeholder="Staff Full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="acea-field">
                    <span className="acea-label">Username <span className="acea-required">*</span></span>
                    <input
                        className="acea-input"
                        type="text"
                        value={formData.username}
                        onChange={e => updateField('username', e.target.value)}
                        placeholder="Unique username for login"
                        autoComplete="off"
                        required
                    />
                </label>

                <label className="acea-field">
                    <span className="acea-label">Gender</span>
                    <AppDropdown
                        className="acea-dropdown"
                        buttonClassName="acea-dropdown-btn"
                        value={formData.gender}
                        onChange={val => updateField('gender', val)}
                        placeholder="Select gender"
                        ariaLabel="Gender"
                        options={[
                            { value: '', label: 'Select gender' },
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' }
                        ]}
                    />
                </label>

                <div className="acea-field">
                  <span className="acea-label">Department <span className="acea-required">*</span></span>
                  <AppDropdown
                    className="acea-dropdown"
                    buttonClassName="acea-dropdown-btn"
                    value={formData.department}
                    onChange={val => updateField('department', val)}
                    placeholder="Select department"
                    ariaLabel="Department"
                    options={departmentOptions}
                  />
                </div>

                <div className="acea-field">
                  <span className="acea-label">Location <span className="acea-required">*</span></span>
                  <AppDropdown
                    className="acea-dropdown"
                    buttonClassName="acea-dropdown-btn"
                    value={formData.primaryLocation}
                    onChange={val => updateField('primaryLocation', val)}
                    placeholder="Select location"
                    ariaLabel="Primary location"
                    options={locationOptions}
                  />
                </div>

                <div className="acea-field">
                  <span className="acea-label">ECEWS Supervisor <span className="acea-required">*</span></span>
                  <AppDropdown
                    className="acea-dropdown"
                    buttonClassName="acea-dropdown-btn"
                    value={formData.ecewsSupervisorId}
                    onChange={val => updateField('ecewsSupervisorId', val)}
                    placeholder={ecewsSupervisorsLoading ? "Loading supervisors..." : "Select ECEWS Supervisor"}
                    ariaLabel="ECEWS Supervisor"
                    options={[
                      { value: '', label: 'Select ECEWS Supervisor' },
                      ...ecewsSupervisors.map(s => ({ value: String(s.id), label: getSupervisorName(s) }))
                    ]}
                    disabled={ecewsSupervisorsLoading}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="acea-panel">
                <h2 className="acea-section-title">Contact Details</h2>

                <label className="acea-field">
                  <span className="acea-label">Phone Number <span className="acea-required">*</span></span>
                  <input
                    className="acea-input"
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder="Phone number"
                    autoComplete="tel"
                    required
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label">Email Address <span className="acea-required">*</span></span>
                  <input
                    className="acea-input"
                    type="email"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    placeholder="Staff email"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label">Emergency Contact Name</span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={e => updateField('emergencyContactName', e.target.value)}
                    placeholder="Contact name"
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label">Emergency Contact Phone</span>
                  <input
                    className="acea-input"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={e => updateField('emergencyContactPhone', e.target.value)}
                    placeholder="Phone no."
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="acea-panel">
                <h2 className="acea-section-title">Contract Details</h2>

                <div className="acea-field">
                  <span className="acea-label acea-label--muted">Project <span className="acea-required">*</span></span>
                  <AppDropdown
                    className="acea-dropdown"
                    buttonClassName="acea-dropdown-btn"
                    value={formData.contractProject}
                    onChange={val => updateField('contractProject', val)}
                    placeholder="Select project"
                    ariaLabel="Project"
                    options={projectOptions}
                  />
                </div>

                <div className="acea-field">
                  <span className="acea-label acea-label--muted">State</span>
                  <AppDropdown
                    className="acea-dropdown"
                    buttonClassName="acea-dropdown-btn"
                    value={formData.primaryLocation}
                    onChange={val => updateField('primaryLocation', val)}
                    placeholder="Select state"
                    ariaLabel="State"
                    options={locationOptions}
                  />
                </div>

                <div className="acea-field">
                  <span className="acea-label acea-label--muted">LGA</span>
                  <AppDropdown
                    className="acea-dropdown"
                    buttonClassName="acea-dropdown-btn"
                    value={formData.contractLga}
                    onChange={val => updateField('contractLga', val)}
                    placeholder="Select LGA"
                    ariaLabel="LGA"
                    options={getLgaOptions(formData.primaryLocation)}
                    disabled={!formData.primaryLocation}
                  />
                </div>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">Facility Name</span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.facilityName}
                    onChange={e => updateField('facilityName', e.target.value)}
                    placeholder="Facility name"
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">Employee Code/ID <span className="acea-required">*</span></span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.employeeCode}
                    onChange={e => updateField('employeeCode', e.target.value)}
                    placeholder="Enter employee code"
                    required
                  />
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="acea-panel">
                <h2 className="acea-section-title">Bank Details</h2>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">Bank Name <span className="acea-required">*</span></span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.bankName}
                    onChange={e => updateField('bankName', e.target.value)}
                    placeholder="Bank name"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">Account Number <span className="acea-required">*</span></span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={e => updateField('bankAccountNumber', e.target.value)}
                    placeholder="Enter account number"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">Account Name</span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.fullName}
                    disabled
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </label>
              </div>
            )}

            {step === 5 && (
              <div className="acea-panel">
                <h2 className="acea-section-title">NIN and TIN Details</h2>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">NIN Name</span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.ninName}
                    onChange={e => updateField('ninName', e.target.value)}
                    placeholder="Name as on NIN"
                    autoComplete="off"
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">NIN Number</span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.ninNumber}
                    onChange={e => updateField('ninNumber', e.target.value)}
                    placeholder="NIN number"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">TIN Name</span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.tinName}
                    onChange={e => updateField('tinName', e.target.value)}
                    placeholder="Name as on TIN"
                    autoComplete="off"
                  />
                </label>

                <label className="acea-field">
                  <span className="acea-label acea-label--muted">TIN Number</span>
                  <input
                    className="acea-input"
                    type="text"
                    value={formData.tinNumber}
                    onChange={e => updateField('tinNumber', e.target.value)}
                    placeholder="TIN number"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </label>
              </div>
            )}

            {error && <div className="acea-error">{error}</div>}

            <div className={step > 1 ? 'acea-actions acea-actions--split' : 'acea-actions acea-actions--end'}>
              {step > 1 && <AppButton type="button" className="acea-back-btn" onClick={handleBack}>Back</AppButton>}
              <AppButton type="button" className="acea-primary-btn" onClick={handleSaveContinue} disabled={loading}>
                {loading ? 'Creating...' : (step === 5 ? 'Create Account' : 'Save & Continue')}
              </AppButton>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="acea-success-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="acea-success-title">
          <div className="acea-success-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="acea-success-modal-close" onClick={handleSuccessDone} aria-label="Close">×</button>
            <div className="acea-success-icon-wrap" aria-hidden="true">
              <svg className="acea-success-icon-check" width="36" height="28" viewBox="0 0 40 32" fill="none">
                <path d="M2 16L14 28L38 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="acea-success-title" className="acea-success-title">Employee account created</h2>
            <p id="acea-success-desc" className="acea-success-sub">An email has been sent to the user with default login credentials</p>
            <div className="acea-success-actions">
              <AppButton type="button" className="acea-success-btn-primary" onClick={handleAddNewStaff}>Add a new staff</AppButton>
              <AppButton type="button" className="acea-success-btn-secondary" onClick={handleSuccessDone}>I am done for now</AppButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AncillaryCreateEmployeeAccount