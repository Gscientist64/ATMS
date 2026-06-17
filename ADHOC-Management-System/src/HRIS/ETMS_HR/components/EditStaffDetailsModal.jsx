// src/HRIS/ETMS_HR/components/EditStaffDetailsModal.jsx

import React, { useState, useEffect } from 'react'
import AppButton from '../../../shared/AppButton'
import './EditStaffDetailsModal.css'

const EditStaffDetailsModal = ({ isOpen, onClose, staff, onSave, initialSection = 'contact', updating = false }) => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        ninName: '',
        ninNumber: '',
        tinName: '',
        tinNumber: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [activeSection, setActiveSection] = useState(initialSection)

    // Update active section when initialSection prop changes (e.g., when opening modal for different section)
    useEffect(() => {
        if (initialSection) {
            setActiveSection(initialSection)
        }
    }, [initialSection])

    // Reset form when staff changes or modal opens
    useEffect(() => {
        if (staff && isOpen) {
            setFormData({
                phoneNumber: staff.phoneNumber || '',
                emergencyContactName: staff.emergencyContactName || '',
                emergencyContactPhone: staff.emergencyContactPhone || '',
                bankName: staff.bankName || '',
                accountNumber: staff.accountNumber?.replace(/^\*+/, '') || '',
                accountName: staff.accountName || '',
                ninName: staff.ninName || '',
                ninNumber: staff.ninNumber?.replace(/^\*+/, '') || '',
                tinName: staff.tinName || '',
                tinNumber: staff.tinNumber?.replace(/^\*+/, '') || ''
            })
            setError('')
        }
    }, [staff, isOpen])

    if (!isOpen) return null

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setError('')
    }

    const handleSave = async () => {
        setLoading(true)
        setError('')
        try {
            await onSave(formData)
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to update staff details')
        } finally {
            setLoading(false)
        }
    }

    const sections = {
        contact: {
            title: 'Contact Information',
            fields: [
                { label: 'Phone Number', field: 'phoneNumber', type: 'tel' },
                { label: 'Emergency Contact Name', field: 'emergencyContactName', type: 'text' },
                { label: 'Emergency Contact Phone', field: 'emergencyContactPhone', type: 'tel' }
            ]
        },
        banking: {
            title: 'Banking Details',
            fields: [
                { label: 'Bank Name', field: 'bankName', type: 'text' },
                { label: 'Account Number', field: 'accountNumber', type: 'text' },
                { label: 'Account Name', field: 'accountName', type: 'text' }
            ]
        },
        nin: {
            title: 'NIN and TIN Details',
            fields: [
                { label: 'NIN Name', field: 'ninName', type: 'text' },
                { label: 'NIN Number', field: 'ninNumber', type: 'text' },
                { label: 'TIN Name', field: 'tinName', type: 'text' },
                { label: 'TIN Number', field: 'tinNumber', type: 'text' }
            ]
        }
    }

    const isLoading = loading || updating

    return (
        <div className="edit-staff-modal-overlay" onClick={onClose}>
            <div className="edit-staff-modal" onClick={(e) => e.stopPropagation()}>
                <div className="edit-staff-modal-header">
                    <h3 className="edit-staff-modal-title">Edit Staff Details</h3>
                    <button className="edit-staff-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="edit-staff-modal-tabs">
                    <button 
                        className={`edit-staff-tab ${activeSection === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveSection('contact')}
                    >
                        Contact
                    </button>
                    <button 
                        className={`edit-staff-tab ${activeSection === 'banking' ? 'active' : ''}`}
                        onClick={() => setActiveSection('banking')}
                    >
                        Banking
                    </button>
                    <button 
                        className={`edit-staff-tab ${activeSection === 'nin' ? 'active' : ''}`}
                        onClick={() => setActiveSection('nin')}
                    >
                        NIN & TIN
                    </button>
                </div>

                {error && <div className="edit-staff-error">{error}</div>}

                <div className="edit-staff-modal-body">
                    <h4 className="edit-staff-section-title">{sections[activeSection].title}</h4>
                    {sections[activeSection].fields.map(field => (
                        <div key={field.field} className="edit-staff-field">
                            <label className="edit-staff-label">{field.label}</label>
                            <input
                                type={field.type}
                                className="edit-staff-input"
                                value={formData[field.field] || ''}
                                onChange={(e) => handleChange(field.field, e.target.value)}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                disabled={isLoading}
                            />
                        </div>
                    ))}
                </div>

                <div className="edit-staff-modal-footer">
                    <AppButton type="button" className="edit-staff-cancel" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </AppButton>
                    <AppButton type="button" className="edit-staff-save" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </AppButton>
                </div>
            </div>
        </div>
    )
}

export default EditStaffDetailsModal