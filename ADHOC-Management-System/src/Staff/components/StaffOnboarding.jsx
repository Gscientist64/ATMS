import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import StaffOnboardingWizard from './StaffOnboardingWizard'
import StaffOnboardingSuccess from './StaffOnboardingSuccess'
import './StaffOnboarding.css'

const ONBOARDING_REQUIREMENTS = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Your basic details for identification',
  },
  {
    id: 'contact',
    title: 'Contact Details',
    description: 'Information to contact you.',
  },
  {
    id: 'documents',
    title: 'Official Documents',
    description: 'Credentials and Licenses',
  },
  {
    id: 'bank',
    title: 'Bank & Pension',
    description: 'Details for payments, benefits and records',
  },
]

const StaffOnboarding = ({ userName = 'Mike' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const openWizard = location.state?.openWizard === true
  const [started, setStarted] = useState(openWizard)
  const [submitted, setSubmitted] = useState(false)

  const handleCancel = () => {
    navigate('/staff/dashboard')
  }

  if (submitted) {
    return <StaffOnboardingSuccess />
  }

  return (
    <div className={`staff-onboarding-page${started ? ' staff-onboarding-page--wizard' : ''}`}>
      <header className="staff-onboarding-header">
        <img className="staff-onboarding-logo" src="/ecews-logo.png" alt="ECEWS" />
        <AppButton type="button" className="staff-onboarding-cancel" onClick={handleCancel}>
          Cancel
        </AppButton>
      </header>

      {started ? (
        <StaffOnboardingWizard onSubmitSuccess={() => setSubmitted(true)} />
      ) : (
        <div className="staff-onboarding-content">
          <main className="staff-onboarding-main">
            <h1 className="staff-onboarding-title">Welcome to ECEWS</h1>
            <p className="staff-onboarding-intro">
              Hi {userName}! Setup your account to onboard. Kindly have the following ready:
            </p>

            <ul className="staff-onboarding-list">
              {ONBOARDING_REQUIREMENTS.map((item) => (
                <li key={item.id} className="staff-onboarding-card">
                  <div className="staff-onboarding-card-title">{item.title}</div>
                  <div className="staff-onboarding-card-desc">{item.description}</div>
                </li>
              ))}
            </ul>

            <AppButton type="button" className="staff-onboarding-start-btn" onClick={() => setStarted(true)}>
              Start Onboarding
            </AppButton>
          </main>
        </div>
      )}
    </div>
  )
}

export default StaffOnboarding
