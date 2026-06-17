// src/HRIS/shared/HrisPermissionUserAccessCard.jsx

import { useEffect, useId, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import AppButton from '../../shared/AppButton'
import AppDropdown from '../../shared/AppDropdown'
import { useActionCompletedToast } from '../../shared/ActionCompletedToast'
import './HrisPermissionUserAccessCard.css'

const EMPTY_ASSIGNED_USER_IDS = []

const getUserLabel = (userOptions, userId) =>
  userOptions.find((option) => option.value === userId)?.label || userId

function IconRevokeAccess({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M15 9l-6 6M9 9l6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

const PermissionToggle = ({ checked, label, onToggle }) => (
  <div className="hris-perm-access-row">
    <span className="hris-perm-access-label">{label}</span>
    <AppButton
      type="button"
      className={`hris-perm-access-toggle ${checked ? 'hris-perm-access-toggle--on' : ''}`.trim()}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
    >
      <span className="hris-perm-access-toggle-knob" aria-hidden="true" />
    </AppButton>
  </div>
)

const HrisPermissionUserAccessCard = ({
  title,
  toggleLabel,
  enabled,
  onToggle,
  userOptions,
  assignedUserIds: initialAssignedUserIds = EMPTY_ASSIGNED_USER_IDS, // Renamed prop to avoid conflict
  revokeAccessDescription,
  disableWarningDescription,
  actionCompletedMessage = 'Access has been revoked successfully.',
  useCustomActionCompletedModal = true,
  onAssignUser,
  onRemoveUser,
}) => {
  const { showActionCompleted } = useActionCompletedToast()
  const baseId = useId()
  const revokeTitleId = `${baseId}-revoke-title`
  const disableWarningTitleId = `${baseId}-disable-warning-title`
  const actionCompletedTitleId = `${baseId}-action-completed-title`

  // Use prop as initial state — stable reference for empty array
  const [assignedUserIds, setAssignedUserIds] = useState(initialAssignedUserIds)

  // initialAssignedUserIds can arrive after an async fetch resolves, post-mount
  useEffect(() => {
    setAssignedUserIds(initialAssignedUserIds)
  }, [initialAssignedUserIds])
  const [isAddingUsers, setIsAddingUsers] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [userToRevoke, setUserToRevoke] = useState(null)
  const [isDisableWarningOpen, setIsDisableWarningOpen] = useState(false)
  const [isActionCompletedOpen, setIsActionCompletedOpen] = useState(false)

  const disableWarningMessage =
    disableWarningDescription ||
    `Turning off ${title} will remove access for all assigned users. Are you sure you want to continue?`

  useEffect(() => {
    if (!enabled) {
      setAssignedUserIds([])
      setSelectedUserId('')
      setIsAddingUsers(true)
      setUserToRevoke(null)
      setIsDisableWarningOpen(false)
      setIsActionCompletedOpen(false)
    }
  }, [enabled])

  const availableUserOptions = userOptions.filter((option) => !assignedUserIds.includes(option.value))
  const hasAssignedUsers = assignedUserIds.length > 0
  const showAssignFields = isAddingUsers || !hasAssignedUsers

  const closeRevokeAccessModal = () => {
    setUserToRevoke(null)
  }

  const closeActionCompletedModal = () => {
    setIsActionCompletedOpen(false)
  }

  const closeDisableWarningModal = () => {
    setIsDisableWarningOpen(false)
  }

  const handleToggleClick = () => {
    if (enabled && hasAssignedUsers) {
      setIsDisableWarningOpen(true)
      return
    }
    onToggle()
  }

  const handleConfirmDisable = () => {
    flushSync(() => {
      setAssignedUserIds([])
      setSelectedUserId('')
      setIsAddingUsers(true)
      setUserToRevoke(null)
      setIsDisableWarningOpen(false)
      onToggle()
    })
    showActionCompleted()
  }

  const handleAssign = () => {
    if (!selectedUserId) return
    if (assignedUserIds.includes(selectedUserId)) {
      setSelectedUserId('')
      setIsAddingUsers(false)
      return
    }
    // Call the parent callback
    if (onAssignUser) {
      onAssignUser(selectedUserId)
    }
    setAssignedUserIds((prev) => [...prev, selectedUserId])
    setSelectedUserId('')
    setIsAddingUsers(false)
    showActionCompleted()
  }

  const handleConfirmRevokeAccess = () => {
    if (!userToRevoke) return
    const userIdToRevoke = userToRevoke
    flushSync(() => {
      setAssignedUserIds((prev) => {
        const next = prev.filter((id) => id !== userIdToRevoke)
        if (next.length === 0) {
          setIsAddingUsers(true)
        }
        return next
      })
      setUserToRevoke(null)
      // Call the parent callback
      if (onRemoveUser) {
        onRemoveUser(userIdToRevoke)
      }
      if (useCustomActionCompletedModal) {
        setIsActionCompletedOpen(true)
      } else {
        showActionCompleted(actionCompletedMessage)
      }
    })
  }

  useEffect(() => {
    if (!userToRevoke) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeRevokeAccessModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [userToRevoke])

  useEffect(() => {
    if (!isActionCompletedOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeActionCompletedModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActionCompletedOpen])

  useEffect(() => {
    if (!isDisableWarningOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDisableWarningModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDisableWarningOpen])

  return (
    <>
      <section className="hcfg-panel-card hcfg-perm-card hris-perm-access-card">
        <h2 className="hris-perm-access-title">{title}</h2>
        <PermissionToggle checked={enabled} label={toggleLabel} onToggle={handleToggleClick} />
        {enabled && (
          <div className="hris-perm-access-body">
            {hasAssignedUsers && (
              <ul className="hris-perm-access-assigned-list">
                {assignedUserIds.map((userId) => (
                  <li key={userId} className="hris-perm-access-assigned-row">
                    <span className="hris-perm-access-assigned-name">
                      {getUserLabel(userOptions, userId)}
                    </span>
                    <AppButton
                      type="button"
                      className="hris-perm-access-revoke-btn"
                      onClick={() => setUserToRevoke(userId)}
                    >
                      <IconRevokeAccess className="hris-perm-access-revoke-icon" />
                      Revoke access
                    </AppButton>
                  </li>
                ))}
              </ul>
            )}

            {showAssignFields && (
              <div
                className={`hris-perm-access-fields ${hasAssignedUsers ? 'hris-perm-access-fields--below-list' : ''}`.trim()}
              >
                <AppDropdown
                  className="hris-perm-access-user-dropdown"
                  buttonClassName="hris-perm-access-user-dropdown-btn"
                  menuClassName="hris-perm-access-user-dropdown-menu"
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  placeholder="Select users"
                  ariaLabel="Select users"
                  options={availableUserOptions}
                  searchable
                  searchPlaceholder="Search users"
                />
                <AppButton type="button" className="hris-perm-access-assign-btn" onClick={handleAssign}>
                  Assign
                </AppButton>
              </div>
            )}

            {hasAssignedUsers && !isAddingUsers && (
              <AppButton
                type="button"
                className="hris-perm-access-add-users-btn"
                onClick={() => {
                  setSelectedUserId('')
                  setIsAddingUsers(true)
                }}
              >
                Add users
              </AppButton>
            )}
          </div>
        )}
      </section>

      {isDisableWarningOpen && (
        <div className="hris-perm-access-modal-layer" role="presentation">
          <div
            className="hris-perm-access-modal-backdrop app-popup-overlay--enter"
            onClick={closeDisableWarningModal}
            aria-hidden="true"
          />
          <div
            className="hris-perm-access-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={disableWarningTitleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hris-perm-access-modal-header">
              <h2 id={disableWarningTitleId} className="hris-perm-access-modal-title">
                Turn off permission?
              </h2>
              <AppButton
                type="button"
                className="hris-perm-access-modal-close"
                aria-label="Close"
                onClick={closeDisableWarningModal}
              >
                ×
              </AppButton>
            </div>

            <p className="hris-perm-access-modal-message">{disableWarningMessage}</p>

            <div className="hris-perm-access-modal-footer">
              <AppButton type="button" className="hris-perm-access-modal-cancel" onClick={closeDisableWarningModal}>
                Cancel
              </AppButton>
              <AppButton type="button" className="hris-perm-access-modal-confirm" onClick={handleConfirmDisable}>
                Confirm
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {userToRevoke && (
        <div className="hris-perm-access-modal-layer" role="presentation">
          <div
            className="hris-perm-access-modal-backdrop app-popup-overlay--enter"
            onClick={closeRevokeAccessModal}
            aria-hidden="true"
          />
          <div
            className="hris-perm-access-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={revokeTitleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hris-perm-access-modal-header">
              <h2 id={revokeTitleId} className="hris-perm-access-modal-title">
                Revoke access?
              </h2>
              <AppButton
                type="button"
                className="hris-perm-access-modal-close"
                aria-label="Close"
                onClick={closeRevokeAccessModal}
              >
                ×
              </AppButton>
            </div>

            <p className="hris-perm-access-modal-message">
              Are you sure you want to revoke access for{' '}
              <span className="hris-perm-access-modal-message-name">
                {getUserLabel(userOptions, userToRevoke)}
              </span>
              ? {revokeAccessDescription}
            </p>

            <div className="hris-perm-access-modal-footer">
              <AppButton type="button" className="hris-perm-access-modal-cancel" onClick={closeRevokeAccessModal}>
                Cancel
              </AppButton>
              <AppButton type="button" className="hris-perm-access-modal-accept" onClick={handleConfirmRevokeAccess}>
                Accept
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {useCustomActionCompletedModal && isActionCompletedOpen &&
        createPortal(
          <div className="hris-perm-access-action-layer" role="presentation">
            <div
              className="hris-perm-access-modal-backdrop app-popup-overlay--enter"
              onClick={closeActionCompletedModal}
              aria-hidden="true"
            />
            <div
              className="hris-perm-access-modal hris-perm-access-action-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={actionCompletedTitleId}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="hris-perm-access-modal-header">
                <h2 id={actionCompletedTitleId} className="hris-perm-access-modal-title">
                  Action Completed
                </h2>
                <AppButton
                  type="button"
                  className="hris-perm-access-modal-close"
                  aria-label="Close"
                  onClick={closeActionCompletedModal}
                >
                  ×
                </AppButton>
              </div>

              <p className="hris-perm-access-modal-message">{actionCompletedMessage}</p>

              <div className="hris-perm-access-modal-footer">
                <AppButton type="button" className="hris-perm-access-action-ok" onClick={closeActionCompletedModal}>
                  Okay
                </AppButton>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

export default HrisPermissionUserAccessCard