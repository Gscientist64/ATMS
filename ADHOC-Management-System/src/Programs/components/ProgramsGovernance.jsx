import React, { useState, useEffect, useMemo } from 'react'
import AppButton from '../../shared/AppButton'
import AppTable from '../../shared/AppTable'
import AppDropdown from '../../shared/AppDropdown'
import './ProgramsGovernance.css'
import { programsService } from '../../services/api'

const ProgramsGovernance = () => {
  const [advisoryType, setAdvisoryType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGovernanceData()
  }, [])

  const fetchGovernanceData = async () => {
    try {
      setLoading(true)
      const data = await programsService.getGovernanceDashboard()
      setDashboardData(data)
    } catch (err) {
      setError('Failed to load governance data')
    } finally {
      setLoading(false)
    }
  }

  // Filter and paginate the advisories
  const filtered = useMemo(() => {
    let rows = dashboardData?.advisories || []
    
    if (advisoryType) {
      const t = advisoryType.toLowerCase()
      rows = rows.filter((r) => r.type?.toLowerCase().includes(t))
    }

    if (status) {
      const s = status.toLowerCase()
      rows = rows.filter((r) => r.contractStatus?.toLowerCase().includes(s))
    }

    return rows
  }, [advisoryType, status, dashboardData])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const columns = [
    { header: 'Staff name', accessor: 'staffName', key: 'staffName' },
    { header: 'Type', accessor: 'type', key: 'type' },
    { header: 'Raised by', accessor: 'raisedBy', key: 'raisedBy' },
    {
      header: 'Contract Status',
      accessor: 'contractStatus',
      key: 'contractStatus',
      render: (row) => {
        const isExpiring = row.contractStatus === 'Expiring soon'
        return <span className={`pgg-pill ${isExpiring ? 'pgg-pill-red' : 'pgg-pill-green'}`}>
          {row.contractStatus}
        </span>
      },
    },
    {
      header: 'Action',
      key: 'action',
      headerClassName: 'pgg-th-action',
      cellClassName: 'pgg-td-action',
      render: (row) => {
        const itemId = row.id || row.Id
        return (
          <AppButton
            to={`/programs/governance/advisory/${itemId}`}
            className="pgg-review-btn"
            aria-label="Review"
          >
            Review
          </AppButton>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="pgg-page">
        <div className="pgg-loading">Loading governance data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pgg-page">
        <div className="pgg-error">{error}</div>
        <AppButton onClick={fetchGovernanceData} className="pgg-retry-btn">
          Retry
        </AppButton>
      </div>
    )
  }

  return (
    <div className="pgg-page">
      <div className="pgg-header">
        <h1 className="pgg-title">Governance Overview</h1>
        <p className="pgg-subtitle">Review and manage advisory recommendations</p>
      </div>

      <div className="pgg-metrics">
        <div className="pgg-metric-card">
          <div className="pgg-metric-icon pgg-icon-green" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pgg-metric-text">
            <div className="pgg-metric-label">Renewal Advisory</div>
            <div className="pgg-metric-value">{dashboardData?.renewalAdvisoryCount || 0}</div>
          </div>
        </div>

        <div className="pgg-metric-card">
          <div className="pgg-metric-icon pgg-icon-amber" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="pgg-metric-text">
            <div className="pgg-metric-label">PIP Advisory</div>
            <div className="pgg-metric-value">{dashboardData?.pipAdvisoryCount || 0}</div>
          </div>
        </div>

        <div className="pgg-metric-card">
          <div className="pgg-metric-icon pgg-icon-red" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 16h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pgg-metric-text">
            <div className="pgg-metric-label">Termination Advisory</div>
            <div className="pgg-metric-value">{dashboardData?.terminationAdvisoryCount || 0}</div>
          </div>
        </div>
      </div>

      <div className="pgg-card pgg-table-card">
        <div className="pgg-staff-toolbar">
          <div className="pgg-staff-title">Staff Advisory</div>
          <div className="pgg-filters">
            <AppDropdown
              className="pgg-filter"
              buttonClassName="pgg-filter-btn"
              value={advisoryType}
              onChange={(v) => {
                setAdvisoryType(v)
                setPage(1)
              }}
              placeholder="Advisory Type"
              options={[
                { value: '', label: 'All Types' },
                { value: 'renewal', label: 'Renewal Advisory' },
                { value: 'pip', label: 'PIP Advisory' },
                { value: 'termination', label: 'Termination Advisory' },
              ]}
            />

            <AppDropdown
              className="pgg-filter"
              buttonClassName="pgg-filter-btn"
              value={status}
              onChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
              placeholder="Contract Status"
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'expiring', label: 'Expiring soon' },
                { value: 'expired', label: 'Expired' },
              ]}
            />
          </div>
        </div>

        <AppTable
          columns={columns}
          data={paged}
          rowKey="id"
          containerClassName="pgg-table-wrap"
          tableClassName="pgg-table"
          emptyMessage="No advisory records found"
        />

        {totalPages > 1 && (
          <div className="pgg-pagination">
            <AppButton
              type="button"
              className="pgg-page-btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </AppButton>

            <div className="pgg-page-numbers">
              {(() => {
                const pages = []
                const startPage = Math.max(1, safePage - 2)
                const endPage = Math.min(totalPages, safePage + 2)
                if (startPage > 1) {
                  pages.push(1)
                  if (startPage > 2) pages.push('...')
                }
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i)
                }
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) pages.push('...')
                  pages.push(totalPages)
                }
                return pages.map((n, idx) =>
                  typeof n === 'number' ? (
                    <AppButton
                      key={n}
                      type="button"
                      className={`pgg-page-num ${safePage === n ? 'active' : ''}`}
                      onClick={() => setPage(n)}
                      aria-label={`Page ${n}`}
                    >
                      {n}
                    </AppButton>
                  ) : (
                    <span key={`dots-${idx}`} className="pgg-page-dots">…</span>
                  )
                )
              })()}
            </div>

            <AppButton
              type="button"
              className="pgg-page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </AppButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgramsGovernance