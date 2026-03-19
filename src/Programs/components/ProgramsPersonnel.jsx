import { useMemo, useState } from 'react'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import './ProgramsPersonnel.css'

const buildPersonnel = (count) => {
  const states = [
    'Abuja',
    'Akwa Ibom',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Ekiti',
    'Enugu',
    'Lagos',
    'Osun',
  ]
  const out = []
  for (let i = 1; i <= count; i += 1) {
    const contractStatus = i >= 6 ? 'Expiring soon' : 'Active'
    const flagsCount = i === 1 ? 2 : 0
    out.push({
      id: i,
      status: contractStatus,
      contractStatus,
      flagsCount,
      initials: 'JA',
      name: 'John Adeyemi',
      role: 'Case Manager - ACE 5',
      designation: 'Case Manager',
      staffId: 'AKS/UYO/009123',
      state: states[(i - 1) % states.length],
    })
  }
  return out
}

const ProgramsPersonnel = () => {
  const [viewMode, setViewMode] = useState('grid') // grid | list (list not implemented visually yet)
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const all = useMemo(() => buildPersonnel(100), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((p) => {
      if (q && !(`${p.name} ${p.role} ${p.staffId}`.toLowerCase().includes(q))) return false
      if (stateFilter && stateFilter !== 'all') {
        if (p.state !== stateFilter) return false
      }
      if (status && status !== 'all') {
        const normalized = p.contractStatus.toLowerCase().replace(/\s+/g, '')
        if (normalized !== status) return false
      }
      return true
    })
  }, [all, query, stateFilter, status])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return (
    <div className="pp-page">
      <div className="pp-header">
        <h1 className="pp-title">Personnel</h1>
        <p className="pp-subtitle">Manage and monitor your staff members</p>
      </div>

      <div className="pp-card">
        <div className="pp-toolbar">
          <div className="pp-toolbar-left">
            <h2 className="pp-card-title">All Personnel ({filtered.length})</h2>
          </div>

          <div className="pp-toolbar-right">
            <div className="pp-search">
              <span className="pp-search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M20 20l-3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                className="pp-search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search staff"
              />
            </div>

            <AppDropdown
              className="pp-dropdown"
              buttonClassName="pp-dropdown-btn"
              value={stateFilter}
              onChange={(v) => {
                setStateFilter(v)
                setPage(1)
              }}
              placeholder="Select States"
              ariaLabel="Select States"
              options={[
                { value: '', label: 'Select States' },
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
              className="pp-dropdown"
              buttonClassName="pp-dropdown-btn"
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

            <div className="pp-view-toggle" role="group" aria-label="View mode">
              <AppButton
                type="button"
                className={`pp-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
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
                className={`pp-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
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
          <div className="pp-list-wrap">
            <div className="pp-list-head" role="row">
              <div className="pp-list-th">Staff name</div>
              <div className="pp-list-th">Designation</div>
              <div className="pp-list-th">Staff ID</div>
              <div className="pp-list-th">Contract Status</div>
              <div className="pp-list-th">Flags</div>
              <div className="pp-list-th pp-list-th-action">Action</div>
            </div>

            <div className="pp-list-body">
              {paged.map((p) => (
                <div key={p.id} className="pp-list-row" role="row">
                  <div className="pp-list-td pp-list-name">{p.name}</div>
                  <div className="pp-list-td">{p.designation}</div>
                  <div className="pp-list-td">{p.staffId.replace('009123', '09234')}</div>
                  <div className="pp-list-td">
                    <span
                      className={`pp-list-status ${
                        p.contractStatus.toLowerCase().includes('expiring') ? 'danger' : 'success'
                      }`}
                    >
                      {p.contractStatus}
                    </span>
                  </div>
                  <div className="pp-list-td">
                    {p.flagsCount > 0 ? (
                      <span className="pp-list-flags">{p.flagsCount} Flags</span>
                    ) : (
                      <span className="pp-list-none">None</span>
                    )}
                  </div>
                  <div className="pp-list-td pp-list-action">
                    <AppButton to={`/programs/staff/${p.id}`} className="pp-list-view-btn">
                      View details
                    </AppButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pp-grid">
            {paged.map((p) => (
              <div key={p.id} className="pp-person-card">
                <div className="pp-status-pill">{p.status}</div>
                <div className="pp-avatar">{p.initials}</div>
                <div className="pp-name">{p.name}</div>
                <div className="pp-role">{p.role}</div>
                <div className="pp-staffid">{p.staffId}</div>
                <AppButton to={`/programs/staff/${p.id}`} className="pp-view-details-btn">
                  View details
                </AppButton>
              </div>
            ))}
          </div>
        )}

        <div className="pp-pagination">
          <AppButton
            type="button"
            className="pp-page-btn"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            ‹
          </AppButton>

          <div className="pp-page-numbers" aria-label="Page numbers">
            {[1, 2, 3, '…', 9].map((n, idx) =>
              typeof n === 'number' ? (
                <AppButton
                  key={`${n}-${idx}`}
                  type="button"
                  className={`pp-page-num ${safePage === n ? 'active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </AppButton>
              ) : (
                <span key={`dots-${idx}`} className="pp-page-dots">
                  …
                </span>
              ),
            )}
          </div>

          <AppButton
            type="button"
            className="pp-page-btn"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            ›
          </AppButton>
        </div>
      </div>
    </div>
  )
}

export default ProgramsPersonnel

