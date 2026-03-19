import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const employeeItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    end: true,
    renderIcon: () => (
      <svg
        className="nav-icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
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
      <svg
        className="nav-icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <rect
          x="3"
          y="4"
          width="14"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <line
          x1="7"
          y1="2"
          x2="7"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="13"
          y1="2"
          x2="13"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="3"
          y1="8"
          x2="17"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    to: '/profile',
    renderIcon: () => (
      <svg
        className="nav-icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <circle
          cx="10"
          cy="7"
          r="3"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M4 18C4 14 6.5 11 10 11C13.5 11 16 14 16 18"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    ),
  },
]

const gonItems = [
  {
    key: 'gon-dashboard',
    label: 'Dashboard',
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
    isActive: (pathname) =>
      pathname.startsWith('/programs/personnel') || pathname.startsWith('/programs/staff'),
    renderIcon: employeeItems[2].renderIcon,
  },
  {
    key: 'programs-governance',
    label: 'Governance',
    to: '/programs/governance',
    renderIcon: employeeItems[2].renderIcon,
  },
]

const Sidebar = ({ items }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

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
    const handleOpenSidebar = () => {
      setIsMobileMenuOpen(true)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('openSidebar', handleOpenSidebar)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('openSidebar', handleOpenSidebar)
      }
    }
  }, [])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const resolvedItems =
    items ||
    (location.pathname.startsWith('/ecews-supervisor')
      ? ecewsItems
      : location.pathname.startsWith('/programs')
      ? programsItems
      : location.pathname.startsWith('/gon-supervisor')
      ? gonItems
      : employeeItems)

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
          {resolvedItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) => {
                const forcedActive = item.isActive ? item.isActive(location.pathname) : false
                return `nav-item ${isActive || forcedActive ? 'active' : ''}`
              }}
              onClick={closeMobileMenu}
            >
              {item.renderIcon()}
              <span>{item.getLabel ? item.getLabel(location.pathname) : item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="#hr-policy" className="hr-policy-link">
            <svg
              className="hr-policy-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <rect
                x="2"
                y="2"
                width="16"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <line
                x1="6"
                y1="6"
                x2="14"
                y2="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="6"
                y1="10"
                x2="14"
                y2="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="6"
                y1="14"
                x2="10"
                y2="14"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span>HR Policy</span>
            <svg
              className="hr-policy-arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
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
      ></div>
    </>
  )
}

export default Sidebar

