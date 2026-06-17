import React, { useState, useEffect } from 'react'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './ProgramsTimesheetReview.css'
import { programsService } from '../../services/api'

const ProgramsTimesheetReview = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [timesheets, setTimesheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  
  // Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExportModalClosing, setIsExportModalClosing] = useState(false)
  const [exportStartDate, setExportStartDate] = useState(null)
  const [exportEndDate, setExportEndDate] = useState(null)
  const [exportTab, setExportTab] = useState('approved')

  useEffect(() => {
    fetchTimesheets()
  }, [activeTab])

  const fetchTimesheets = async () => {
    try {
      setLoading(true)
      const data = await programsService.getTimesheetsForReview(activeTab)
      setTimesheets(data)
    } catch (err) {
      setError('Failed to load timesheets')
      console.error('Error fetching timesheets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportAll = async () => {
    try {
        setExporting(true);
        const blob = await programsService.exportAllTimesheets(activeTab);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Timesheets_${activeTab}_${new Date().toISOString().slice(0, 19)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        console.error('Error exporting:', err);
        setError('Failed to export timesheets');
    } finally {
        setExporting(false);
    }
  };

  // Open export modal
  const openExportModal = () => {
    setExportStartDate(null)
    setExportEndDate(null)
    setExportTab(activeTab === 'approved' ? 'approved' : 'approved')
    setIsExportModalClosing(false)
    setIsExportModalOpen(true)
  }

  // Close export modal
  const closeExportModal = () => {
    setIsExportModalClosing(true)
    setTimeout(() => {
      setIsExportModalOpen(false)
      setIsExportModalClosing(false)
    }, 250)
  }

  // Handle export with date range
  const handleExportWithDateRange = async () => {
    if (!exportStartDate || !exportEndDate) {
      alert('Please select both start and end dates')
      return
    }
    
    if (exportStartDate > exportEndDate) {
      alert('Start date cannot be after end date')
      return
    }
    
    setExporting(true)
    try {
      const blob = await programsService.exportTimesheetsWithDateRange(
        exportTab, 
        exportStartDate, 
        exportEndDate
      )
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `timesheets_${exportTab}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      closeExportModal()
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export timesheets')
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    { header: 'Staff name', accessor: 'staffName' },
    { header: 'Submission Date', accessor: 'submissionDate' },
    {
      header: 'Timesheet Status',
      key: 'timesheetStatus',
      render: (row) => {
        let className = 'pgtr-pill-purple'
        if (row.timesheetStatus === 'Approved') className = 'pgtr-pill-approved'
        else if (row.timesheetStatus === 'Returned') className = 'pgtr-pill-returned'
        
        return <span className={`pgtr-pill ${className}`}>{row.timesheetStatus}</span>
      },
    },
    {
      header: 'Contract Status',
      key: 'contractStatus',
      render: (row) => {
        const status = row.contractStatus?.toLowerCase().replace(/\s+/g, '') || 'active'
        let className = 'pgtr-pill-gray'
        if (status === 'active') className = 'pgtr-pill-green'
        else if (status === 'onpip') className = 'pgtr-pill-amber'
        else if (status === 'expiringsoon') className = 'pgtr-pill-red'

        return <span className={`pgtr-pill ${className}`}>{row.contractStatus}</span>
      },
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <AppButton
          to={activeTab === 'pending' ? `/programs/timesheet/${row.id}` : `/programs/timesheet/view/${row.id}`}
          className={activeTab === 'pending' ? 'pgtr-review-btn' : 'pgtr-view-btn'}
        >
          {activeTab === 'pending' ? 'Review' : 'View'}
        </AppButton>
      ),
    }
  ]

  if (loading && timesheets.length === 0) {
    return (
      <div className="pgtr-page">
        <div className="pgtr-loading">Loading timesheets...</div>
      </div>
    )
  }

  return (
    <div className="pgtr-page">
      <div className="pgtr-header">
        <h1 className="pgtr-title">Review Timesheets</h1>
        <p className="pgtr-subtitle">Track submitted timesheets</p>
      </div>

      {error && (
        <div className="pgtr-error">
          {error}
          <button onClick={fetchTimesheets} className="pgtr-retry-btn">Retry</button>
        </div>
      )}

      <div className="pgtr-card">
        <div className="pgtr-card-header">
          <h2 className="pgtr-card-title">All Timesheet</h2>
        </div>

        <div className="pgtr-tabs-row">
          <div className="pgtr-tabs">
            <AppButton
              type="button"
              className={`pgtr-tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
            </AppButton>
            <AppButton
              type="button"
              className={`pgtr-tab ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved
            </AppButton>
            <AppButton
              type="button"
              className={`pgtr-tab ${activeTab === 'returned' ? 'active' : ''}`}
              onClick={() => setActiveTab('returned')}
            >
              Returned
            </AppButton>
          </div>

          {activeTab === 'approved' && (
            <AppButton 
              type="button" 
              className="pgtr-export-btn" 
              onClick={openExportModal}
              disabled={exporting || timesheets.length === 0}
            >
              {exporting ? 'Exporting...' : 'Export'}
            </AppButton>
          )}
        </div>

        <div className="pgtr-table-container">
          <AppTable 
            columns={columns} 
            data={timesheets} 
            rowKey="id" 
            tableClassName="pgtr-table"
            emptyMessage={`No ${activeTab} timesheets found`}
          />
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="pgtr-modal-overlay" onClick={closeExportModal}>
          <div 
            className={`pgtr-export-modal ${isExportModalClosing ? 'pgtr-export-modal-closing' : 'pgtr-export-modal-opening'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pgtr-modal-header">
              <h3 className="pgtr-modal-title">Export Timesheets</h3>
              <button
                type="button"
                className="pgtr-modal-close"
                onClick={closeExportModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="pgtr-modal-body">
              <div className="pgtr-export-field">
                <label className="pgtr-export-label">Status</label>
                <select 
                  value={exportTab} 
                  onChange={(e) => setExportTab(e.target.value)}
                  className="pgtr-export-select"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="returned">Returned</option>
                  <option value="all">All</option>
                </select>
              </div>
              
              <div className="pgtr-export-field">
                  <label className="pgtr-export-label">Start Date</label>
                  <DatePicker
                      selected={exportStartDate}
                      onChange={date => setExportStartDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select start date"
                      className="pgtr-date-picker"
                      isClearable
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={5}
                      scrollableYearDropdown
                  />
              </div>
              
              <div className="pgtr-export-field">
                  <label className="pgtr-export-label">End Date</label>
                  <DatePicker
                      selected={exportEndDate}
                      onChange={date => setExportEndDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select end date"
                      className="pgtr-date-picker"
                      isClearable
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={5}
                      scrollableYearDropdown
                  />
              </div>
            </div>
            
            <div className="pgtr-modal-footer">
              <AppButton
                type="button"
                className="pgtr-modal-cancel-btn"
                onClick={closeExportModal}
              >
                Cancel
              </AppButton>
              <AppButton
                type="button"
                className="pgtr-modal-export-btn"
                onClick={handleExportWithDateRange}
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : 'Export'}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgramsTimesheetReview