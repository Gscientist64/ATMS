import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import AppButton from '../../../shared/AppButton'
import AppDropdown from '../../../shared/AppDropdown'
import AppTable from '../../../shared/AppTable'
import { useActionCompletedToast } from '../../../shared/ActionCompletedToast'
import {
  getSystemUsers,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  resetUserPassword,
  getPermissionMatrix,
  updatePermissionMatrix,
  getActiveSessions,
  endSession,
  getAllUsersForSystemRole,
} from '../../../services/api'
import './HrisUserManagement.css'

const ACTIONS_MENU_MIN_WIDTH = 200
const ACTIONS_MENU_GAP = 8

const ANU_NAME_OPTIONS = [
  { value: 'joshua-silas', label: 'Joshua Silas' },
  { value: 'james-wakili', label: 'James Wakili' },
  { value: 'rebecca-aluko', label: 'Rebecca Aluko' },
  { value: 'john-adeyemi', label: 'John Adeyemi' },
]

const ANU_HR_ROLE_OPTIONS = [
  { value: 'hr-admin', label: 'HR Admin' },
  { value: 'hr-manager', label: 'HR Manager' },
  { value: 'hr-data-entry', label: 'HR Data Entry' },
  { value: 'viewer', label: 'Viewer' },
]

const ANU_PROGRAMS_ROLE_OPTIONS = [{ value: 'programs', label: 'Programs' }]

const HR_TEAM_ROWS = [
  {
    id: 1,
    name: 'Joshua Silas',
    email: 'jsilas@ecews.org',
    role: 'HR Admin',
    lastActive: '03-04-2026',
    status: 'Active',
  },
  {
    id: 2,
    name: 'James Wakili',
    email: 'jwakili@ecews.org',
    role: 'HR Manager',
    lastActive: '03-04-2026',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Rebecca Aluko',
    email: 'raluko@ecews.org',
    role: 'HR Data Entry',
    lastActive: '03-04-2026',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Rebecca Aluko',
    email: 'raluko@ecews.org',
    role: 'Viewer',
    lastActive: '03-04-2026',
    status: 'Active',
  },
]

const PROGRAMS_TEAM_ROWS = [
  {
    id: 1,
    name: 'Joshua Silas',
    email: 'jsilas@ecews.org',
    role: 'Programs',
    lastActive: '03-04-2026',
    status: 'Active',
  },
  {
    id: 2,
    name: 'James Wakili',
    email: 'jwakili@ecews.org',
    role: 'Programs',
    lastActive: '03-04-2026',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Rebecca Aluko',
    email: 'raluko@ecews.org',
    role: 'Programs',
    lastActive: '03-04-2026',
    status: 'Active',
  },
]

const PM_ROLES = [
  { key: 'hrAdmin', label: 'HR Admin' },
  { key: 'hrManager', label: 'HR Manager' },
  { key: 'hrDataEntry', label: 'HR Data Entry' },
  { key: 'viewer', label: 'Viewer' },
]

const PM_PERMISSIONS = [
  {
    id: 'view-staff',
    label: 'View Staff Profiles',
    category: 'Staff Management',
    roles: { hrAdmin: true, hrManager: true, hrDataEntry: true, viewer: true },
  },
  {
    id: 'edit-staff',
    label: 'Edit Staff Profiles',
    category: 'Staff Management',
    roles: { hrAdmin: true, hrManager: true, hrDataEntry: false, viewer: false },
  },
  {
    id: 'delete-staff',
    label: 'Delete Staff Profiles',
    category: 'Staff Management',
    roles: { hrAdmin: true, hrManager: false, hrDataEntry: false, viewer: false },
  },
  {
    id: 'approve-timesheets',
    label: 'Approve Timesheets',
    category: 'Time & Attendance',
    roles: { hrAdmin: true, hrManager: true, hrDataEntry: true, viewer: false },
  },
  {
    id: 'export-timesheets',
    label: 'Export Timesheets',
    category: 'Time & Attendance',
    roles: { hrAdmin: true, hrManager: false, hrDataEntry: false, viewer: false },
  },
  {
    id: 'approve-leave',
    label: 'Approve Leave Requests',
    category: 'Leave Management',
    roles: { hrAdmin: true, hrManager: true, hrDataEntry: true, viewer: false },
  },
  {
    id: 'manage-pips',
    label: 'Manage PIPs',
    category: 'Performance',
    roles: { hrAdmin: true, hrManager: false, hrDataEntry: false, viewer: false },
  },
  {
    id: 'view-governance',
    label: 'View Governance Flags',
    category: 'Governance',
    roles: { hrAdmin: true, hrManager: true, hrDataEntry: false, viewer: false },
  },
  {
    id: 'resolve-governance',
    label: 'Resolve Governance Flags',
    category: 'Governance',
    roles: { hrAdmin: true, hrManager: false, hrDataEntry: false, viewer: false },
  },
  {
    id: 'access-settings',
    label: 'Access System Settings',
    category: null,
    roles: { hrAdmin: true, hrManager: false, hrDataEntry: false, viewer: false },
  },
]

const ACTIVE_SESSIONS = [
  {
    id: 1,
    userName: 'Mike Tyson',
    browser: 'Chrome on macOS',
    location: 'San Francisco, CA',
    ip: '192.168.1.45',
    lastActive: '9-4-2026, 3:30: PM',
  },
  {
    id: 2,
    userName: 'Mike Tyson',
    browser: 'Chrome on macOS',
    location: 'San Francisco, CA',
    ip: '192.168.1.45',
    lastActive: '9-4-2026, 3:30: PM',
  },
  {
    id: 3,
    userName: 'Mike Tyson',
    browser: 'Chrome on macOS',
    location: 'San Francisco, CA',
    ip: '192.168.1.45',
    lastActive: '9-4-2026, 3:30: PM',
  },
]

const buildInitialMatrix = () =>
  PM_PERMISSIONS.reduce((acc, permission) => {
    acc[permission.id] = { ...permission.roles }
    return acc
  }, {})

function IconResetPassword({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconEditUser({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDeleteUser({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16 17l2 2M18 17l-2 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

const UserRowActionsMenu = ({ isOpen, onToggle, onClose, onResetPassword, onEditUser, onDeleteUser }) => {
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuStyle, setMenuStyle] = useState(null)

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const menuWidth = menuRef.current?.offsetWidth || ACTIONS_MENU_MIN_WIDTH
    let left = rect.right - menuWidth
    const top = rect.bottom + ACTIONS_MENU_GAP

    const viewportPadding = 12
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuWidth - viewportPadding))

    setMenuStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${ACTIONS_MENU_MIN_WIDTH}px`,
      zIndex: 1200,
    })
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setMenuStyle(null)
      return undefined
    }

    updateMenuPosition()
    const frame = requestAnimationFrame(updateMenuPosition)

    const handleReposition = () => updateMenuPosition()
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [isOpen, updateMenuPosition])

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      const target = event.target
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      onClose()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const menu =
    isOpen &&
    menuStyle &&
    createPortal(
      <div
        ref={menuRef}
        className="hum-actions-menu hum-actions-menu--portal"
        role="menu"
        aria-label="Actions"
        style={menuStyle}
      >
        <div className="hum-actions-menu-title">Actions</div>
        <AppButton
          type="button"
          className="hum-actions-menu-item"
          role="menuitem"
          onClick={() => {
            onResetPassword?.()
            onClose()
          }}
        >
          <IconResetPassword className="hum-actions-menu-icon" />
          Reset Password
        </AppButton>
        <AppButton
          type="button"
          className="hum-actions-menu-item"
          role="menuitem"
          onClick={() => {
            onEditUser?.()
            onClose()
          }}
        >
          <IconEditUser className="hum-actions-menu-icon" />
          Edit user
        </AppButton>
        <AppButton
          type="button"
          className="hum-actions-menu-item hum-actions-menu-item--danger"
          role="menuitem"
          onClick={() => {
            onDeleteUser?.()
            onClose()
          }}
        >
          <IconDeleteUser className="hum-actions-menu-icon" />
          Delete user
        </AppButton>
      </div>,
      document.body,
    )

  return (
    <>
      <div className="hum-row-actions-wrap" ref={triggerRef}>
        <AppButton
          type="button"
          className="hum-action-btn"
          aria-label="Row actions"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="3" r="1.2" fill="currentColor" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
            <circle cx="8" cy="13" r="1.2" fill="currentColor" />
          </svg>
        </AppButton>
      </div>
      {menu}
    </>
  )
}

const getRoleOptionsForTeam = (teamType) =>
  teamType === 'programs' ? ANU_PROGRAMS_ROLE_OPTIONS : ANU_HR_ROLE_OPTIONS

const getEditUserSubtitle = (teamType) =>
  teamType === 'programs'
    ? 'Update user access to the Programs command center'
    : 'Update user access to the HR command center'

const buildUserColumns = (sectionKey, openMenuKey, setOpenMenuKey, onResetPassword, onEditUser, onDeleteUser) => [
  { header: 'Name', accessor: 'name', key: 'name' },
  { header: 'Email', accessor: 'email', key: 'email' },
  { header: 'Role', accessor: 'role', key: 'role' },
  { header: 'Last Active', accessor: 'lastActive', key: 'lastActive' },
  {
    header: 'Status',
    key: 'status',
    headerClassName: 'hum-th-status',
    cellClassName: 'hum-td-status',
    render: (row) => <span className="hum-status-pill">{row.status}</span>,
  },
  {
    header: 'Action',
    key: 'action',
    headerClassName: 'hum-th-action',
    cellClassName: 'hum-td-action',
    render: (row) => {
      const menuKey = `${sectionKey}-${row.id}`
      return (
        <UserRowActionsMenu
          isOpen={openMenuKey === menuKey}
          onToggle={() => setOpenMenuKey((current) => (current === menuKey ? null : menuKey))}
          onClose={() => setOpenMenuKey(null)}
          onResetPassword={() => onResetPassword(row)}
          onEditUser={() => onEditUser(row)}
          onDeleteUser={() => onDeleteUser(row)}
        />
      )
    },
  },
]

function IconMonitor({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconEndSession({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const PermissionCheck = ({ checked, permissionLabel, roleLabel, onToggle }) => (
  <AppButton
    type="button"
    className={`hum-pm-check ${checked ? 'hum-pm-check--on' : ''}`.trim()}
    role="checkbox"
    aria-checked={checked}
    aria-label={`${permissionLabel} — ${roleLabel}`}
    onClick={onToggle}
  >
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 6L5 8.5L9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </AppButton>
)

const normalizeRoleKey = (key) => key.charAt(0).toLowerCase() + key.slice(1)

const buildMatrixFromApi = (apiData) => {
  const matrix = buildInitialMatrix()
  if (!apiData) return matrix
  const categories = Array.isArray(apiData)
    ? apiData
    : (apiData.categories || apiData.Categories || [])
  for (const cat of categories) {
    const perms = cat.permissions || cat.Permissions || []
    for (const p of perms) {
      const id = p.id || p.Id
      if (!id || !matrix[id]) continue
      const rawRoles = p.roles || p.Roles || {}
      const normalizedRoles = {}
      for (const [key, val] of Object.entries(rawRoles)) {
        normalizedRoles[normalizeRoleKey(key)] = val
      }
      matrix[id] = { ...matrix[id], ...normalizedRoles }
    }
  }
  return matrix
}

const PermissionMatrixTab = () => {
  const { showActionCompleted } = useActionCompletedToast()
  const [matrix, setMatrix] = useState(() => buildInitialMatrix())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatrix()
  }, [])

  const fetchMatrix = async () => {
    try {
      const res = await getPermissionMatrix()
      setMatrix(buildMatrixFromApi(res))
    } catch (err) {
      console.error('Failed to load permission matrix')
    } finally {
      setLoading(false)
    }
  }

  // Backend stores role keys as PascalCase (e.g. "HrAdmin", "Viewer")
  const toPascalCase = (key) => key.charAt(0).toUpperCase() + key.slice(1)

  const togglePermission = async (permissionId, roleKey) => {
    const newValue = !matrix[permissionId]?.[roleKey]
    const apiRoleKey = toPascalCase(roleKey)
    // Optimistic update
    setMatrix((prev) => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [roleKey]: newValue,
      },
    }))
    showActionCompleted()
    // Persist to API
    try {
      await updatePermissionMatrix([{ permissionId, roles: { [apiRoleKey]: newValue } }])
    } catch (err) {
      // Revert on failure
      setMatrix((prev) => ({
        ...prev,
        [permissionId]: {
          ...prev[permissionId],
          [roleKey]: !newValue,
        },
      }))
      console.error('Failed to update permission matrix')
    }
  }

  return (
    <section className="hum-pm-card">
      <h2 className="hum-pm-title">Permission Matrix</h2>
      <div className="hum-pm-table-wrap">
        <table className="hum-pm-table">
          <thead>
            <tr>
              <th scope="col" className="hum-pm-th-permissions">
                Permissions
              </th>
              {PM_ROLES.map((role) => (
                <th key={role.key} scope="col" className="hum-pm-th-role">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PM_PERMISSIONS.map((permission) => (
              <tr key={permission.id}>
                <th scope="row" className="hum-pm-perm-cell">
                  <span className="hum-pm-perm-label">{permission.label}</span>
                  {permission.category && (
                    <span className="hum-pm-perm-category">{permission.category}</span>
                  )}
                </th>
                {PM_ROLES.map((role) => (
                  <td key={role.key} className="hum-pm-check-cell">
                    <PermissionCheck
                      checked={Boolean(matrix[permission.id]?.[role.key])}
                      permissionLabel={permission.label}
                      roleLabel={role.label}
                      onToggle={() => togglePermission(permission.id, role.key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const EndSessionModal = ({ session, onClose, onConfirm }) => {
  useEffect(() => {
    if (!session) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [session, onClose])

  if (!session) return null

  return (
    <div className="hum-del-layer" role="presentation">
      <div
        className="hum-del-backdrop app-popup-overlay--enter"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="hum-del-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hum-as-end-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hum-del-header">
          <h2 id="hum-as-end-title" className="hum-del-title">
            Log out user?
          </h2>
          <AppButton type="button" className="hum-del-close" aria-label="Close" onClick={onClose}>
            ×
          </AppButton>
        </div>

        <p className="hum-del-message">
          This will end the active session for{' '}
          <span className="hum-del-message-name">{session.userName}</span> and log them out immediately.
          Do you wish to continue?
        </p>

        <div className="hum-del-footer">
          <AppButton type="button" className="hum-del-cancel" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="button" className="hum-del-accept" onClick={onConfirm}>
            Accept
          </AppButton>
        </div>
      </div>
    </div>
  )
}

const ActiveSessionsTab = () => {
  const { showActionCompleted } = useActionCompletedToast()
  const [sessions, setSessions] = useState([])
  const [sessionToEnd, setSessionToEnd] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await getActiveSessions()
      setSessions(Array.isArray(res) ? res : (res?.data || []))
    } catch (err) {
      console.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const closeEndSessionModal = () => {
    setSessionToEnd(null)
  }

  const handleConfirmEndSession = async () => {
    if (!sessionToEnd) return
    try {
      await endSession(sessionToEnd.id)
      setSessions((prev) => prev.filter((s) => s.id !== sessionToEnd.id))
    } catch (err) {
      console.error('Failed to end session')
    }
    setSessionToEnd(null)
    showActionCompleted()
  }

  return (
    <>
      <section className="hum-as-card">
        <h2 className="hum-as-title">Active Sessions</h2>
        {loading && <div className="hum-loading">Loading sessions...</div>}
        {!loading && (
        <ul className="hum-as-list">
          {sessions.length === 0 ? (
            <li className="hum-as-empty">No active sessions</li>
          ) : sessions.map((session) => (
            <li key={session.id} className="hum-as-row">
              <div className="hum-as-row-main">
                <span className="hum-as-device-icon" aria-hidden="true">
                  <IconMonitor className="hum-as-monitor-svg" />
                </span>
                <div className="hum-as-info">
                  <div className="hum-as-row-top">
                    <span className="hum-as-name">{session.userName}</span>
                    <span className="hum-as-time">{session.lastActive}</span>
                  </div>
                  <p className="hum-as-meta">
                    {session.browser} &bull; {session.location} &bull; {session.ip}
                  </p>
                </div>
              </div>
              <AppButton
                type="button"
                className="hum-as-end-btn"
                aria-label={`Log out ${session.userName}`}
                onClick={() => setSessionToEnd(session)}
              >
                <IconEndSession className="hum-as-end-svg" />
              </AppButton>
            </li>
          ))}
        </ul>
        )}
      </section>

      <EndSessionModal
        session={sessionToEnd}
        onClose={closeEndSessionModal}
        onConfirm={handleConfirmEndSession}
      />
    </>
  )
}

const AddUserNameCombobox = ({ value, onChange, options, inputId = 'hum-anu-name' }) => {
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value])

  useEffect(() => {
    setQuery(selected?.label || '')
  }, [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const handleSelect = (option) => {
    onChange(option.value)
    setQuery(option.label)
    setOpen(false)
  }

  return (
    <div className="hum-anu-combobox" ref={rootRef}>
      <div className={`hum-anu-combobox-control ${open ? 'open' : ''}`.trim()}>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          className="hum-anu-combobox-input"
          value={query}
          placeholder="Select or type user's name"
          aria-label="Name"
          aria-expanded={open}
          aria-autocomplete="list"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            if (!event.target.value.trim()) onChange('')
          }}
          onFocus={() => setOpen(true)}
        />
        <AppButton
          type="button"
          className="hum-anu-combobox-toggle"
          aria-label="Toggle name list"
          onClick={() => {
            setOpen((current) => !current)
            inputRef.current?.focus()
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </AppButton>
      </div>
      {open && filtered.length > 0 && (
        <ul className="hum-anu-combobox-menu" role="listbox">
          {filtered.map((option) => (
            <li key={option.value} role="option" aria-selected={value === option.value}>
              <AppButton
                type="button"
                className={`hum-anu-combobox-option ${value === option.value ? 'selected' : ''}`.trim()}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </AppButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const AddNewUserModal = ({ isOpen, onClose, teamType = 'hr', onUserCreated }) => {
  const { showActionCompleted } = useActionCompletedToast()
  const [nameValue, setNameValue] = useState('')
  const [roleValue, setRoleValue] = useState('')
  const [userOptions, setUserOptions] = useState(ANU_NAME_OPTIONS)

  const roleOptions = teamType === 'programs' ? ANU_PROGRAMS_ROLE_OPTIONS : ANU_HR_ROLE_OPTIONS

  useEffect(() => {
    if (!isOpen) {
      setNameValue('')
      setRoleValue('')
      return
    }
    // Fetch real users from API
    getAllUsersForSystemRole()
      .then((users) => {
        const opts = (Array.isArray(users) ? users : []).map((u) => ({
          value: String(u.id),
          label: u.name || u.fullName || u.FullName || u.email || 'Unknown',
        }))
        if (opts.length > 0) setUserOptions(opts)
      })
      .catch(() => { /* fallback to hardcoded options */ })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleInvite = async () => {
    if (!nameValue.trim() || !roleValue) return
    try {
      await createSystemUser({ userId: parseInt(nameValue, 10), role: roleValue })
      onUserCreated?.()
    } catch (err) {
      console.error('Failed to create user')
    }
    onClose()
    showActionCompleted()
  }

  return (
    <div className="hum-anu-overlay" onClick={onClose} role="presentation">
      <div
        className="hum-anu-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hum-anu-title"
      >
        <div className="hum-anu-header">
          <div className="hum-anu-headings">
            <h2 id="hum-anu-title" className="hum-anu-title">
              Add New User
            </h2>
            <p className="hum-anu-subtitle">Grant access to the HR command center</p>
          </div>
          <AppButton type="button" className="hum-anu-close" aria-label="Close" onClick={onClose}>
            ×
          </AppButton>
        </div>

        <div className="hum-anu-body">
          <div className="hum-anu-field">
            <label className="hum-anu-label" htmlFor="hum-anu-name">
              Name
            </label>
            <AddUserNameCombobox value={nameValue} onChange={setNameValue} options={userOptions} />
          </div>

          <div className="hum-anu-field">
            <span className="hum-anu-label">Role</span>
            <AppDropdown
              className="hum-anu-dropdown"
              buttonClassName="hum-anu-dropdown-btn"
              value={roleValue}
              onChange={setRoleValue}
              placeholder="Select"
              ariaLabel="Role"
              options={roleOptions}
            />
          </div>
        </div>

        <div className="hum-anu-footer">
          <AppButton type="button" className="hum-anu-cancel" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="button" className="hum-anu-invite" onClick={handleInvite}>
            Invite
          </AppButton>
        </div>
      </div>
    </div>
  )
}

const EditUserModal = ({ user, onClose, onSave, teamType = 'hr' }) => {
  const [roleValue, setRoleValue] = useState('')
  const roleOptions = getRoleOptionsForTeam(teamType)

  useEffect(() => {
    if (!user) {
      setRoleValue('')
      return
    }
    const roleOption = roleOptions.find((option) => option.label === user.role)
    setRoleValue(roleOption?.value || '')
  }, [user, roleOptions])

  useEffect(() => {
    if (!user) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [user, onClose])

  if (!user) return null

  const handleSave = () => {
    if (!roleValue) return
    const roleOption = roleOptions.find((option) => option.value === roleValue)
    onSave({ role: roleOption?.label || user.role })
  }

  return (
    <div className="hum-anu-overlay" onClick={onClose} role="presentation">
      <div
        className="hum-anu-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hum-eu-title"
      >
        <div className="hum-anu-header">
          <div className="hum-anu-headings">
            <h2 id="hum-eu-title" className="hum-anu-title">
              Edit User
            </h2>
            <p className="hum-anu-subtitle">{getEditUserSubtitle(teamType)}</p>
          </div>
          <AppButton type="button" className="hum-anu-close" aria-label="Close" onClick={onClose}>
            ×
          </AppButton>
        </div>

        <div className="hum-anu-body">
          <div className="hum-anu-field">
            <span className="hum-anu-label">Role</span>
            <AppDropdown
              className="hum-anu-dropdown"
              buttonClassName="hum-anu-dropdown-btn"
              value={roleValue}
              onChange={setRoleValue}
              placeholder="Select"
              ariaLabel="Role"
              options={roleOptions}
            />
          </div>
        </div>

        <div className="hum-anu-footer">
          <AppButton type="button" className="hum-anu-cancel" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="button" className="hum-anu-save" onClick={handleSave}>
            Save changes
          </AppButton>
        </div>
      </div>
    </div>
  )
}

const ResetPasswordModal = ({ user, onClose, onConfirm }) => {
  useEffect(() => {
    if (!user) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [user, onClose])

  if (!user) return null

  return (
    <div className="hum-rp-layer" role="presentation">
      <div
        className="hum-rp-backdrop app-popup-overlay--enter"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="hum-rp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hum-rp-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hum-rp-header">
          <h2 id="hum-rp-title" className="hum-rp-title">
            Reset Password?
          </h2>
          <AppButton type="button" className="hum-rp-close" aria-label="Close" onClick={onClose}>
            ×
          </AppButton>
        </div>

        <p className="hum-rp-message">
          This action will reset the user&apos;s password to the system default.
          <br />
          The user will be required to change their password upon their next login.
          <br />
          Do you wish to continue?
        </p>

        <div className="hum-rp-footer">
          <AppButton type="button" className="hum-rp-submit" onClick={onConfirm}>
            Reset Password
          </AppButton>
        </div>
      </div>
    </div>
  )
}

const DeleteUserModal = ({ user, onClose, onConfirm }) => {
  useEffect(() => {
    if (!user) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [user, onClose])

  if (!user) return null

  return (
    <div className="hum-del-layer" role="presentation">
      <div
        className="hum-del-backdrop app-popup-overlay--enter"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="hum-del-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hum-del-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hum-del-header">
          <h2 id="hum-del-user-title" className="hum-del-title">
            Delete User?
          </h2>
          <AppButton type="button" className="hum-del-close" aria-label="Close" onClick={onClose}>
            ×
          </AppButton>
        </div>

        <p className="hum-del-message">
          Deleting this user will prevent them from accessing the system, and revoke their rights. Do you
          wish to continue?
        </p>

        <div className="hum-del-footer">
          <AppButton type="button" className="hum-del-cancel" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton type="button" className="hum-del-confirm" onClick={onConfirm}>
            Confirm
          </AppButton>
        </div>
      </div>
    </div>
  )
}

const DirectorySection = ({ title, sectionKey, rows, onRefresh }) => {
  const { showActionCompleted } = useActionCompletedToast()
  const [openMenuKey, setOpenMenuKey] = useState(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [tableRows, setTableRows] = useState(rows)
  const [userToResetPassword, setUserToResetPassword] = useState(null)
  const [userToEdit, setUserToEdit] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)

  // Sync tableRows when parent refreshes
  useEffect(() => {
    setTableRows(rows)
  }, [rows])

  const columns = useMemo(
    () =>
      buildUserColumns(
        sectionKey,
        openMenuKey,
        setOpenMenuKey,
        setUserToResetPassword,
        setUserToEdit,
        setUserToDelete,
      ),
    [sectionKey, openMenuKey],
  )

  const closeResetPasswordModal = () => {
    setUserToResetPassword(null)
  }

  const handleConfirmResetPassword = async () => {
    if (!userToResetPassword) return
    try {
      await resetUserPassword(userToResetPassword.id)
    } catch (err) {
      console.error('Failed to reset password')
    }
    setUserToResetPassword(null)
    showActionCompleted()
  }

  const closeEditUserModal = () => {
    setUserToEdit(null)
  }

  const handleSaveEditUser = async (updates) => {
    if (!userToEdit) return
    try {
      await updateSystemUser(userToEdit.id, { role: updates.role, isActive: true })
      setTableRows((prev) =>
        prev.map((row) => (row.id === userToEdit.id ? { ...row, ...updates } : row)),
      )
    } catch (err) {
      console.error('Failed to update user')
    }
    setUserToEdit(null)
    showActionCompleted()
  }

  const closeDeleteUserModal = () => {
    setUserToDelete(null)
  }

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await deleteSystemUser(userToDelete.id)
      setTableRows((prev) => prev.filter((row) => row.id !== userToDelete.id))
    } catch (err) {
      console.error('Failed to delete user')
    }
    setUserToDelete(null)
    showActionCompleted()
  }

  const handleUserCreated = () => {
    onRefresh?.()
  }

  return (
    <section className="hum-directory-card">
      <div className="hum-directory-head">
        <h2 className="hum-directory-title">{title}</h2>
        <AppButton type="button" className="hum-add-users-btn" onClick={() => setIsAddUserOpen(true)}>
          + Add users
        </AppButton>
      </div>
      <AppTable
        columns={columns}
        data={tableRows}
        rowKey="id"
        containerClassName="hum-table-wrap"
        tableClassName="hum-table"
      />
      <AddNewUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        teamType={sectionKey}
        onUserCreated={handleUserCreated}
      />
      <EditUserModal
        user={userToEdit}
        onClose={closeEditUserModal}
        onSave={handleSaveEditUser}
        teamType={sectionKey}
      />
      <ResetPasswordModal
        user={userToResetPassword}
        onClose={closeResetPasswordModal}
        onConfirm={handleConfirmResetPassword}
      />
      <DeleteUserModal
        user={userToDelete}
        onClose={closeDeleteUserModal}
        onConfirm={handleConfirmDeleteUser}
      />
    </section>
  )
}

const HrisUserManagement = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [hrUsers, setHrUsers] = useState([])
  const [programsUsers, setProgramsUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [hrRes, progRes] = await Promise.all([
        getSystemUsers('hr').catch(() => null),
        getSystemUsers('programs').catch(() => null)
      ])
      const mapUser = (u) => ({
        id: u.id,
        name: u.fullName || u.name || u.FullName || 'Unknown',
        email: u.email || u.Email || '',
        role: u.role || u.Role || '',
        lastActive: u.lastActive || u.LastActive || u.updatedAt?.split('T')[0] || '-',
        status: u.isActive || u.IsActive ? 'Active' : 'Inactive',
      })
      setHrUsers(Array.isArray(hrRes) ? hrRes.map(mapUser) : (hrRes?.data || []).map(mapUser))
      setProgramsUsers(Array.isArray(progRes) ? progRes.map(mapUser) : (progRes?.data || []).map(mapUser))
    } catch (err) {
      console.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hum-page">
      <div className="hum-header">
        <h1 className="hum-title">User Management</h1>
        <p className="hum-subtitle">Manage users &amp; roles</p>
      </div>

      <div className="hum-tabs" role="tablist" aria-label="User management sections">
        <AppButton
          type="button"
          className={`hum-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users &amp; Access
        </AppButton>
        <AppButton
          type="button"
          className={`hum-tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          Permission Matrix
        </AppButton>
        <AppButton
          type="button"
          className={`hum-tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Active sessions
        </AppButton>
      </div>

      {activeTab === 'users' && (
        <div className="hum-directories">
          {loading ? <div className="hum-loading">Loading users...</div> : (
            <>
              <DirectorySection title="HR Team Directory" sectionKey="hr" rows={hrUsers} onRefresh={fetchUsers} />
              <DirectorySection title="Programs Team Directory" sectionKey="programs" rows={programsUsers} onRefresh={fetchUsers} />
            </>
          )}
        </div>
      )}

      {activeTab === 'permissions' && <PermissionMatrixTab />}

      {activeTab === 'sessions' && <ActiveSessionsTab />}
    </div>
  )
}

export default HrisUserManagement
