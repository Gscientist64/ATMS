import { useEffect, useMemo, useState } from 'react'
import AppButton from '../../../shared/AppButton'
import AppDropdown from '../../../shared/AppDropdown'
import { getAncillaryEmployees } from '../../../services/api'
import './AncillaryStaffPersonnel.css'

const getContractStatusClass = (status) => {
  switch ((status || '').toLowerCase().replace(/\s+/g, '')) {
    case 'onpip': return 'onpip'
    case 'terminated': return 'terminated'
    case 'terminationpending': return 'terminationpending'
    case 'expiringsoon': return 'expiringsoon'
    default: return ''
  }
}

const getListStatusClass = (status) => {
  switch ((status || '').toLowerCase().replace(/\s+/g, '')) {
    case 'onpip': return 'warning'
    case 'terminated': return 'danger'
    case 'terminationpending': return 'terminationpending'
    case 'expiringsoon': return 'danger'
    default: return 'success'
  }
}

const AncillaryStaffPersonnel = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [query, setQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const data = await getAncillaryEmployees()
      const items = Array.isArray(data) ? data : (data.data || data.employees || data.staff || [])
      setStaffList(items.map((p, i) => ({
        id: p.id || p.userId || i,
        status: p.contractStatus === 'Active' ? 'Active' : (p.contractStatus || 'Active'),
        contractStatus: p.contractStatus || 'Active',
        flagsCount: p.flagsCount || 0,
        initials: (p.fullName || p.name || 'U').split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase() || 'U',
        name: p.fullName || p.name || 'Unknown',
        role: p.designation || p.role || '',
        designation: p.designation || '',
        staffId: p.employeeCode || p.staffId || '',
        location: p.state || p.location || '',
      })))
    } catch (err) {
      console.error('Failed to load staff:', err)
    } finally {
      setLoading(false)
    }
  }

  const all = staffList

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((p) => {
      if (q && !(`${p.name} ${p.role} ${p.staffId}`.toLowerCase().includes(q))) return false
      if (locationFilter && locationFilter !== 'all' && locationFilter !== '') {
        if (p.location !== locationFilter) return false
      }
      if (status && status !== 'all') {
        const normalized = p.contractStatus.toLowerCase().replace(/\s+/g, '')
        if (normalized !== status) return false
      }
      return true
    })
  }, [all, query, locationFilter, status])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  if (loading) return <div className="asp-page"><div className="asp-loading">Loading staff...</div></div>

  return (
    <div className="asp-page">
      <div className="asp-header-row">
        <div className="asp-header-text">
          <h1 className="asp-title">Staff Profiles</h1>
          <p className="asp-subtitle">Manage and view staff profiles</p>
        </div>
      </div>

      <div className="asp-card">
        <div className="asp-toolbar">
          <div className="asp-toolbar-left">
            <h2 className="asp-card-title">All Personnel ({filtered.length})</h2>
          </div>

          <div className="asp-toolbar-right">
            <div className="asp-search">
              <span className="asp-search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="asp-search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search staff"
                aria-label="Search staff"
              />
            </div>

            <AppDropdown
              className="asp-dropdown"
              buttonClassName="asp-dropdown-btn"
              value={locationFilter}
              onChange={(v) => {
                setLocationFilter(v)
                setPage(1)
              }}
              placeholder="Location"
              ariaLabel="Location"
              options={[
                { value: '', label: 'Location' },
                { value: 'all', label: 'All locations' },
                { value: 'Abuja', label: 'Abuja' },
                { value: 'Akwa Ibom', label: 'Akwa Ibom' },
                { value: 'Cross River', label: 'Cross River' },
                { value: 'Delta', label: 'Delta' },
                { value: 'Ebonyi', label: 'Ebonyi' },
                { value: 'Ekiti', label: 'Ekiti' },
                { value: 'Enugu', label: 'Enugu' },
                { value: 'Lagos', label: 'Lagos' },
                { value: 'Osun', label: 'Osun' },
              ]}
            />

            <AppDropdown
              className="asp-dropdown"
              buttonClassName="asp-dropdown-btn"
              value={status}
              onChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
              placeholder="All Status"
              ariaLabel="All Status"
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'onpip', label: 'On PIP' },
                { value: 'expiringsoon', label: 'Expiring soon' },
              ]}
            />

            <div className="asp-view-toggle" role="group" aria-label="View mode">
              <AppButton
                type="button"
                className={`asp-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
                  <rect x="11" y="2" width="5" height="5" rx="1" fill="currentColor" />
                  <rect x="2" y="11" width="5" height="5" rx="1" fill="currentColor" />
                  <rect x="11" y="11" width="5" height="5" rx="1" fill="currentColor" />
                </svg>
              </AppButton>
              <AppButton
                type="button"
                className={`asp-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor" />
                  <rect x="2" y="8" width="14" height="2" rx="1" fill="currentColor" />
                  <rect x="2" y="13" width="14" height="2" rx="1" fill="currentColor" />
                </svg>
              </AppButton>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="asp-list-wrap">
            <div className="asp-list-head" role="row">
              <div className="asp-list-th">Staff name</div>
              <div className="asp-list-th">Designation</div>
              <div className="asp-list-th">Staff ID</div>
              <div className="asp-list-th">Contract Status</div>
              <div className="asp-list-th">Flags</div>
              <div className="asp-list-th asp-list-th-action">Action</div>
            </div>

            <div className="asp-list-body">
              {paged.map((p) => (
                <div key={p.id} className="asp-list-row" role="row">
                  <div className="asp-list-td asp-list-name">{p.name}</div>
                  <div className="asp-list-td">{p.designation}</div>
                  <div className="asp-list-td">{p.staffId}</div>
                  <div className="asp-list-td">
                    <span className={`asp-list-status ${getListStatusClass(p.contractStatus)}`}>
                      {p.contractStatus}
                    </span>
                  </div>
                  <div className="asp-list-td">
                    {p.flagsCount > 0 ? (
                      <span className="asp-list-flags">{p.flagsCount} Flags</span>
                    ) : (
                      <span className="asp-list-none">None</span>
                    )}
                  </div>
                  <div className="asp-list-td asp-list-action">
                    <AppButton to={`/hris/ancillary-staff/personnel/staff/${p.id}`} className="asp-list-view-btn">
                      View details
                    </AppButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="asp-grid">
            {paged.map((p) => (
              <div key={p.id} className="asp-person-card">
                <div className={`asp-status-pill ${getContractStatusClass(p.contractStatus)}`}>{p.contractStatus}</div>
                <div className="asp-avatar">{p.initials}</div>
                <div className="asp-name">{p.name}</div>
                <div className="asp-role">{p.role}</div>
                <div className="asp-staffid">{p.staffId}</div>
                <AppButton to={`/hris/ancillary-staff/personnel/staff/${p.id}`} className="asp-view-details-btn">
                  View details
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="asp-pagination-outer">
        <AppButton
          type="button"
          className="asp-page-btn asp-page-nav"
          disabled={safePage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-label="Previous page"
        >
          Previous
        </AppButton>

        <div className="asp-page-numbers" aria-label="Page numbers">
          {[1, 2, 3, '…', 9].map((n, idx) =>
            typeof n === 'number' ? (
              <AppButton
                key={`${n}-${idx}`}
                type="button"
                className={`asp-page-num ${safePage === n ? 'active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </AppButton>
            ) : (
              <span key={`dots-${idx}`} className="asp-page-dots">
                …
              </span>
            ),
          )}
        </div>

        <AppButton
          type="button"
          className="asp-page-btn asp-page-nav"
          disabled={safePage >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          aria-label="Next page"
        >
          Next
        </AppButton>
      </div>
    </div>
  )
}

export default AncillaryStaffPersonnel
