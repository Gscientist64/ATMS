import { useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import { staffService } from '../../services/api'
import './StaffOnboardingWizard.css'

const ONBOARDING_STEPS = [
  { id: 1, label: 'Biodata' },
  { id: 2, label: 'Education Qualification' },
  { id: 3, label: 'Work Experience' },
  { id: 4, label: 'Next of Kin and Emergency Contacts' },
  { id: 5, label: 'Bank and Pension Details' },
  { id: 6, label: 'NIN and TIN Details' },
  { id: 7, label: 'Dependents Details' },
  { id: 8, label: 'Document Upload' },
]

const stateOptions = [
  { value: '', label: 'Your state of origin' },
  { value: 'akwa-ibom', label: 'Akwa Ibom' },
  { value: 'lagos', label: 'Lagos' },
  { value: 'abuja', label: 'FCT Abuja' },
  { value: 'rivers', label: 'Rivers' },
  { value: 'enugu', label: 'Enugu' },
]

const lgaOptions = [
  { value: '', label: 'Your LGA' },
  { value: 'uyo', label: 'Uyo' },
  { value: 'eket', label: 'Eket' },
  { value: 'ikot-ekpene', label: 'Ikot Ekpene' },
  { value: 'oron', label: 'Oron' },
]

const religionOptions = [
  { value: '', label: 'Your religion' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'islam', label: 'Islam' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]

const maritalStatusOptions = [
  { value: '', label: 'Your marital status' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
]

function IconUpload() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 10V3M5.5 5.5L8 3l2.5 2.5M3 12h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="4" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 7h13" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 2.5v3M12 2.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function StepCheckIcon() {
  return (
    <svg
      className="staff-onb-step-check-icon"
      width="14"
      height="11"
      viewBox="0 0 16 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 5.5L5.5 10L15 1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const highestQualificationOptions = [
  { value: '', label: 'Highest Qualification' },
  { value: 'phd', label: 'PhD' },
  { value: 'masters', label: "Master's Degree" },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'hnd', label: 'Higher National Diploma (HND)' },
  { value: 'ond', label: 'Ordinary National Diploma (OND)' },
  { value: 'nce', label: 'NCE' },
  { value: 'ssce', label: 'SSCE / WAEC / NECO' },
  { value: 'other', label: 'Other' },
]

const OTHER_QUAL_PLACEHOLDERS = [
  'MSc Economics, 2010',
  'PGD Economics, 2010',
  'BSc Economics, 2010',
]

const OTHER_QUAL_EXAMPLES = [
  'MSc Economics, 2010',
  'PGD Economics, 2010',
  'BSc Economics, 2010',
]

const StaffOnboardingEducation = ({
  highestQualification,
  setHighestQualification,
  highestDegreeCourse,
  setHighestDegreeCourse,
  otherQualifications,
  setOtherQualifications,
  certifications,
  setCertifications,
  onSaveContinue,
}) => (
  <div className="staff-onb-wizard-panel">
    <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">Education Qualification</h2>

    <div className="staff-onb-field">
      <span className="staff-onb-label">What is your Highest Qualification</span>
      <AppDropdown
        value={highestQualification}
        onChange={setHighestQualification}
        options={highestQualificationOptions}
        placeholder="Highest Qualification"
        className="staff-onb-dropdown"
        buttonClassName="staff-onb-dropdown-btn"
      />
    </div>

    <label className="staff-onb-field">
      <span className="staff-onb-label">
        Specify the Highest Degree and Course of Study? (e.g., PhD. Business Management)
      </span>
      <input
        className="staff-onb-input"
        type="text"
        value={highestDegreeCourse}
        onChange={(e) => setHighestDegreeCourse(e.target.value)}
        placeholder="PhD. Business Management"
      />
    </label>

    <h3 className="staff-onb-section-title">
      Other Educational Qualification (Ranking from Highest to Lowest)
    </h3>

    {otherQualifications.map((value, index) => (
      <label key={`other-qual-${index}`} className="staff-onb-field">
        <span className="staff-onb-label">
          Degree, Field of Study, and Year of Graduation (e.g. {OTHER_QUAL_EXAMPLES[index]})
        </span>
        <input
          className="staff-onb-input"
          type="text"
          value={value}
          onChange={(e) => {
            const next = [...otherQualifications]
            next[index] = e.target.value
            setOtherQualifications(next)
          }}
          placeholder={OTHER_QUAL_PLACEHOLDERS[index]}
        />
      </label>
    ))}

    <h3 className="staff-onb-section-title staff-onb-section-title--certs">
      OTHER RELEVANT CERTIFICATIONS/QUALIFICATIONS - Maximum 5 Certification (You are expected to
      provide details of whatever certifications you have had in any field relevant to ECEWS)
    </h3>

    {certifications.map((value, index) => (
      <label key={`cert-${index}`} className="staff-onb-field">
        <span className="staff-onb-label">
          Course of Study/Certification and Year Certified_{index + 1}
        </span>
        <input
          className="staff-onb-input"
          type="text"
          value={value}
          onChange={(e) => {
            const next = [...certifications]
            next[index] = e.target.value
            setCertifications(next)
          }}
          placeholder="Course"
        />
      </label>
    ))}

    <AppButton type="button" className="staff-onb-save-btn" onClick={onSaveContinue}>
      Save and Continue
    </AppButton>
  </div>
)

const WORK_EXPERIENCE_FIELDS = [
  {
    label:
      "Work Experience 1 (Area of Specialization & Years of Experience), (e.g. Medical Preventive HIV Care - 5 years' Experience):",
    placeholder: "e.g. Medical Preventive HIV Care - 5 years' Experience",
  },
  {
    label:
      "Work Experience 2 (Area of Specialization & Years of Experience), (e.g. Supply Chain - 3 Years' Experience):",
    placeholder: "e.g. Supply Chain - 3 Years' Experience",
  },
  {
    label:
      "Work Experience 3 (Area of Specialization & Years of Experience), (e.g. General Administration - 2 Years' Experience):",
    placeholder: "e.g. General Administration - 2 Years' Experience",
  },
  {
    label:
      "Work Experience 4 (Area of Specialization & Years of Experience),(e.g. Pharmacist - 8 Years' Experience):",
    placeholder: "e.g. Pharmacist - 8 Years' Experience",
  },
  {
    label:
      "Work Experience 5 (Area of Specialization & Years of Experience), (e.g. Communications - 3 Years' Experience):",
    placeholder: "e.g. Communications - 3 Years' Experience",
  },
]

const StaffOnboardingWorkExperience = ({ workExperiences, setWorkExperiences, onSaveContinue }) => (
  <div className="staff-onb-wizard-panel">
    <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">Work Experience</h2>

    <p className="staff-onb-instruction">
      Maximum 5 relevant work experience (You are expected to provide details of whatever work
      experience you have had in the past, in any field relevant to ECEWS)
    </p>

    {WORK_EXPERIENCE_FIELDS.map((field, index) => (
      <label key={`work-exp-${index}`} className="staff-onb-field">
        <span className="staff-onb-label">{field.label}</span>
        <input
          className="staff-onb-input"
          type="text"
          value={workExperiences[index]}
          onChange={(e) => {
            const next = [...workExperiences]
            next[index] = e.target.value
            setWorkExperiences(next)
          }}
          placeholder={field.placeholder}
        />
      </label>
    ))}

    <AppButton type="button" className="staff-onb-save-btn" onClick={onSaveContinue}>
      Save and Continue
    </AppButton>
  </div>
)

const StaffOnboardingNextOfKin = ({
  nextOfKinName,
  setNextOfKinName,
  nextOfKinEmail,
  setNextOfKinEmail,
  nextOfKinPhone,
  setNextOfKinPhone,
  emergencyName,
  setEmergencyName,
  emergencyEmail,
  setEmergencyEmail,
  emergencyPhone,
  setEmergencyPhone,
  onSaveContinue,
}) => (
  <div className="staff-onb-wizard-panel">
    <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">
      Next of Kin and Emergency Contact
    </h2>

    <div className="staff-onb-subsection">
      <h3 className="staff-onb-subsection-title">Next of Kin</h3>
      <div className="staff-onb-wizard-row staff-onb-wizard-row--3">
        <label className="staff-onb-field">
          <span className="staff-onb-label">Full Name</span>
          <input
            className="staff-onb-input"
            type="text"
            value={nextOfKinName}
            onChange={(e) => setNextOfKinName(e.target.value)}
            placeholder="Next of kin name"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">Email</span>
          <input
            className="staff-onb-input"
            type="email"
            value={nextOfKinEmail}
            onChange={(e) => setNextOfKinEmail(e.target.value)}
            placeholder="Next of kin email"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">Phone Number</span>
          <input
            className="staff-onb-input"
            type="tel"
            value={nextOfKinPhone}
            onChange={(e) => setNextOfKinPhone(e.target.value)}
            placeholder="Next of kin phone number"
          />
        </label>
      </div>
    </div>

    <div className="staff-onb-subsection">
      <h3 className="staff-onb-subsection-title">Person to Contact in case of Emergency</h3>
      <div className="staff-onb-wizard-row staff-onb-wizard-row--3">
        <label className="staff-onb-field">
          <span className="staff-onb-label">Full Name</span>
          <input
            className="staff-onb-input"
            type="text"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
            placeholder="Emergency contact name"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">Email</span>
          <input
            className="staff-onb-input"
            type="email"
            value={emergencyEmail}
            onChange={(e) => setEmergencyEmail(e.target.value)}
            placeholder="Emergency contact email"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">Phone Number</span>
          <input
            className="staff-onb-input"
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="Emergency contact phone number"
          />
        </label>
      </div>
    </div>

    <AppButton type="button" className="staff-onb-save-btn" onClick={onSaveContinue}>
      Save and Continue
    </AppButton>
  </div>
)

const StaffOnboardingBankPension = ({
  bankName,
  setBankName,
  accountName,
  setAccountName,
  accountNumber,
  setAccountNumber,
  pfaName,
  setPfaName,
  rsaPin,
  setRsaPin,
  onSaveContinue,
}) => (
  <div className="staff-onb-wizard-panel">
    <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">
      Bank and Pension Details
    </h2>

    <div className="staff-onb-subsection">
      <h3 className="staff-onb-subsection-title">Bank Account Details</h3>
      <div className="staff-onb-wizard-row staff-onb-wizard-row--3">
        <label className="staff-onb-field">
          <span className="staff-onb-label">Bank Name</span>
          <input
            className="staff-onb-input"
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Bank name"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">Account Name</span>
          <input
            className="staff-onb-input"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account name"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">Account Number</span>
          <input
            className="staff-onb-input"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account number"
          />
        </label>
      </div>
    </div>

    <div className="staff-onb-subsection">
      <h3 className="staff-onb-subsection-title">Pension Fund Details</h3>
      <div className="staff-onb-wizard-row staff-onb-wizard-row--pension">
        <label className="staff-onb-field">
          <span className="staff-onb-label">Pension Fund Administrator (PFA) Name</span>
          <input
            className="staff-onb-input"
            type="text"
            value={pfaName}
            onChange={(e) => setPfaName(e.target.value)}
            placeholder="PFA name"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">Retirement Savings Account (RSA) Pin</span>
          <input
            className="staff-onb-input"
            type="text"
            value={rsaPin}
            onChange={(e) => setRsaPin(e.target.value)}
            placeholder="RSA number"
          />
        </label>
      </div>
    </div>

    <AppButton type="button" className="staff-onb-save-btn" onClick={onSaveContinue}>
      Save and Continue
    </AppButton>
  </div>
)

const StaffOnboardingNinTin = ({
  ninFullName,
  setNinFullName,
  ninNumber,
  setNinNumber,
  tinName,
  setTinName,
  tinNumber,
  setTinNumber,
  onSaveContinue,
}) => (
  <div className="staff-onb-wizard-panel">
    <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">NIN and TIN Details</h2>

    <div className="staff-onb-subsection">
      <h3 className="staff-onb-subsection-title">NIN Details</h3>
      <div className="staff-onb-wizard-row staff-onb-wizard-row--2">
        <label className="staff-onb-field">
          <span className="staff-onb-label">Full Name</span>
          <input
            className="staff-onb-input"
            type="text"
            value={ninFullName}
            onChange={(e) => setNinFullName(e.target.value)}
            placeholder="Full name"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">NIN Number</span>
          <input
            className="staff-onb-input"
            type="text"
            value={ninNumber}
            onChange={(e) => setNinNumber(e.target.value)}
            placeholder="NIN number"
          />
        </label>
      </div>
    </div>

    <div className="staff-onb-subsection">
      <h3 className="staff-onb-subsection-title">TIN Details</h3>
      <div className="staff-onb-wizard-row staff-onb-wizard-row--2">
        <label className="staff-onb-field">
          <span className="staff-onb-label">TIN Name</span>
          <input
            className="staff-onb-input"
            type="text"
            value={tinName}
            onChange={(e) => setTinName(e.target.value)}
            placeholder="TIN name"
          />
        </label>
        <label className="staff-onb-field">
          <span className="staff-onb-label">TIN Number</span>
          <input
            className="staff-onb-input"
            type="text"
            value={tinNumber}
            onChange={(e) => setTinNumber(e.target.value)}
            placeholder="TIN Number"
          />
        </label>
      </div>
    </div>

    <AppButton type="button" className="staff-onb-save-btn" onClick={onSaveContinue}>
      Save and Continue
    </AppButton>
  </div>
)

function DependentBirthDate({ value, onChange }) {
  const datePickerRef = useRef(null)

  return (
    <label className="staff-onb-field">
      <span className="staff-onb-label">Birth Date</span>
      <div className="staff-onb-date-wrap">
        <DatePicker
          ref={datePickerRef}
          selected={value}
          onChange={onChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="DD/MM/YYYY"
          className="staff-onb-input staff-onb-input--date"
          popperPlacement="bottom-start"
          showPopperArrow={false}
          maxDate={new Date()}
        />
        <AppButton
          type="button"
          className="staff-onb-date-icon-btn"
          onClick={() => datePickerRef.current?.setOpen(true)}
          aria-label="Open birth date calendar"
        >
          <span className="staff-onb-date-icon" aria-hidden="true">
            <IconCalendar />
          </span>
        </AppButton>
      </div>
    </label>
  )
}

const StaffOnboardingDependents = ({
  spouseName,
  setSpouseName,
  spousePhone,
  setSpousePhone,
  spousePassport,
  setSpousePassport,
  dependentNames,
  setDependentNames,
  dependentBirthDates,
  setDependentBirthDates,
  dependentPassports,
  setDependentPassports,
  onSaveContinue,
}) => {
  const fileInputRef = useRef(null)
  const [uploadTarget, setUploadTarget] = useState(null)

  const openUpload = (target) => {
    setUploadTarget(target)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || uploadTarget == null) return
    const url = URL.createObjectURL(file)
    if (uploadTarget === 'spouse') {
      setSpousePassport((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    } else {
      const index = Number(uploadTarget)
      setDependentPassports((prev) => {
        const next = [...prev]
        if (next[index]) URL.revokeObjectURL(next[index])
        next[index] = url
        return next
      })
    }
    e.target.value = ''
    setUploadTarget(null)
  }

  const renderPassport = (preview, onSelect, label, variant = 'outline') => (
    <div className="staff-onb-field">
      <span className="staff-onb-label">Recent Passport</span>
      <div className="staff-onb-passport-row">
        <div className="staff-onb-passport-avatar" aria-hidden="true">
          {preview ? (
            <img src={preview} alt="" className="staff-onb-passport-preview" />
          ) : (
            <span>M</span>
          )}
        </div>
        <AppButton
          type="button"
          className={
            variant === 'light'
              ? 'staff-onb-upload-btn staff-onb-upload-btn--light'
              : 'staff-onb-upload-btn'
          }
          onClick={onSelect}
        >
          <IconUpload />
          {label}
        </AppButton>
      </div>
    </div>
  )

  return (
    <div className="staff-onb-wizard-panel">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="staff-onb-file-input"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">
        Dependents Details
      </h2>

      <div className="staff-onb-subsection">
        <h3 className="staff-onb-subsection-title">Spouse Details</h3>
        <div className="staff-onb-wizard-row staff-onb-wizard-row--2">
          <label className="staff-onb-field">
            <span className="staff-onb-label">Full Name</span>
            <input
              className="staff-onb-input"
              type="text"
              value={spouseName}
              onChange={(e) => setSpouseName(e.target.value)}
              placeholder="Full name"
            />
          </label>
          <label className="staff-onb-field">
            <span className="staff-onb-label">Phone Number</span>
            <input
              className="staff-onb-input"
              type="tel"
              value={spousePhone}
              onChange={(e) => setSpousePhone(e.target.value)}
              placeholder="Phone number"
            />
          </label>
        </div>
        {renderPassport(spousePassport, () => openUpload('spouse'), 'Click here to upload', 'light')}
      </div>

      {[0, 1, 2].map((index) => (
        <div key={`dependent-${index}`} className="staff-onb-subsection">
          <h3 className="staff-onb-subsection-title">Dependent {index + 1}</h3>
          <div className="staff-onb-wizard-row staff-onb-wizard-row--2">
            <label className="staff-onb-field">
              <span className="staff-onb-label">Name</span>
              <input
                className="staff-onb-input"
                type="text"
                value={dependentNames[index]}
                onChange={(e) => {
                  const next = [...dependentNames]
                  next[index] = e.target.value
                  setDependentNames(next)
                }}
                placeholder="Name"
              />
            </label>
            <DependentBirthDate
              value={dependentBirthDates[index]}
              onChange={(date) => {
                const next = [...dependentBirthDates]
                next[index] = date
                setDependentBirthDates(next)
              }}
            />
          </div>
          {renderPassport(
            dependentPassports[index],
            () => openUpload(index),
            'Upload image',
            'outline'
          )}
        </div>
      ))}

      <AppButton type="button" className="staff-onb-save-btn" onClick={onSaveContinue}>
        Save and Continue
      </AppButton>
    </div>
  )
}

const StaffOnboardingDocumentUpload = ({ certificateFiles, setCertificateFiles, onSubmit }) => {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setCertificateFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        name: file.name,
      })),
    ])
    e.target.value = ''
  }

  return (
    <div className="staff-onb-wizard-panel">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        multiple
        className="staff-onb-file-input"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">
        Document Upload (CV, Certificates &amp; NIN Slip)
      </h2>

      <div className="staff-onb-field staff-onb-cert-upload-field">
        <span className="staff-onb-label staff-onb-label--muted">Upload Relevant Certificates</span>
        <AppButton
          type="button"
          className="staff-onb-cert-upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconUpload />
          Click here to upload
        </AppButton>
        {certificateFiles.length > 0 && (
          <ul className="staff-onb-cert-file-list">
            {certificateFiles.map((file) => (
              <li key={file.id}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      <AppButton type="button" className="staff-onb-submit-btn" onClick={onSubmit}>
        Submit
      </AppButton>
    </div>
  )
}

const StaffOnboardingBiodata = ({
  firstName,
  setFirstName,
  middleName,
  setMiddleName,
  lastName,
  setLastName,
  email,
  setEmail,
  address,
  setAddress,
  phone,
  setPhone,
  stateOfOrigin,
  setStateOfOrigin,
  lga,
  setLga,
  religion,
  setReligion,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  maritalStatus,
  setMaritalStatus,
  onSaveContinue,
  passportPreview,
  onPassportSelect,
}) => {
  const datePickerRef = useRef(null)

  return (
  <div className="staff-onb-wizard-panel">
    <h2 className="staff-onb-wizard-form-title staff-onb-wizard-form-title--dark">Biodata</h2>

    <div className="staff-onb-wizard-row staff-onb-wizard-row--3">
      <label className="staff-onb-field">
        <span className="staff-onb-label">First Name</span>
        <input
          className="staff-onb-input"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Your first name"
        />
      </label>
      <label className="staff-onb-field">
        <span className="staff-onb-label">Middle Name</span>
        <input
          className="staff-onb-input"
          type="text"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="Your middle name"
        />
      </label>
      <label className="staff-onb-field">
        <span className="staff-onb-label">Last Name</span>
        <input
          className="staff-onb-input"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Your last name"
        />
      </label>
    </div>

    <label className="staff-onb-field">
      <span className="staff-onb-label">Email</span>
      <input
        className="staff-onb-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
      />
    </label>

    <div className="staff-onb-field">
      <span className="staff-onb-label">Recent Passport</span>
      <div className="staff-onb-passport-row">
        <div className="staff-onb-passport-avatar" aria-hidden="true">
          {passportPreview ? (
            <img src={passportPreview} alt="" className="staff-onb-passport-preview" />
          ) : (
            <span>M</span>
          )}
        </div>
        <AppButton type="button" className="staff-onb-upload-btn" onClick={onPassportSelect}>
          <IconUpload />
          Upload image
        </AppButton>
      </div>
    </div>

    <label className="staff-onb-field">
      <span className="staff-onb-label">Address (Area, Street)</span>
      <input
        className="staff-onb-input"
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Your address"
      />
    </label>

    <label className="staff-onb-field">
      <span className="staff-onb-label">Phone Number</span>
      <input
        className="staff-onb-input"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Your phone number"
      />
    </label>

    <div className="staff-onb-wizard-row staff-onb-wizard-row--2">
      <div className="staff-onb-field">
        <span className="staff-onb-label">State of Origin</span>
        <AppDropdown
          value={stateOfOrigin}
          onChange={setStateOfOrigin}
          options={stateOptions}
          placeholder="Your state of origin"
          className="staff-onb-dropdown"
          buttonClassName="staff-onb-dropdown-btn"
        />
      </div>
      <div className="staff-onb-field">
        <span className="staff-onb-label">LGA (Local Government Area of Origin)</span>
        <AppDropdown
          value={lga}
          onChange={setLga}
          options={lgaOptions}
          placeholder="Your LGA"
          className="staff-onb-dropdown"
          buttonClassName="staff-onb-dropdown-btn"
        />
      </div>
    </div>

    <div className="staff-onb-wizard-row staff-onb-wizard-row--2">
      <div className="staff-onb-field">
        <span className="staff-onb-label">Religion</span>
        <AppDropdown
          value={religion}
          onChange={setReligion}
          options={religionOptions}
          placeholder="Your religion"
          className="staff-onb-dropdown"
          buttonClassName="staff-onb-dropdown-btn"
        />
      </div>
      <label className="staff-onb-field">
        <span className="staff-onb-label">Date of Birth</span>
        <div className="staff-onb-date-wrap">
          <DatePicker
            ref={datePickerRef}
            selected={dateOfBirth}
            onChange={(date) => setDateOfBirth(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            className="staff-onb-input staff-onb-input--date"
            popperPlacement="bottom-start"
            showPopperArrow={false}
            maxDate={new Date()}
          />
          <AppButton
            type="button"
            className="staff-onb-date-icon-btn"
            onClick={() => datePickerRef.current?.setOpen(true)}
            aria-label="Open date of birth calendar"
          >
            <span className="staff-onb-date-icon" aria-hidden="true">
              <IconCalendar />
            </span>
          </AppButton>
        </div>
      </label>
    </div>

    <fieldset className="staff-onb-field staff-onb-gender-field">
      <legend className="staff-onb-label staff-onb-legend">Gender</legend>
      <div className="staff-onb-gender-options">
        {[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'prefer-not', label: 'Prefer not to say' },
        ].map((option) => (
          <label key={option.value} className="staff-onb-radio-row">
            <input
              type="radio"
              name="staff-onb-gender"
              value={option.value}
              checked={gender === option.value}
              onChange={() => setGender(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>

    <div className="staff-onb-field">
      <span className="staff-onb-label">Marital Status</span>
      <AppDropdown
        value={maritalStatus}
        onChange={setMaritalStatus}
        options={maritalStatusOptions}
        placeholder="Your marital status"
        className="staff-onb-dropdown"
        buttonClassName="staff-onb-dropdown-btn"
      />
    </div>

    <AppButton type="button" className="staff-onb-save-btn" onClick={onSaveContinue}>
      Save and Continue
    </AppButton>
  </div>
  )
}

const StaffOnboardingWizard = ({ onSubmitSuccess }) => {
  const [activeStep, setActiveStep] = useState(1)
  const fileInputRef = useRef(null)

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [stateOfOrigin, setStateOfOrigin] = useState('')
  const [lga, setLga] = useState('')
  const [religion, setReligion] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState(null)
  const [gender, setGender] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [passportPreview, setPassportPreview] = useState(null)

  const [highestQualification, setHighestQualification] = useState('')
  const [highestDegreeCourse, setHighestDegreeCourse] = useState('')
  const [otherQualifications, setOtherQualifications] = useState(['', '', ''])
  const [certifications, setCertifications] = useState(['', '', '', '', ''])
  const [workExperiences, setWorkExperiences] = useState(['', '', '', '', ''])

  const [nextOfKinName, setNextOfKinName] = useState('')
  const [nextOfKinEmail, setNextOfKinEmail] = useState('')
  const [nextOfKinPhone, setNextOfKinPhone] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyEmail, setEmergencyEmail] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [pfaName, setPfaName] = useState('')
  const [rsaPin, setRsaPin] = useState('')

  const [ninFullName, setNinFullName] = useState('')
  const [ninNumber, setNinNumber] = useState('')
  const [tinName, setTinName] = useState('')
  const [tinNumber, setTinNumber] = useState('')

  const [spouseName, setSpouseName] = useState('')
  const [spousePhone, setSpousePhone] = useState('')
  const [spousePassport, setSpousePassport] = useState(null)
  const [dependentNames, setDependentNames] = useState(['', '', ''])
  const [dependentBirthDates, setDependentBirthDates] = useState([null, null, null])
  const [dependentPassports, setDependentPassports] = useState([null, null, null])
  const [certificateFiles, setCertificateFiles] = useState([])

  useEffect(() => {
    return () => {
      if (passportPreview) URL.revokeObjectURL(passportPreview)
    }
  }, [passportPreview])

  const handlePassportSelect = () => {
    fileInputRef.current?.click()
  }

  const handlePassportChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPassportPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    e.target.value = ''
  }

  const handleSaveContinue = async () => {
    try {
      // Save current step progress to backend
      await staffService.saveOnboardingStep({ step: activeStep })
    } catch (err) {
      console.error('Error saving step progress:', err)
    }
    if (activeStep < ONBOARDING_STEPS.length) {
      setActiveStep((s) => s + 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const personalData = {
        firstName, middleName, lastName, email, address, phone,
        stateOfOrigin, lga, religion, dateOfBirth: dateOfBirth?.toISOString(),
        gender, maritalStatus
      }
      const educationData = {
        highestQualification, highestDegreeCourse,
        otherQualifications: otherQualifications.filter(q => q.trim()),
        certifications: certifications.filter(c => c.trim())
      }
      const workExpData = {
        workExperiences: workExperiences.filter(w => w.trim())
      }
      const nextOfKinData = {
        nextOfKinName, nextOfKinEmail, nextOfKinPhone,
        emergencyName, emergencyEmail, emergencyPhone
      }
      const bankPensionData = {
        bankName, accountName, accountNumber, pfaName, rsaPin
      }
      const ninTinData = {
        ninFullName, ninNumber, tinName, tinNumber
      }
      const dependentsData = {
        spouseName, spousePhone,
        dependentNames: dependentNames.filter(n => n.trim()),
        dependentBirthDates: dependentBirthDates.filter(d => d)
      }

      await staffService.submitOnboarding({
        personalInfo: JSON.stringify(personalData),
        educationInfo: JSON.stringify(educationData),
        workExperience: JSON.stringify(workExpData),
        nextOfKinInfo: JSON.stringify(nextOfKinData),
        bankPensionInfo: JSON.stringify(bankPensionData),
        ninTinInfo: JSON.stringify(ninTinData),
        dependentsInfo: JSON.stringify(dependentsData),
      })
      onSubmitSuccess?.()
    } catch (err) {
      console.error('Error submitting onboarding:', err)
    }
  }

  const renderStepContent = () => {
    if (activeStep === 1) {
      return (
        <StaffOnboardingBiodata
          firstName={firstName}
          setFirstName={setFirstName}
          middleName={middleName}
          setMiddleName={setMiddleName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          address={address}
          setAddress={setAddress}
          phone={phone}
          setPhone={setPhone}
          stateOfOrigin={stateOfOrigin}
          setStateOfOrigin={setStateOfOrigin}
          lga={lga}
          setLga={setLga}
          religion={religion}
          setReligion={setReligion}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          gender={gender}
          setGender={setGender}
          maritalStatus={maritalStatus}
          setMaritalStatus={setMaritalStatus}
          onSaveContinue={handleSaveContinue}
          passportPreview={passportPreview}
          onPassportSelect={handlePassportSelect}
        />
      )
    }

    if (activeStep === 2) {
      return (
        <StaffOnboardingEducation
          highestQualification={highestQualification}
          setHighestQualification={setHighestQualification}
          highestDegreeCourse={highestDegreeCourse}
          setHighestDegreeCourse={setHighestDegreeCourse}
          otherQualifications={otherQualifications}
          setOtherQualifications={setOtherQualifications}
          certifications={certifications}
          setCertifications={setCertifications}
          onSaveContinue={handleSaveContinue}
        />
      )
    }

    if (activeStep === 3) {
      return (
        <StaffOnboardingWorkExperience
          workExperiences={workExperiences}
          setWorkExperiences={setWorkExperiences}
          onSaveContinue={handleSaveContinue}
        />
      )
    }

    if (activeStep === 4) {
      return (
        <StaffOnboardingNextOfKin
          nextOfKinName={nextOfKinName}
          setNextOfKinName={setNextOfKinName}
          nextOfKinEmail={nextOfKinEmail}
          setNextOfKinEmail={setNextOfKinEmail}
          nextOfKinPhone={nextOfKinPhone}
          setNextOfKinPhone={setNextOfKinPhone}
          emergencyName={emergencyName}
          setEmergencyName={setEmergencyName}
          emergencyEmail={emergencyEmail}
          setEmergencyEmail={setEmergencyEmail}
          emergencyPhone={emergencyPhone}
          setEmergencyPhone={setEmergencyPhone}
          onSaveContinue={handleSaveContinue}
        />
      )
    }

    if (activeStep === 5) {
      return (
        <StaffOnboardingBankPension
          bankName={bankName}
          setBankName={setBankName}
          accountName={accountName}
          setAccountName={setAccountName}
          accountNumber={accountNumber}
          setAccountNumber={setAccountNumber}
          pfaName={pfaName}
          setPfaName={setPfaName}
          rsaPin={rsaPin}
          setRsaPin={setRsaPin}
          onSaveContinue={handleSaveContinue}
        />
      )
    }

    if (activeStep === 6) {
      return (
        <StaffOnboardingNinTin
          ninFullName={ninFullName}
          setNinFullName={setNinFullName}
          ninNumber={ninNumber}
          setNinNumber={setNinNumber}
          tinName={tinName}
          setTinName={setTinName}
          tinNumber={tinNumber}
          setTinNumber={setTinNumber}
          onSaveContinue={handleSaveContinue}
        />
      )
    }

    if (activeStep === 7) {
      return (
        <StaffOnboardingDependents
          spouseName={spouseName}
          setSpouseName={setSpouseName}
          spousePhone={spousePhone}
          setSpousePhone={setSpousePhone}
          spousePassport={spousePassport}
          setSpousePassport={setSpousePassport}
          dependentNames={dependentNames}
          setDependentNames={setDependentNames}
          dependentBirthDates={dependentBirthDates}
          setDependentBirthDates={setDependentBirthDates}
          dependentPassports={dependentPassports}
          setDependentPassports={setDependentPassports}
          onSaveContinue={handleSaveContinue}
        />
      )
    }

    if (activeStep === 8) {
      return (
        <StaffOnboardingDocumentUpload
          certificateFiles={certificateFiles}
          setCertificateFiles={setCertificateFiles}
          onSubmit={handleSubmit}
        />
      )
    }

    const step = ONBOARDING_STEPS.find((s) => s.id === activeStep)
    return (
      <div className="staff-onb-wizard-panel staff-onb-wizard-panel--placeholder">
        <h2 className="staff-onb-wizard-form-title">{step?.label}</h2>
        <p className="staff-onb-wizard-placeholder-text">This step will be available soon.</p>
      </div>
    )
  }

  return (
    <div className="staff-onb-wizard">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="staff-onb-file-input"
        onChange={handlePassportChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <nav className="staff-onb-wizard-sidebar" aria-label="Onboarding steps">
        <ol className="staff-onb-step-list">
          {ONBOARDING_STEPS.map((step, index) => {
            const isActive = activeStep === step.id
            const isComplete = activeStep > step.id
            return (
              <li key={step.id} className="staff-onb-step-item">
                <AppButton
                  type="button"
                  className={[
                    'staff-onb-step',
                    isActive && 'is-active',
                    isComplete && 'is-complete',
                    !isActive && !isComplete && 'is-upcoming',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setActiveStep(step.id)}
                >
                  <span className="staff-onb-step-circle" aria-hidden="true">
                    {isComplete ? <StepCheckIcon /> : step.id}
                  </span>
                  <span className="staff-onb-step-label">{step.label}</span>
                </AppButton>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <span
                    className={`staff-onb-step-line${activeStep > step.id ? ' is-complete' : ''}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="staff-onb-wizard-main">{renderStepContent()}</div>
    </div>
  )
}

export default StaffOnboardingWizard
