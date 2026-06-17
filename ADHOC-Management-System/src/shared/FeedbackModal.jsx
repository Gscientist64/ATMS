import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import AppButton from './AppButton'

const feedbackEditorModules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
  ],
}

const feedbackEditorFormats = [
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'script',
  'header',
  'list',
  'bullet',
  'indent',
  'align',
  'blockquote',
  'code-block',
  'link',
  'image',
  'video',
]

const FeedbackModal = ({ isOpen, isClosing, onClose }) => {
  const [unit, setUnit] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setUnit('')
    setName('')
    setEmail('')
    setText('')
    setIsSubmitted(false)
    onClose?.()
  }

  const handleSend = () => {
    // TODO: wire to API when available
    setIsSubmitted(true)
  }

  return (
    <div className="header-modal-overlay" onClick={handleClose}>
      <div
        className={`header-modal header-feedback-modal ${
          isClosing ? 'header-modal-closing' : 'header-modal-opening'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isSubmitted ? (
          <>
            <div className="header-feedback-header-row">
              <h2 className="header-feedback-title">Leave a Feedback</h2>
              <button
                type="button"
                className="header-modal-close"
                onClick={handleClose}
                aria-label="Close feedback"
              >
                &times;
              </button>
            </div>

            <div className="header-feedback-body">
              <div className="header-modal-field">
                <label className="header-modal-label">Select Unit</label>
                <select
                  className="header-feedback-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Programs">Programs</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="header-feedback-row header-feedback-row-two">
                <div className="header-modal-field">
                  <label className="header-modal-label">Your name</label>
                  <input
                    type="text"
                    className="header-feedback-input"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="header-modal-field">
                  <label className="header-modal-label">Your email</label>
                  <input
                    type="email"
                    className="header-feedback-input"
                    placeholder="youremail@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="header-modal-field">
                <label className="header-modal-label">Feedback</label>
                <ReactQuill
                  theme="snow"
                  value={text}
                  onChange={setText}
                  className="header-feedback-editor"
                  placeholder="Enter description"
                  modules={feedbackEditorModules}
                  formats={feedbackEditorFormats}
                />
              </div>
            </div>

            <div className="header-feedback-footer">
              <AppButton
                type="button"
                className="header-modal-btn header-modal-btn-primary"
                onClick={handleSend}
              >
                Send feedback
              </AppButton>
            </div>
          </>
        ) : (
          <div className="header-password-success-modal header-feedback-success-modal">
            <button
              type="button"
              className="header-modal-close header-modal-close-top-right"
              onClick={handleClose}
              aria-label="Close feedback success"
            >
              &times;
            </button>

            <div className="header-success-icon-wrapper">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                className="header-success-check"
              >
                <path
                  d="M16 34L27 45L48 20"
                  stroke="#16A34A"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="header-success-text">
              <h2 className="header-success-title">Success!</h2>
              <p className="header-success-message">
                Your feedback has been sent successfully.
              </p>
            </div>

            <div className="header-success-footer">
              <AppButton
                type="button"
                className="header-modal-btn header-modal-btn-primary"
                onClick={handleClose}
              >
                Done
              </AppButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeedbackModal

