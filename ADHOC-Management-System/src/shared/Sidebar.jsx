// src/shared/Sidebar.jsx

import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import './Sidebar.css'
import { useAuth } from '../contexts/AuthContext'

const employeeItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    end: true,
    renderIcon: () => (
      <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="12" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="2" y="12" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="12" y="12" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'timesheet',
    label: 'Timesheet',
    to: '/timesheet',
    renderIcon: () => (
      <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.5" />
        <line x1="13" y1="2" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    to: '/profile',
    renderIcon: () => (
      <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M4 18C4 14 6.5 11 10 11C13.5 11 16 14 16 18" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
]

// GON Supervisor items - COMPLETELY COMMENTED OUT (not used)
const gonItems = [
  {
    key: 'gon-dashboard',
    label: 'Facility Supervisor',
    to: '/gon-supervisor',
    end: true,
    renderIcon: employeeItems[0].renderIcon,
  },
  {
    key: 'gon-timesheet-review',
    label: 'Timesheet Review',
    to: '/gon-supervisor/timesheet-review',
    renderIcon: employeeItems[1].renderIcon,
  },
  {
    key: 'gon-supervisees',
    label: 'Supervisees',
    to: '/gon-supervisor/supervisees',
    renderIcon: employeeItems[2].renderIcon,
  },
]

// ECEWS Supervisor items
const ecewsItems = [
  {
    key: 'ecews-dashboard',
    label: 'Dashboard',
    to: '/ecews-supervisor',
    end: true,
    renderIcon: employeeItems[0].renderIcon,
  },
  {
    key: 'ecews-timesheet-review',
    label: 'Timesheet Review',
    to: '/ecews-supervisor/timesheet-review',
    renderIcon: employeeItems[1].renderIcon,
  },
  {
    key: 'ecews-supervisees',
    label: 'Supervisees',
    to: '/ecews-supervisor/supervisees',
    renderIcon: employeeItems[2].renderIcon,
  },
]

// Programs items (with dynamic label for Personnel → Staff)
const programsItems = [
  {
    key: 'programs-dashboard',
    label: 'Dashboard',
    to: '/programs',
    end: true,
    renderIcon: employeeItems[0].renderIcon,
  },
  {
    key: 'programs-timesheet-review',
    label: 'Timesheet Review',
    to: '/programs/timesheet-review',
    renderIcon: employeeItems[1].renderIcon,
  },
  {
    key: 'programs-personnel',
    getLabel: (pathname) => (pathname.startsWith('/programs/staff') ? 'Staff' : 'Personnel'),
    to: '/programs/personnel',
    isActive: (pathname) => pathname.startsWith('/programs/personnel') || pathname.startsWith('/programs/staff'),
    renderIcon: employeeItems[2].renderIcon,
  },
  {
    key: 'programs-governance',
    label: 'Governance',
    to: '/programs/governance',
    renderIcon: () => (
      <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 4H16V16H4V4Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M7 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 8L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 12L17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'programs-pip-management',
    label: 'PIP Management',
    to: '/programs/pip-management',
    renderIcon: employeeItems[2].renderIcon,
  },
]

// HRIS items (collapsible group, different footer)
const hrisDashboardPaths = ['/hris', '/hris/dashboard', '/hris/ecews-dashboard', '/hris/ancillary-staff', '/hris/system-settings']

const hrisItems = [
  {
    key: 'hris-dashboard',
    label: 'Dashboard',
    to: '/hris/dashboard',
    end: true,
    isActive: (pathname) => pathname === '/hris/dashboard' || pathname === '/hris',
    renderIcon: employeeItems[0].renderIcon,
  },
 // {
 //   key: 'hris-ecews-staff',
 //   label: 'ECEWS Staff',
 //   to: '/hris/ecews-dashboard',
 //   renderIcon: employeeItems[2].renderIcon,
 // },
  {
    type: 'group',
    key: 'hris-ancillary-group',
    label: 'Ancillary Staff',
    to: '#',  // Changed from '/hris/ancillary-staff' to '#' so it doesn't navigate
    renderIcon: employeeItems[2].renderIcon,
    isActive: (pathname) => pathname.startsWith('/hris/ancillary-staff'),
    children: [
      {
        key: 'hris-ancillary-personnel',
        label: 'Personnel',
        to: '/hris/ancillary-staff/personnel',
        isActive: (pathname) =>
          pathname === '/hris/ancillary-staff/personnel' || pathname.startsWith('/hris/ancillary-staff/personnel/'),
      },
      {
        key: 'hris-ancillary-governance',
        label: 'Governance',
        to: '/hris/ancillary-staff/governance',
        isActive: (pathname) =>
          pathname === '/hris/ancillary-staff/governance' || pathname.startsWith('/hris/ancillary-staff/governance/'),
      },
    ],
  },
  {
    type: 'group',
    key: 'hris-system-settings-group',
    label: 'System Settings',
    to: '#',
    renderIcon: employeeItems[1].renderIcon,
    isActive: (pathname) => pathname.startsWith('/hris/system-settings'),
    children: [
        {
            key: 'hris-user-management',
            label: 'User Management',
            to: '/hris/system-settings/user-management',
            isActive: (pathname) => pathname === '/hris/system-settings/user-management',
        },
        {
            key: 'hris-configurations',
            label: 'Configurations',
            to: '/hris/system-settings/configurations',
            isActive: (pathname) => pathname === '/hris/system-settings/configurations',
        },
    ],
},
]

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const [navGroupOpen, setNavGroupOpen] = useState(() => ({
    'hris-ancillary-group': typeof window !== 'undefined' && window.location.pathname.startsWith('/hris/ancillary-staff'),
    'hris-system-settings-group': typeof window !== 'undefined' && window.location.pathname.startsWith('/hris/system-settings'),
}))
  const prevAncillaryPathRef = useRef(location.pathname.startsWith('/hris/ancillary-staff'))

  // Auto‑open Ancillary group when inside its routes
  useEffect(() => {
    const onAncillary = location.pathname.startsWith('/hris/ancillary-staff')
    const onPersonnel = location.pathname.startsWith('/hris/ancillary-staff/personnel')
    const onGovernance = location.pathname.startsWith('/hris/ancillary-staff/governance')
    const wasAncillary = prevAncillaryPathRef.current

    setNavGroupOpen((s) => {
      if (!onAncillary) {
        return { ...s, 'hris-ancillary-group': false }
      }
      if (onPersonnel || onGovernance) {
        return { ...s, 'hris-ancillary-group': true }
      }
      if (!wasAncillary && onAncillary) {
        return { ...s, 'hris-ancillary-group': true }
      }
      return s
    })

    prevAncillaryPathRef.current = onAncillary
  }, [location.pathname])

  const prevSystemSettingsPathRef = useRef(location.pathname.startsWith('/hris/system-settings'))
  // Responsive menu handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const onSystemSettings = location.pathname.startsWith('/hris/system-settings')
    const onUserManagement = location.pathname.startsWith('/hris/system-settings/user-management')
    const onConfigurations = location.pathname.startsWith('/hris/system-settings/configurations')
    const wasSystemSettings = prevSystemSettingsPathRef.current

    setNavGroupOpen((s) => {
        if (!onSystemSettings) {
            return { ...s, 'hris-system-settings-group': false }
        }
        if (onUserManagement || onConfigurations) {
            return { ...s, 'hris-system-settings-group': true }
        }
        if (!wasSystemSettings && onSystemSettings) {
            return { ...s, 'hris-system-settings-group': true }
        }
        return s
    })

    prevSystemSettingsPathRef.current = onSystemSettings
}, [location.pathname])

  useEffect(() => {
    const handleOpenSidebar = () => setIsMobileMenuOpen(true)
    if (typeof window !== 'undefined') {
      window.addEventListener('openSidebar', handleOpenSidebar)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('openSidebar', handleOpenSidebar)
      }
    }
  }, [])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Decide which menu items to show based on current route AND user role
  const getMenuItems = () => {
    const path = location.pathname
    const role = user?.role
    if (role === 'Programs') return programsItems
    if (role === 'EcewsSupervisor') return ecewsItems
    if (role === 'GonSupervisor') return gonItems
    if (path.startsWith('/hris')) {
      return hrisItems
    }
    return employeeItems
  }

  const items = getMenuItems()
  const isHrisRoute = location.pathname.startsWith('/hris')

  return (
    <>
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-container">
            <div className="logo-icon">
              <img src="/ecews-logo.png" alt="ECEWS Logo" />
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) =>
            item.type === 'group' ? (
              <div key={item.key} className="nav-group">
                <div
                  className={`nav-group-row ${
                    item.isActive && item.isActive(location.pathname) ? 'nav-group-row--active' : ''
                  }`}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive: navActive }) => {
                      const active = item.isActive ? item.isActive(location.pathname) : navActive
                      return `nav-item nav-group-parent ${active ? 'active' : ''}`
                    }}
                    onClick={closeMobileMenu}
                  >
                    {item.renderIcon()}
                    <span className="nav-group-label">{item.label}</span>
                  </NavLink>
                  <button
                    type="button"
                    className={`nav-group-toggle ${navGroupOpen[item.key] ? 'open' : ''}`}
                    aria-expanded={Boolean(navGroupOpen[item.key])}
                    aria-controls={`submenu-${item.key}`}
                    onClick={(e) => {
                      e.preventDefault()
                      setNavGroupOpen((s) => ({ ...s, [item.key]: !s[item.key] }))
                    }}
                  >
                    <svg className="nav-group-chevron" width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {navGroupOpen[item.key] && (
                  <div className="nav-submenu" role="group" aria-label={`${item.label} submenu`}>
                    {item.children.map((child) => {
                      const subActive = child.isActive ? child.isActive(location.pathname) : location.pathname === child.to
                      return (
                        <Link
                          key={child.key}
                          to={child.to}
                          className={`nav-item nav-subitem ${subActive ? 'active' : ''}`}
                          onClick={closeMobileMenu}
                        >
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                className={({ isActive: navActive }) => {
                  const active = item.isActive ? item.isActive(location.pathname) : navActive
                  return `nav-item ${active ? 'active' : ''}`
                }}
                onClick={closeMobileMenu}
              >
                {item.renderIcon()}
                <span>{item.getLabel ? item.getLabel(location.pathname) : item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          {isHrisRoute ? (
            <a href="#logout" className="hr-policy-link hris-logout-link">
              <svg className="hr-policy-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8 4H5C4.44772 4 4 4.44772 4 5V15C4 15.5523 4.44772 16 5 16H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 7L15 10L12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>Logout</span>
            </a>
          ) : (
            <a href="#hr-policy" className="hr-policy-link">
              <svg className="hr-policy-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>HR Policy</span>
              <svg className="hr-policy-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </aside>

      <div
        className="mobile-overlay"
        onClick={closeMobileMenu}
        aria-label="Close menu"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            closeMobileMenu()
          }
        }}
        style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
      />
    </>
  )
}

export default Sidebar