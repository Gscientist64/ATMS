import { useNavigate } from 'react-router-dom'
import AppButton from '../../shared/AppButton'
import AnimatedCheckmark from '../../shared/AnimatedCheckmark'
import './StaffOnboardingSuccess.css'

const StaffOnboardingSuccess = () => {
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/staff/dashboard')
  }

  return (
    <div className="staff-onb-success-page">
      <div className="staff-onb-success-content">
        <div className="staff-onb-success-brand">
          <img className="staff-onb-success-logo" src="/ecews-logo.png" alt="ECEWS" />
        </div>

        <div className="staff-onb-success-icon" aria-hidden="true">
          <AnimatedCheckmark size={96} strokeWidth={10} loop duration={2.2} />
        </div>

        <h1 className="staff-onb-success-title staff-onb-success-reveal staff-onb-success-reveal--after-check">
          Great Job! Your setup application is successful
        </h1>
        <p className="staff-onb-success-message staff-onb-success-reveal staff-onb-success-reveal--after-check">
          Your account will be reviewed by the HR team, and you will be able to sign in once approved.
        </p>

        <AppButton
          type="button"
          className="staff-onb-success-btn staff-onb-success-reveal staff-onb-success-reveal--after-check"
          onClick={handleContinue}
        >
          Save and Continue
        </AppButton>
      </div>
    </div>
  )
}

export default StaffOnboardingSuccess
