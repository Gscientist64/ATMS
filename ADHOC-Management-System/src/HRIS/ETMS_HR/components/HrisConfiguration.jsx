import { useCallback, useEffect, useRef, useState } from 'react'
import AppButton from '../../../shared/AppButton'
import { useActionCompletedToast } from '../../../shared/ActionCompletedToast'
import HrisPermissionUserAccessCard from '../../shared/HrisPermissionUserAccessCard'
import { configurationService, getAllEmployees } from '../../../services/api'
import './HrisConfiguration.css'

const EMPTY_ARRAY = []

function IconEdit({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function IconDelete({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

const ProjectsTab = ({ projects, onAddNew, onEdit, onDelete }) => (
  <section className="hcfg-panel-card">
    <div className="hcfg-panel-head">
      <h2 className="hcfg-panel-title">Projects</h2>
      <AppButton type="button" className="hcfg-new-btn" onClick={onAddNew}>
        <span className="hcfg-new-btn-icon" aria-hidden="true">
          +
        </span>
        New project
      </AppButton>
    </div>
    <div className="hcfg-table-wrap">
      <table className="hcfg-table">
        <thead>
          <tr>
            <th scope="col" className="hcfg-th-name">
              Department Name
            </th>
            <th scope="col" className="hcfg-th-action">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="hcfg-td-name">{project.name}</td>
              <td className="hcfg-td-action">
                <div className="hcfg-row-actions">
                  <AppButton
                    type="button"
                    className="hcfg-icon-btn hcfg-icon-btn--edit"
                    aria-label={`Edit ${project.name}`}
                    onClick={() => onEdit(project)}
                  >
                    <IconEdit />
                  </AppButton>
                  <AppButton
                    type="button"
                    className="hcfg-icon-btn hcfg-icon-btn--delete"
                    aria-label={`Delete ${project.name}`}
                    onClick={() => onDelete(project)}
                  >
                    <IconDelete />
                  </AppButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const PermissionsTab = ({
  permissions,
  onToggle,
  userOptions,
  editStaffDetailsAssignedUserIds,
  onAssignEditStaffDetailsUser,
  onRemoveEditStaffDetailsUser,
}) => (
  <div className="hcfg-perm-list">
    <HrisPermissionUserAccessCard
      title="Contract Letter Settings"
      toggleLabel="Enable the Programs team to generate and issue contract letters"
      enabled={permissions.contractLetters}
      onToggle={() => onToggle('contractLetters')}
      userOptions={userOptions}
      revokeAccessDescription="This user will no longer be able to generate or issue contract letters."
    />
    <HrisPermissionUserAccessCard
      title="User Permissions"
      toggleLabel="Enable the Programs team to add new programs admins"
      enabled={permissions.userPermissions}
      onToggle={() => onToggle('userPermissions')}
      userOptions={userOptions}
      revokeAccessDescription="This user will no longer be able to add new programs admins."
    />
    <HrisPermissionUserAccessCard
      title="Onboarding Permissions"
      toggleLabel="Enable the Programs team to onboard ancillary staff"
      enabled={permissions.onboarding}
      onToggle={() => onToggle('onboarding')}
      userOptions={userOptions}
      revokeAccessDescription="This user will no longer be able to onboard ancillary staff."
    />
    <HrisPermissionUserAccessCard
      title="Edit Staff Details Permissions"
      toggleLabel="Enable the Programs team to edit staff details"
      enabled={permissions.editStaffDetails}
      onToggle={() => onToggle('editStaffDetails')}
      userOptions={userOptions}
      assignedUserIds={editStaffDetailsAssignedUserIds}
      onAssignUser={onAssignEditStaffDetailsUser}
      onRemoveUser={onRemoveEditStaffDetailsUser}
      revokeAccessDescription="This user will no longer be able to edit staff details."
    />
  </div>
)

const DepartmentsTab = ({ departments, onAddNew, onEdit, onDelete }) => (
  <section className="hcfg-panel-card">
    <div className="hcfg-panel-head">
      <h2 className="hcfg-panel-title">Departments</h2>
      <AppButton type="button" className="hcfg-new-btn" onClick={onAddNew}>
        <span className="hcfg-new-btn-icon" aria-hidden="true">
          +
        </span>
        New depatrment
      </AppButton>
    </div>
    <div className="hcfg-table-wrap">
      <table className="hcfg-table">
        <thead>
          <tr>
            <th scope="col" className="hcfg-th-name">
              Department Name
            </th>
            <th scope="col" className="hcfg-th-action">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr key={department.id}>
              <td className="hcfg-td-name">{department.name}</td>
              <td className="hcfg-td-action">
                <div className="hcfg-row-actions">
                  <AppButton
                    type="button"
                    className="hcfg-icon-btn hcfg-icon-btn--edit"
                    aria-label={`Edit ${department.name}`}
                    onClick={() => onEdit(department)}
                  >
                    <IconEdit />
                  </AppButton>
                  <AppButton
                    type="button"
                    className="hcfg-icon-btn hcfg-icon-btn--delete"
                    aria-label={`Delete ${department.name}`}
                    onClick={() => onDelete(department)}
                  >
                    <IconDelete />
                  </AppButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const HrisConfiguration = () => {
  const { showActionCompleted } = useActionCompletedToast()
  const [activeTab, setActiveTab] = useState('departments')
  const [departments, setDepartments] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [userOptions, setUserOptions] = useState(EMPTY_ARRAY)
  const [nextId, setNextId] = useState(100)
  const [nextProjectId, setNextProjectId] = useState(100)

  useEffect(() => {
    fetchConfigData()
  }, [])

  const fetchConfigData = async () => {
    try {
      const [deptRes, projRes, permRes, usersRes, editStaffDetailsUsersRes] = await Promise.all([
        configurationService.getDepartments().catch(() => []),
        configurationService.getProjects().catch(() => []),
        configurationService.getPermissionSettings().catch(() => null),
        getAllEmployees().catch(() => []),
        configurationService.getUsersByPermission('editStaffDetails').catch(() => []),
      ])
      const users = Array.isArray(usersRes) ? usersRes : (usersRes?.data || [])
      setUserOptions(
        users.map((u) => ({ value: String(u.id), label: u.name || u.Name || u.email || u.Email || 'Unknown' })),
      )
      const depts = Array.isArray(deptRes) ? deptRes : (deptRes?.data || [])
      const projs = Array.isArray(projRes) ? projRes : (projRes?.data || [])
      setDepartments(depts)
      setProjects(projs)
      setNextId(depts.length + 100)
      setNextProjectId(projs.length + 100)
      if (permRes) {
        const s = permRes.data || permRes
        setPermissions({
          contractLetters: s.contractLetters || false,
          userPermissions: s.userPermissions || false,
          onboarding: s.onboarding || false,
          editStaffDetails: s.editStaffDetails || false,
        })
      }
      const editStaffDetailsUsers = Array.isArray(editStaffDetailsUsersRes)
        ? editStaffDetailsUsersRes
        : (editStaffDetailsUsersRes?.data || [])
      setEditStaffDetailsAssignedUserIds(
        editStaffDetailsUsers.map((a) => String(a.userId || a.UserId)),
      )
    } catch (err) {
      console.error('Failed to load config')
    } finally {
      setLoading(false)
    }
  }
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isProjectModalExiting, setIsProjectModalExiting] = useState(false)
  const [projectFormName, setProjectFormName] = useState('')
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
  const [isDepartmentModalExiting, setIsDepartmentModalExiting] = useState(false)
  const [departmentFormName, setDepartmentFormName] = useState('')
  const [editingDepartmentId, setEditingDepartmentId] = useState(null)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [permissions, setPermissions] = useState({
    contractLetters: false,
    userPermissions: false,
    onboarding: false,
    editStaffDetails: false,
  })
  const [editStaffDetailsAssignedUserIds, setEditStaffDetailsAssignedUserIds] = useState(EMPTY_ARRAY)
  const hasFinalizedRef = useRef(false)
  const projectFinalizedRef = useRef(false)

  const isProjectModalVisible = isProjectModalOpen || isProjectModalExiting
  const isDepartmentModalVisible = isDepartmentModalOpen || isDepartmentModalExiting
  const isEditingDepartment = editingDepartmentId != null
  const isEditingProject = editingProjectId != null
  const departmentModalTitle = isEditingDepartment ? 'Edit Department' : 'New Department'
  const projectModalTitle = isEditingProject ? 'Edit Project' : 'New Project'

  const openNewProjectModal = () => {
    setEditingProjectId(null)
    setProjectFormName('')
    setIsProjectModalExiting(false)
    projectFinalizedRef.current = false
    setIsProjectModalOpen(true)
  }

  const openEditProjectModal = (project) => {
    setEditingProjectId(project.id)
    setProjectFormName(project.name)
    setIsProjectModalExiting(false)
    projectFinalizedRef.current = false
    setIsProjectModalOpen(true)
  }

  const beginCloseProjectModal = useCallback(() => {
    setIsProjectModalExiting((exiting) => (exiting ? exiting : true))
  }, [])

  const finalizeCloseProjectModal = useCallback(() => {
    if (projectFinalizedRef.current) return
    projectFinalizedRef.current = true
    setIsProjectModalExiting(false)
    setProjectFormName('')
    setEditingProjectId(null)
    setIsProjectModalOpen(false)
  }, [])

  const handleProjectModalAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return
    if (event.animationName === 'appPopupSlideOutToBottom') {
      finalizeCloseProjectModal()
    }
  }

  useEffect(() => {
    if (!isProjectModalExiting) return undefined
    const timeoutId = window.setTimeout(finalizeCloseProjectModal, 480)
    return () => window.clearTimeout(timeoutId)
  }, [isProjectModalExiting, finalizeCloseProjectModal])

  useEffect(() => {
    if (!isProjectModalVisible) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') beginCloseProjectModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isProjectModalVisible, beginCloseProjectModal])

  const handleSaveProject = async () => {
    const trimmed = projectFormName.trim()
    if (trimmed) {
      try {
        if (editingProjectId != null) {
          await configurationService.updateProject(editingProjectId, { name: trimmed })
          setProjects((prev) =>
            prev.map((p) => (p.id === editingProjectId ? { ...p, name: trimmed } : p)),
          )
        } else {
          const result = await configurationService.createProject({ name: trimmed })
          const newProj = result.data || result
          setProjects((prev) => [...prev, { id: newProj.id || nextProjectId, name: trimmed }])
          setNextProjectId((id) => id + 1)
        }
      } catch (err) {
        console.error('Failed to save project')
      }
    }
    beginCloseProjectModal()
    showActionCompleted()
  }

  const openNewDepartmentModal = () => {
    setEditingDepartmentId(null)
    setDepartmentFormName('')
    setIsDepartmentModalExiting(false)
    hasFinalizedRef.current = false
    setIsDepartmentModalOpen(true)
  }

  const openEditDepartmentModal = (department) => {
    setEditingDepartmentId(department.id)
    setDepartmentFormName(department.name)
    setIsDepartmentModalExiting(false)
    hasFinalizedRef.current = false
    setIsDepartmentModalOpen(true)
  }

  const beginCloseDepartmentModal = useCallback(() => {
    setIsDepartmentModalExiting((exiting) => (exiting ? exiting : true))
  }, [])

  const finalizeCloseDepartmentModal = useCallback(() => {
    if (hasFinalizedRef.current) return
    hasFinalizedRef.current = true
    setIsDepartmentModalExiting(false)
    setDepartmentFormName('')
    setEditingDepartmentId(null)
    setIsDepartmentModalOpen(false)
  }, [])

  const handleDepartmentModalAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return
    if (event.animationName === 'appPopupSlideOutToBottom') {
      finalizeCloseDepartmentModal()
    }
  }

  useEffect(() => {
    if (!isDepartmentModalExiting) return undefined
    const timeoutId = window.setTimeout(finalizeCloseDepartmentModal, 480)
    return () => window.clearTimeout(timeoutId)
  }, [isDepartmentModalExiting, finalizeCloseDepartmentModal])

  useEffect(() => {
    if (!isDepartmentModalVisible) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') beginCloseDepartmentModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDepartmentModalVisible, beginCloseDepartmentModal])

  const openDeleteDepartmentModal = (department) => {
    setDepartmentToDelete(department)
  }

  const closeDeleteDepartmentModal = () => {
    setDepartmentToDelete(null)
  }

  const handleConfirmDeleteDepartment = async () => {
    if (!departmentToDelete) return
    try {
      await configurationService.deleteDepartment(departmentToDelete.id)
      setDepartments((prev) => prev.filter((item) => item.id !== departmentToDelete.id))
    } catch (err) {
      console.error('Failed to delete department')
    }
    setDepartmentToDelete(null)
    showActionCompleted()
  }

  useEffect(() => {
    if (!departmentToDelete) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDeleteDepartmentModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [departmentToDelete])

  const openDeleteProjectModal = (project) => {
    setProjectToDelete(project)
  }

  const closeDeleteProjectModal = () => {
    setProjectToDelete(null)
  }

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return
    try {
      await configurationService.deleteProject(projectToDelete.id)
      setProjects((prev) => prev.filter((item) => item.id !== projectToDelete.id))
    } catch (err) {
      console.error('Failed to delete project')
    }
    setProjectToDelete(null)
    showActionCompleted()
  }

  useEffect(() => {
    if (!projectToDelete) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDeleteProjectModal()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [projectToDelete])

  const handleSaveDepartment = async () => {
    const trimmed = departmentFormName.trim()
    if (trimmed) {
      try {
        if (isEditingDepartment) {
          await configurationService.updateDepartment(editingDepartmentId, { name: trimmed })
          setDepartments((prev) =>
            prev.map((item) => (item.id === editingDepartmentId ? { ...item, name: trimmed } : item)),
          )
        } else {
          const result = await configurationService.createDepartment({ name: trimmed })
          const newDept = result.data || result
          setDepartments((prev) => [...prev, { id: newDept.id || nextId, name: trimmed }])
          setNextId((id) => id + 1)
        }
      } catch (err) {
        console.error('Failed to save department')
      }
    }
    beginCloseDepartmentModal()
    showActionCompleted()
  }

  const handlePermissionToggle = async (key) => {
    const newValue = !permissions[key]
    setPermissions((prev) => ({ ...prev, [key]: newValue }))
    try {
      const payload = {}
      payload[key.charAt(0).toUpperCase() + key.slice(1)] = newValue
      await configurationService.updatePermissionSettings(payload)
    } catch (err) {
      // Revert on failure
      setPermissions((prev) => ({ ...prev, [key]: !prev[key] }))
      console.error('Failed to update permission setting')
    }
    if (key === 'editStaffDetails' && !newValue) {
      setEditStaffDetailsAssignedUserIds(EMPTY_ARRAY)
    }
  }

  const handleAssignEditStaffDetailsUser = async (userId) => {
    try {
      await configurationService.assignUserToPermission('editStaffDetails', parseInt(userId, 10))
    } catch (err) {
      console.error('Failed to assign user to editStaffDetails permission')
    }
  }

  const handleRemoveEditStaffDetailsUser = async (userId) => {
    try {
      await configurationService.removeUserFromPermission('editStaffDetails', parseInt(userId, 10))
    } catch (err) {
      console.error('Failed to remove user from editStaffDetails permission')
    }
  }

  return (
    <div className="hcfg-page">
      <div className="hcfg-header">
        <h1 className="hcfg-title">Configuration</h1>
        <p className="hcfg-subtitle">Manage system wide settings</p>
      </div>

      <div className="hcfg-tabs" role="tablist" aria-label="Configuration sections">
        <AppButton
          type="button"
          className={`hcfg-tab ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </AppButton>
        <AppButton
          type="button"
          className={`hcfg-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </AppButton>
        <AppButton
          type="button"
          className={`hcfg-tab ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          Permissions
        </AppButton>
      </div>

      {activeTab === 'departments' && (
        <DepartmentsTab
          departments={departments}
          onAddNew={openNewDepartmentModal}
          onEdit={openEditDepartmentModal}
          onDelete={openDeleteDepartmentModal}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab
          projects={projects}
          onAddNew={openNewProjectModal}
          onEdit={openEditProjectModal}
          onDelete={openDeleteProjectModal}
        />
      )}

      {activeTab === 'permissions' && (
        <PermissionsTab
          permissions={permissions}
          onToggle={(key) => handlePermissionToggle(key)}
          userOptions={userOptions}
          editStaffDetailsAssignedUserIds={editStaffDetailsAssignedUserIds}
          onAssignEditStaffDetailsUser={handleAssignEditStaffDetailsUser}
          onRemoveEditStaffDetailsUser={handleRemoveEditStaffDetailsUser}
        />
      )}

      {projectToDelete && (
        <div className="hcfg-del-layer" role="presentation">
          <div
            className="hcfg-del-backdrop app-popup-overlay--enter"
            onClick={closeDeleteProjectModal}
            aria-hidden="true"
          />
          <div
            className="hcfg-del-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hcfg-del-project-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hcfg-del-header">
              <h2 id="hcfg-del-project-title" className="hcfg-del-title">
                Delete Project?
              </h2>
              <AppButton
                type="button"
                className="hcfg-del-close"
                aria-label="Close"
                onClick={closeDeleteProjectModal}
              >
                ×
              </AppButton>
            </div>

            <p className="hcfg-del-message">
              Are you sure you want to delete{' '}
              <span className="hcfg-del-message-name">{projectToDelete.name}</span>? This action cannot be
              undone. All associated data and assignments will be permanently removed.
            </p>

            <div className="hcfg-del-footer">
              <AppButton type="button" className="hcfg-del-cancel" onClick={closeDeleteProjectModal}>
                Cancel
              </AppButton>
              <AppButton type="button" className="hcfg-del-accept" onClick={handleConfirmDeleteProject}>
                Accept
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {departmentToDelete && (
        <div className="hcfg-del-layer" role="presentation">
          <div
            className="hcfg-del-backdrop app-popup-overlay--enter"
            onClick={closeDeleteDepartmentModal}
            aria-hidden="true"
          />
          <div
            className="hcfg-del-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hcfg-del-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hcfg-del-header">
              <h2 id="hcfg-del-title" className="hcfg-del-title">
                Delete Department?
              </h2>
              <AppButton
                type="button"
                className="hcfg-del-close"
                aria-label="Close"
                onClick={closeDeleteDepartmentModal}
              >
                ×
              </AppButton>
            </div>

            <p className="hcfg-del-message">
              Are you sure you want to delete{' '}
              <span className="hcfg-del-message-name">{departmentToDelete.name}</span>? This action cannot be
              undone. All associated data, roles, and assignments will be permanently removed.
            </p>

            <div className="hcfg-del-footer">
              <AppButton type="button" className="hcfg-del-cancel" onClick={closeDeleteDepartmentModal}>
                Cancel
              </AppButton>
              <AppButton type="button" className="hcfg-del-confirm" onClick={handleConfirmDeleteDepartment}>
                Confirm
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isProjectModalVisible && (
        <div className="hcfg-nd-layer" role="presentation">
          <div
            className={`hcfg-nd-backdrop ${
              isProjectModalExiting ? 'app-popup-overlay--exiting' : 'app-popup-overlay--enter'
            }`}
            onClick={beginCloseProjectModal}
            aria-hidden="true"
          />
          <div
            className={`hcfg-nd-modal app-popup-panel--slide-from-bottom${
              isProjectModalExiting ? ' is-exiting' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hcfg-np-title"
            onClick={(event) => event.stopPropagation()}
            onAnimationEnd={handleProjectModalAnimationEnd}
          >
            <div className="hcfg-nd-header">
              <h2 id="hcfg-np-title" className="hcfg-nd-title">
                {projectModalTitle}
              </h2>
              <AppButton
                type="button"
                className="hcfg-nd-close"
                aria-label="Close"
                onClick={beginCloseProjectModal}
              >
                ×
              </AppButton>
            </div>

            <div className="hcfg-nd-body">
              <label className="hcfg-nd-label" htmlFor="hcfg-np-name">
                Project name
              </label>
              <input
                id="hcfg-np-name"
                type="text"
                className="hcfg-nd-input"
                value={projectFormName}
                onChange={(event) => setProjectFormName(event.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="hcfg-nd-footer">
              <AppButton type="button" className="hcfg-nd-cancel" onClick={beginCloseProjectModal}>
                Cancel
              </AppButton>
              <AppButton type="button" className="hcfg-nd-save" onClick={handleSaveProject}>
                Save changes
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {isDepartmentModalVisible && (
        <div className="hcfg-nd-layer" role="presentation">
          <div
            className={`hcfg-nd-backdrop ${
              isDepartmentModalExiting ? 'app-popup-overlay--exiting' : 'app-popup-overlay--enter'
            }`}
            onClick={beginCloseDepartmentModal}
            aria-hidden="true"
          />
          <div
            className={`hcfg-nd-modal app-popup-panel--slide-from-bottom${
              isDepartmentModalExiting ? ' is-exiting' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hcfg-nd-title"
            onClick={(event) => event.stopPropagation()}
            onAnimationEnd={handleDepartmentModalAnimationEnd}
          >
            <div className="hcfg-nd-header">
              <h2 id="hcfg-nd-title" className="hcfg-nd-title">
                {departmentModalTitle}
              </h2>
              <AppButton
                type="button"
                className="hcfg-nd-close"
                aria-label="Close"
                onClick={beginCloseDepartmentModal}
              >
                ×
              </AppButton>
            </div>

            <div className="hcfg-nd-body">
              <label className="hcfg-nd-label" htmlFor="hcfg-nd-name">
                Department name
              </label>
              <input
                id="hcfg-nd-name"
                type="text"
                className="hcfg-nd-input"
                value={departmentFormName}
                onChange={(event) => setDepartmentFormName(event.target.value)}
                placeholder="Enter department name"
              />
            </div>

            <div className="hcfg-nd-footer">
              <AppButton type="button" className="hcfg-nd-cancel" onClick={beginCloseDepartmentModal}>
                Cancel
              </AppButton>
              <AppButton type="button" className="hcfg-nd-save" onClick={handleSaveDepartment}>
                Save changes
              </AppButton>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default HrisConfiguration
