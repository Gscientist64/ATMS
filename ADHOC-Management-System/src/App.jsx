// src/App.jsx

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './shared/Sidebar'
import Header from './shared/Header'
import { ActionCompletedToastProvider } from './shared/ActionCompletedToast'

const Login = lazy(() => import('./auth/pages/Login'))
const ForgotPassword = lazy(() => import('./auth/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./auth/pages/ResetPassword'))

const Dashboard = lazy(() => import('./Ad-Hoc/components/Dashboard'))
const Timesheet = lazy(() => import('./Ad-Hoc/components/Timesheet'))
const TimesheetDetail = lazy(() => import('./Ad-Hoc/components/TimesheetDetail'))
const SignTimesheet = lazy(() => import('./Ad-Hoc/components/SignTimesheet'))
const Profile = lazy(() => import('./Ad-Hoc/components/Profile'))

const GonSupervisorDashboard = lazy(() => import('./GonSupervisor/components/GonSupervisorDashboard'))
const EcewsSupervisorDashboard = lazy(() => import('./EcewsSupervisor/components/EcewsSupervisorDashboard'))
const EcewsTimesheetReview = lazy(() => import('./EcewsSupervisor/components/EcewsTimesheetReview'))
const EcewsTimesheetApproval = lazy(() => import('./EcewsSupervisor/components/EcewsTimesheetApproval'))
const EcewsSupervisees = lazy(() => import('./EcewsSupervisor/components/EcewsSupervisees'))
const EcewsSuperviseeDetail = lazy(() => import('./EcewsSupervisor/components/EcewsSuperviseeDetail'))
const TimesheetReview = lazy(() => import('./GonSupervisor/components/TimesheetReview'))
const TimesheetReviewDetail = lazy(() => import('./GonSupervisor/components/TimesheetReviewDetail'))
const ApprovalAction = lazy(() => import('./GonSupervisor/components/ApprovalAction'))
const Supervisees = lazy(() => import('./GonSupervisor/components/Supervisees'))

const ProgramsDashboard = lazy(() => import('./Programs/components/ProgramsDashboard'))
const ProgramsTimesheetReview = lazy(() => import('./Programs/components/ProgramsTimesheetReview'))
const ProgramsTimesheetDetail = lazy(() => import('./Programs/components/ProgramsTimesheetDetail'))
const ProgramsTimesheetView = lazy(() => import('./Programs/components/ProgramsTimesheetView'))
const ProgramsPersonnel = lazy(() => import('./Programs/components/ProgramsPersonnel'))
const ProgramsStaffDetail = lazy(() => import('./Programs/components/ProgramsStaffDetail'))
const ProgramsGovernance = lazy(() => import('./Programs/components/ProgramsGovernance'))
const ProgramsGovernanceAdvisoryDetail = lazy(() => import('./Programs/components/ProgramsGovernanceAdvisoryDetail'))
const ProgramsPipManagement = lazy(() => import('./Programs/components/ProgramsPipManagement'))

// Staff Module Imports
const StaffDashboard = lazy(() => import('./Staff/components/StaffDashboard'))
const StaffOnboarding = lazy(() => import('./Staff/components/StaffOnboarding'))
const StaffTimesheet = lazy(() => import('./Staff/components/StaffTimesheet'))
const StaffSignTimesheet = lazy(() => import('./Staff/components/StaffSignTimesheet'))
const StaffLeave = lazy(() => import('./Staff/components/StaffLeave'))
const StaffLeaveApplication = lazy(() => import('./Staff/components/StaffLeaveApplication'))
const StaffProfile = lazy(() => import('./Staff/components/StaffProfile'))

// HRIS Imports
const ECEWSDashboard = lazy(() => import('./HRIS/ETMS_HR/components/ECEWSDashboard'))
const AuxilaryDashboard = lazy(() => import('./HRIS/ETMS_HR/components/AuxilaryDashboard'))
const AncillaryStaffPersonnel = lazy(() => import('./HRIS/ETMS_HR/components/AncillaryStaffPersonnel'))
const AncillaryStaffDetail = lazy(() => import('./HRIS/ETMS_HR/components/AncillaryStaffDetail'))
const AncillaryCreateEmployeeAccount = lazy(() => import('./HRIS/ETMS_HR/components/AncillaryCreateEmployeeAccount'))
const AncillaryGovernance = lazy(() => import('./HRIS/ETMS_HR/components/AncillaryGovernance'))
const AncillaryGovernancePipDetail = lazy(() => import('./HRIS/ETMS_HR/components/AncillaryGovernancePipDetail'))
const UnifiedDashboard = lazy(() => import('./HRIS/ETMS_HR/components/UnifiedDashboard'))
const HrisUserManagement = lazy(() => import('./HRIS/ETMS_HR/components/HrisUserManagement'))
const HrisConfiguration = lazy(() => import('./HRIS/ETMS_HR/components/HrisConfiguration'))

import './App.css'

const PageLoading = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading...
    </div>
)

// Protected Route wrapper with role-based redirects
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role
        if (user.role === 'Programs') return <Navigate to="/programs" replace />;
        if (user.role === 'EcewsSupervisor') return <Navigate to="/ecews-supervisor" replace />;
        if (user.role === 'GonSupervisor') return <Navigate to="/gon-supervisor" replace />;
        if (user.role === 'HrAdmin') return <Navigate to="/hris/system-settings" replace />;
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

// Layout for authenticated pages
const AppLayout = ({ children }) => (
    <div className="app">
        <Sidebar />
        <div className="main-container">
            <Header />
            <main className="main-content">{children}</main>
        </div>
    </div>
);

// Role-based dashboard component
const RoleBasedDashboard = () => {
    const { user } = useAuth();
    
    if (user?.role === 'HrAdmin') {
        return <Navigate to="/hris/ancillary-staff" replace />;
    }
    if (user?.role === 'Programs') {
        return <Navigate to="/programs" replace />;
    }
    if (user?.role === 'EcewsSupervisor') {
        return <Navigate to="/ecews-supervisor" replace />;
    }
    if (user?.role === 'GonSupervisor') {
        return <Navigate to="/gon-supervisor" replace />;
    }
    return <Dashboard />;
};

function AppRoutes() {
    return (
        <Suspense fallback={<PageLoading />}>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* AdHoc Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['AdHoc', 'HrAdmin', 'Programs', 'EcewsSupervisor', 'GonSupervisor']}>
                    <AppLayout>
                        <RoleBasedDashboard />
                    </AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/timesheet" element={
                <ProtectedRoute allowedRoles={['AdHoc']}>
                    <AppLayout><Timesheet /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/timesheet/create" element={
                <ProtectedRoute allowedRoles={['AdHoc']}>
                    <AppLayout><SignTimesheet /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/timesheet/:id" element={
                <ProtectedRoute allowedRoles={['AdHoc']}>
                    <AppLayout><TimesheetDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/timesheet/edit/:id" element={
                <ProtectedRoute allowedRoles={['AdHoc']}>
                    <AppLayout><SignTimesheet /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['AdHoc', 'EcewsSupervisor', 'GonSupervisor', 'Programs', 'HrAdmin']}>
                    <AppLayout><Profile /></AppLayout>
                </ProtectedRoute>
            } />

            {/* Staff Routes */}
            <Route path="/staff/onboarding" element={
                <StaffOnboarding />
            } />
            <Route path="/staff" element={
                <ProtectedRoute allowedRoles={['Staff', 'AdHoc', 'HrAdmin']}>
                    <AppLayout><StaffDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/staff/dashboard" element={
                <ProtectedRoute allowedRoles={['Staff', 'AdHoc', 'HrAdmin']}>
                    <AppLayout><StaffDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/staff/timesheet" element={
                <ProtectedRoute allowedRoles={['Staff', 'AdHoc', 'HrAdmin']}>
                    <AppLayout><StaffTimesheet /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/staff/timesheet/sign" element={
                <ProtectedRoute allowedRoles={['Staff', 'AdHoc', 'HrAdmin']}>
                    <AppLayout><StaffSignTimesheet /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/staff/leave" element={
                <ProtectedRoute allowedRoles={['Staff', 'AdHoc', 'HrAdmin']}>
                    <AppLayout><StaffLeave /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/staff/leave/apply" element={
                <ProtectedRoute allowedRoles={['Staff', 'AdHoc', 'HrAdmin']}>
                    <AppLayout><StaffLeaveApplication /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/staff/profile" element={
                <ProtectedRoute allowedRoles={['Staff', 'AdHoc', 'HrAdmin']}>
                    <AppLayout><StaffProfile /></AppLayout>
                </ProtectedRoute>
            } />

            {/* Programs Routes */}
            <Route path="/programs" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/timesheet-review" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsTimesheetReview /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/timesheet/:id" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsTimesheetDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/timesheet/view/:id" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsTimesheetView /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/personnel" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsPersonnel /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/personnel/new" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AncillaryCreateEmployeeAccount /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/staff/:id" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsStaffDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/governance" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsGovernance /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/governance/advisory/:id" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsGovernanceAdvisoryDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/programs/pip-management" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ProgramsPipManagement /></AppLayout>
                </ProtectedRoute>
            } />

            {/* ECEWS Supervisor Routes */}
            <Route path="/ecews-supervisor" element={
                <ProtectedRoute allowedRoles={['EcewsSupervisor']}>
                    <AppLayout><EcewsSupervisorDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/ecews-supervisor/timesheet-review" element={
                <ProtectedRoute allowedRoles={['EcewsSupervisor']}>
                    <AppLayout><EcewsTimesheetReview /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/ecews-supervisor/supervisees" element={
                <ProtectedRoute allowedRoles={['EcewsSupervisor']}>
                    <AppLayout><EcewsSupervisees /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/ecews-supervisor/supervisees/:id" element={
                <ProtectedRoute allowedRoles={['EcewsSupervisor']}>
                    <AppLayout><EcewsSuperviseeDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/ecews-supervisor/timesheet/:id" element={
                <ProtectedRoute allowedRoles={['EcewsSupervisor']}>
                    <AppLayout><EcewsTimesheetApproval /></AppLayout>
                </ProtectedRoute>
            } />

            {/* GON Supervisor Routes - Commented out but available */}
            
            <Route path="/gon-supervisor" element={
                <ProtectedRoute allowedRoles={['GonSupervisor']}>
                    <AppLayout><GonSupervisorDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/gon-supervisor/timesheet-review" element={
                <ProtectedRoute allowedRoles={['GonSupervisor']}>
                    <AppLayout><TimesheetReview /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/gon-supervisor/timesheet/:id" element={
                <ProtectedRoute allowedRoles={['GonSupervisor']}>
                    <AppLayout><TimesheetReviewDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/gon-supervisor/approval-action/:id" element={
                <ProtectedRoute allowedRoles={['GonSupervisor']}>
                    <AppLayout><ApprovalAction /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/gon-supervisor/supervisees" element={
                <ProtectedRoute allowedRoles={['GonSupervisor']}>
                    <AppLayout><Supervisees /></AppLayout>
                </ProtectedRoute>
            } />
            

            {/* HRIS Routes */}
            <Route path="/hris" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AuxilaryDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/dashboard" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AuxilaryDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/ecews-dashboard" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><ECEWSDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/ancillary-staff" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AuxilaryDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/ancillary-staff/personnel" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AncillaryStaffPersonnel /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/ancillary-staff/personnel/new" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AncillaryCreateEmployeeAccount /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/ancillary-staff/personnel/staff/:publicId" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AncillaryStaffDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/ancillary-staff/governance" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AncillaryGovernance /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/ancillary-staff/governance/renew/:id" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><AncillaryGovernancePipDetail /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/system-settings" element={
                <ProtectedRoute allowedRoles={['Programs', 'HrAdmin']}>
                    <AppLayout><UnifiedDashboard /></AppLayout>
                </ProtectedRoute>
            } />
            {/* Add Governance route for HR - this is the ProgramsGovernance page */}
            <Route path="/hris/governance" element={
                <ProtectedRoute allowedRoles={['HrAdmin']}>
                    <AppLayout><ProgramsGovernance /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/system-settings/user-management" element={
                <ProtectedRoute allowedRoles={['HrAdmin']}>
                    <AppLayout><HrisUserManagement /></AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/hris/system-settings/configurations" element={
                <ProtectedRoute allowedRoles={['HrAdmin']}>
                    <AppLayout><HrisConfiguration /></AppLayout>
                </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <ActionCompletedToastProvider>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </ActionCompletedToastProvider>
    );
}

export default App