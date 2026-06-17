import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Header.css'
import AppButton from './AppButton'
import ChangePasswordModal from './ChangePasswordModal'
import FeedbackModal from './FeedbackModal'
import { useAuth } from '../contexts/AuthContext'
import { authService, notificationService } from '../services/api'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isChangePasswordClosing, setIsChangePasswordClosing] = useState(false)
  const [isPasswordSuccessOpen, setIsPasswordSuccessOpen] = useState(false)
  const [isPasswordSuccessClosing, setIsPasswordSuccessClosing] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isFeedbackClosing, setIsFeedbackClosing] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)
  const notificationsListRef = useRef(null)
  const quickCreateRef = useRef(null)
  const isNotificationsOpenRef = useRef(false)
  const isHrisRoute = location.pathname.startsWith('/hris')

  // Get user info from auth context
  const getUserInitials = () => {
    if (!user?.fullName) return 'U'
    const names = user.fullName.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const getUserEmail = () => user?.email || authService.getCurrentUser()?.email || 'user@atms.com'
  const getUserName = () => user?.fullName || authService.getCurrentUser()?.fullName || 'User'

  // ---------- Notifications ----------
  const fetchNotifications = async (reset = false) => {
    if (loading) return
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const data = await notificationService.getNotifications(currentPage, 20)
      setNotifications(prev => reset ? data.notifications : [...prev, ...data.notifications])
      setUnreadCount(data.unreadCount)
      setHasMore(data.notifications.length === 20)
      if (!reset) setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount()
      setUnreadCount(data.count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  useEffect(() => {
    fetchNotifications(true)
    const interval = setInterval(() => {
      fetchUnreadCount()
      // Keep the open dropdown's list current too, not just the badge count.
      if (isNotificationsOpenRef.current) fetchNotifications(true)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const toggleNotifications = () => {
    const newState = !isNotificationsOpen
    setIsNotificationsOpen(newState)
    isNotificationsOpenRef.current = newState
    setIsDropdownOpen(false)
    setIsQuickCreateOpen(false)
    if (newState) fetchNotifications(true)
  }

  const handleScroll = (e) => {
    const el = e.target
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50 && hasMore && !loading) {
      fetchNotifications()
    }
  }

  const markAsRead = async (notificationId = null) => {
    try {
      if (notificationId) {
        await notificationService.markAsRead([notificationId])
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
      } else {
        await notificationService.markAsRead([], true)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      }
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) await markAsRead(notification.id)
    if (notification.actionUrl) {
      setIsNotificationsOpen(false)
      isNotificationsOpenRef.current = false
      navigate(notification.actionUrl)
    }
  }

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      fetchUnreadCount()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      await notificationService.deleteAllRead()
      setNotifications(prev => prev.filter(n => !n.isRead))
    } catch (error) {
      console.error('Error deleting read notifications:', error)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      timesheet_approved: '✅',
      timesheet_rejected: '❌',
      timesheet_review: '📋',
      reminder: '⏰',
      comment: '💬',
      contract: '📄',
      concern: '⚠️',
    }
    return icons[type] || '📌'
  }

  const getPriorityClass = (priority) => `notification-priority-${priority?.toLowerCase() || 'medium'}`

  // ---------- HRIS Quick Create Navigator ----------
  const quickCreateItems = [
    { label: 'New Employee', path: '/hris/ancillary-staff/personnel/new', icon: 'employee' },
    { label: 'New Ancillary Staff', path: '/hris/ancillary-staff/personnel/new', icon: 'employee' },
    { label: 'Post Announcement', path: '/hris/announcements/new', icon: 'announcement' },
    { label: 'Work Cycle Scheduler', path: '/hris/workcycles/new', icon: 'cycle' },
  ]

  const handleQuickCreate = (path) => {
    setIsQuickCreateOpen(false)
    navigate(path)
  }

  // ---------- UI Helpers ----------
  const toggleMobileMenu = () => window.dispatchEvent(new Event('openSidebar'))
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
    setIsNotificationsOpen(false)
    setIsQuickCreateOpen(false)
  }
  const toggleQuickCreate = () => {
    setIsQuickCreateOpen(!isQuickCreateOpen)
    setIsDropdownOpen(false)
    setIsNotificationsOpen(false)
  }

  // ---------- Modals ----------
  const openChangePassword = () => {
    setIsChangePasswordOpen(true)
    setIsChangePasswordClosing(false)
    setIsDropdownOpen(false)
  }
  const closeChangePassword = () => {
    setIsChangePasswordClosing(true)
    setTimeout(() => {
      setIsChangePasswordOpen(false)
      setIsChangePasswordClosing(false)
    }, 250)
  }
  const closePasswordSuccess = () => {
    setIsPasswordSuccessClosing(true)
    setTimeout(() => {
      setIsPasswordSuccessOpen(false)
      setIsPasswordSuccessClosing(false)
    }, 250)
  }
  const handleChangePasswordContinue = () => {
    setIsChangePasswordClosing(true)
    setTimeout(() => {
      setIsChangePasswordOpen(false)
      setIsChangePasswordClosing(false)
      setIsPasswordSuccessClosing(false)
      setIsPasswordSuccessOpen(true)
    }, 250)
  }
  const openFeedback = () => {
    setIsFeedbackOpen(true)
    setIsFeedbackClosing(false)
    setIsDropdownOpen(false)
  }
  const closeFeedback = () => {
    setIsFeedbackClosing(true)
    setTimeout(() => {
      setIsFeedbackOpen(false)
      setIsFeedbackClosing(false)
    }, 250)
  }
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false)
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false)
      if (quickCreateRef.current && !quickCreateRef.current.contains(event.target)) setIsQuickCreateOpen(false)
    }
    if (isDropdownOpen || isNotificationsOpen || isQuickCreateOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen, isNotificationsOpen, isQuickCreateOpen])

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {isHrisRoute && (
          <div className="header-hris-tools">
            <AppButton type="button" className="header-hris-switch-btn" onClick={() => navigate('/hris/ecews-dashboard')}>
              Switch to employee view
            </AppButton>

            <div className="header-hris-search-wrap">
              <input type="text" className="header-hris-search" placeholder="Search anything" />
            </div>

            <div className="header-hris-plus-wrap" ref={quickCreateRef}>
              <AppButton type="button" className="header-hris-plus-btn" aria-label="Quick create" onClick={toggleQuickCreate}>
                +
              </AppButton>

              {isQuickCreateOpen && (
                <div className="header-quick-create-dropdown">
                  <div className="header-quick-create-title">Quick Create</div>
                  {quickCreateItems.map((item, idx) => (
                    <AppButton key={idx} type="button" className="header-quick-create-item" onClick={() => handleQuickCreate(item.path)}>
                      <span className="header-quick-create-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          {item.icon === 'employee' && (
                            <>
                              <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M2.5 12C2.5 9.9 4 8.5 6 8.5C8 8.5 9.5 9.9 9.5 12" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M12 3V7M10 5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </>
                          )}
                          {item.icon === 'announcement' && (
                            <path d="M13.5 2.8L7.2 9.1L4.7 8.3L5.9 11.3L8.9 12.5L8.1 10L14.3 3.8C14.8 3.3 14.8 2.4 14.3 1.9C13.8 1.4 13 1.4 12.5 1.9L12 2.4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                          )}
                          {item.icon === 'cycle' && (
                            <>
                              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </>
                          )}
                        </svg>
                      </span>
                      <span>{item.label}</span>
                    </AppButton>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="header-right">
          <div className="notification-wrapper">
            <button className="notification-btn" onClick={toggleNotifications} aria-label="Notifications">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8C6 11.09 4.5 13.5 4.5 13.5H19.5C19.5 13.5 18 11.09 18 8Z" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>

            {isNotificationsOpen && (
              <div className="notifications-dropdown" ref={notificationsRef}>
                <div className="notifications-header">
                  <div className="notifications-title">
                    Notifications
                    {unreadCount > 0 && <span className="notifications-unread-badge">{unreadCount} new</span>}
                  </div>
                  <div className="notifications-actions">
                    {unreadCount > 0 && (
                      <button className="notifications-mark-read" onClick={() => markAsRead()}>
                        Mark all as read
                      </button>
                    )}
                    <button className="notifications-close" onClick={() => setIsNotificationsOpen(false)} aria-label="Close notifications">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="notifications-list" ref={notificationsListRef} onScroll={handleScroll}>
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item ${!n.isRead ? 'unread' : ''} ${getPriorityClass(n.priority)}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notification-icon">{getNotificationIcon(n.type)}</div>
                          <div className="notification-content">
                            <div className="notification-title">{n.title}</div>
                            <div className="notification-message">{n.message}</div>
                            <div className="notification-time">{n.timeAgo}</div>
                          </div>
                          <button className="notification-delete" onClick={(e) => handleDeleteNotification(n.id, e)} aria-label="Delete">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {loading && <div className="notifications-loading">Loading more...</div>}
                      {!hasMore && notifications.length > 0 && <div className="notifications-end">No more notifications</div>}
                    </>
                  ) : (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">🔔</div>
                      <div className="notification-empty-text">No notifications</div>
                    </div>
                  )}
                </div>
                {notifications.some(n => n.isRead) && (
                  <div className="notifications-footer">
                    <button className="notifications-clear-read" onClick={handleDeleteAllRead}>Clear read notifications</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="user-info">
            <div className="user-avatar">{getUserInitials()}</div>
            <div className="user-details">
              <div className="user-name">{getUserName()}</div>
              <div className="user-email">{getUserEmail()}</div>
            </div>
          </div>
          <button className="user-menu-btn" onClick={toggleDropdown} aria-label="User menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="user-dropdown" ref={dropdownRef}>
              <div className="dropdown-title">Menu</div>
              <AppButton type="button" className="dropdown-item" onClick={openChangePassword}>
                <span>Change Password</span>
              </AppButton>
              <AppButton type="button" className="dropdown-item" onClick={openFeedback}>
                <span>Send Feedback</span>
              </AppButton>
              <AppButton type="button" className="dropdown-item logout-item" onClick={handleLogout}>
                <span>Logout</span>
              </AppButton>
            </div>
          )}
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        isClosing={isChangePasswordClosing}
        onClose={closeChangePassword}
        onContinue={handleChangePasswordContinue}
      />

      {isPasswordSuccessOpen && (
        <div className="header-modal-overlay" onClick={closePasswordSuccess}>
          <div className={`header-modal header-password-success-modal ${isPasswordSuccessClosing ? 'header-modal-closing' : 'header-modal-opening'}`} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="header-modal-close header-modal-close-top-right" onClick={closePasswordSuccess}>&times;</button>
            <div className="header-success-icon-wrapper">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="header-success-check">
                <path d="M16 34L27 45L48 20" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="header-success-text">
              <h2 className="header-success-title">Success!</h2>
              <p className="header-success-message">Your password has been changed successfully.</p>
            </div>
            <div className="header-success-footer">
              <AppButton type="button" className="header-modal-btn header-modal-btn-primary" onClick={closePasswordSuccess}>Done</AppButton>
            </div>
          </div>
        </div>
      )}

      <FeedbackModal isOpen={isFeedbackOpen} isClosing={isFeedbackClosing} onClose={closeFeedback} />
    </>
  )
}

export default Header