// src/HRIS/shared/ContractLetterTemplate.jsx
import { format } from 'date-fns'
import './HrisExecuteActionsPanel.css'

const formatLetterDate = (value) => {
  if (!value) return '___'
  const date = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? '___' : format(date, 'dd MMM yyyy')
}

const ContractLetterTemplate = ({
  staffName,
  jobRoleLabel,
  projectLabel,
  startDate,
  endDate,
  location,
  reportingLine,
  salary,
  contractDate,
  staffSignatureUrl,
}) => (
  <div className="agov-pip-gcl-preview-paper">
    <div className="agov-pip-gcl-preview-header">
      <span className="agov-pip-gcl-preview-rc">RC 751436</span>
      <img src="/ecews-logo.png" alt="ECEWS logo" className="agov-pip-gcl-preview-logo" />
    </div>
    <h3 className="agov-pip-gcl-preview-title">ANCILLARY AGREEMENT BETWEEN</h3>
    <p className="agov-pip-gcl-preview-center">ECEWS</p>
    <p className="agov-pip-gcl-preview-center">AND</p>
    <p className="agov-pip-gcl-preview-center agov-pip-gcl-preview-name">{staffName || 'Staff'}</p>

    <p className="agov-pip-gcl-preview-text">
      The Management of Excellence Community Education Welfare Scheme (ECEWS) is pleased to engage you to
      provide services as {jobRoleLabel || 'selected role'} on the {projectLabel || 'selected'} PROJECT.
    </p>
    <p className="agov-pip-gcl-preview-text">
      This agreement supplants any, and all prior agreements, written or verbal. By signing this agreement,
      you are confirming your acceptance of the terms of reference contained herein:
    </p>
    <ol className="agov-pip-gcl-preview-list">
      <li>
        <strong>Duration of Engagement:</strong> Your services to ECEWS shall be effective{' '}
        <strong>
          {formatLetterDate(startDate)} to {formatLetterDate(endDate)}
        </strong>
        ; renewable, subject to the availability of funds from donors. ECEWS determination for continuity
        shall be based on satisfactory performance and conduct.
      </li>
      <li>
        Your Location is {location || '___'} and your Facility where applicable is, as assigned by your
        supervisor
      </li>
      <li>
        <strong>Reporting Line:</strong> You will be reporting to{' '}
        {reportingLine || 'the Head of your Department or as assigned'}.
      </li>
      <li>
        <strong>Level of Effort and Condition of Service:</strong> Your level of effort shall be Minimum of
        40 hours per week and the condition of service is as stipulated in the ECEWS Volunteer/Consultant
        Policy.
      </li>
    </ol>
    <p className="agov-pip-gcl-preview-text">
      <strong>Payment:</strong> A fixed monthly allowance of {salary || '___'} which will be paid in arrears
      monthly, in local currency, and subject to 5% withholding tax. It's important to note that this
      increase is based on advice from the Donor, and if they review and advise differently, we will adhere
      accordingly.
    </p>
    <p className="agov-pip-gcl-preview-text">
      <strong>Payment Conditions:</strong>
    </p>
    <ul className="agov-pip-gcl-preview-bullets">
      <li>
        Payment will be made upon submission/review of Time Sheet Log as evidence of work done, signed by
        the supervisor.
      </li>
      <li>You are NOT entitled to any of the other benefits.</li>
      <li>
        Payment will be made to the account details as provided by the Ancillary and the name MUST match the
        name of the Ancillary Staff. (Except change of name where Newspaper publication with NIN is
        evidence).
      </li>
      <li>
        He/she will carry out duties and functions as described in the scope of work, or as modified by
        his/her supervisor according to ECEWS's Programme directives and regulations.
      </li>
    </ul>
    <ol className="agov-pip-gcl-preview-list" start={6}>
      <li>
        Your engagement under this agreement is subject to the receipt of a minimum of two (2) satisfactory
        guarantors. In the event references received are not satisfactory or references are not received
        within
      </li>
      <li>
        You agree to comply with the regulations and code of conduct of ECEWS and the local laws and
        regulations of Nigeria.
      </li>
      <li>
        ECEWS may terminate this agreement immediately without prior notice in the event of poor performance,
        indiscipline, misconduct, and/or reduction in funding.
      </li>
      <li>
        <strong>SCOPE OF WORK</strong> Your scope of work will be shared with you by your Supervisor.
      </li>
      <li>
        <strong>PERFORMANCE MEASUREMENT</strong> •
        <ul className="agov-pip-gcl-preview-bullets">
          <li>Monthly assessment of technical competencies using the tracking tool.</li>
          <li>Monthly assessment of Behavioral competencies using the tracking tool.</li>
          <li>Complete and accurate Data Reporting and Management.</li>
        </ul>
      </li>
    </ol>
    <p className="agov-pip-gcl-preview-text agov-pip-gcl-preview-text--ack">
      Kindly indicate your agreement to the foregoing by sending an acknowledged scanned copy of the
      agreement to the HR and Programs Unit.
    </p>
    <div className="agov-pip-gcl-preview-sign" data-no-split>
      <div className="agov-pip-gcl-preview-sign-col">
        <p className="agov-pip-gcl-preview-sign-head">ECEWS</p>
        <p className="agov-pip-gcl-preview-sign-line">Signature: </p>
        <p className="agov-pip-gcl-preview-sign-line">Name: Situkeka Ekanem</p>
        <p className="agov-pip-gcl-preview-sign-role">Senior Human Resources Manager</p>
        <p className="agov-pip-gcl-preview-sign-line">Date: {formatLetterDate(contractDate)}</p>
      </div>
      <div className="agov-pip-gcl-preview-sign-col">
        <p className="agov-pip-gcl-preview-sign-head">ANCILLARY STAFF</p>
        <p className="agov-pip-gcl-preview-sign-line">
          Signature:{' '}
          {staffSignatureUrl && (
            <img
              src={staffSignatureUrl}
              alt="Staff signature"
              className="agov-pip-gcl-preview-signature-img"
              crossOrigin="anonymous"
            />
          )}
        </p>
        <p className="agov-pip-gcl-preview-sign-line">Name: {staffName || 'Staff'}</p>
        <p className="agov-pip-gcl-preview-sign-role">Ancillary Staff</p>
        <p className="agov-pip-gcl-preview-sign-line">Date: {formatLetterDate(contractDate)}</p>
      </div>
    </div>
  </div>
)

export default ContractLetterTemplate
