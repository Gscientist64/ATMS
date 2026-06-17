// src/HRIS/shared/HrisAddNewStaffButton.jsx

import AppButton from '../../shared/AppButton'
import './HrisAddNewStaffButton.css'

const HrisAddNewStaffButton = ({
  to = '/hris/ancillary-staff/personnel/new',
  label = '+ Add New Staff',
  className = '',
}) => {
  const mergedClassName = `hris-add-staff-btn${className ? ` ${className}` : ''}`
  return (
    <AppButton type="button" to={to} className={mergedClassName}>
      {label}
    </AppButton>
  )
}

export default HrisAddNewStaffButton
