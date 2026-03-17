import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Sidebar from './shared/Sidebar'
import Header from './shared/Header'
import Dashboard from './Ad-Hoc/components/Dashboard'
import Timesheet from './Ad-Hoc/components/Timesheet'
import TimesheetDetail from './Ad-Hoc/components/TimesheetDetail'
import SignTimesheet from './Ad-Hoc/components/SignTimesheet'
import Profile from './Ad-Hoc/components/Profile'
import GonSupervisorDashboard from './GonSupervisor/components/GonSupervisorDashboard'
import EcewsSupervisorDashboard from './EcewsSupervisor/components/EcewsSupervisorDashboard'
import EcewsTimesheetReview from './EcewsSupervisor/components/EcewsTimesheetReview'
import EcewsTimesheetApproval from './EcewsSupervisor/components/EcewsTimesheetApproval'
import EcewsSupervisees from './EcewsSupervisor/components/EcewsSupervisees'
import EcewsSuperviseeDetail from './EcewsSupervisor/components/EcewsSuperviseeDetail'
import TimesheetReview from './GonSupervisor/components/TimesheetReview'
import TimesheetReviewDetail from './GonSupervisor/components/TimesheetReviewDetail'
import ApprovalAction from './GonSupervisor/components/ApprovalAction'
import Supervisees from './GonSupervisor/components/Supervisees'
import Login from './auth/pages/Login'
import './App.css'

const AppShell = () => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-container">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/timesheet/create" element={<SignTimesheet />} />
          <Route path="/timesheet/:id" element={<TimesheetDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gon-supervisor" element={<GonSupervisorDashboard />} />
          <Route path="/ecews-supervisor" element={<EcewsSupervisorDashboard />} />
          <Route path="/ecews-supervisor/timesheet-review" element={<EcewsTimesheetReview />} />
          <Route path="/ecews-supervisor/supervisees" element={<EcewsSupervisees />} />
          <Route path="/ecews-supervisor/supervisees/:id" element={<EcewsSuperviseeDetail />} />
          <Route path="/ecews-supervisor/timesheet/:id" element={<EcewsTimesheetApproval />} />
          <Route path="/gon-supervisor/timesheet-review" element={<TimesheetReview />} />
          <Route path="/gon-supervisor/timesheet/:id" element={<TimesheetReviewDetail />} />
          <Route path="/gon-supervisor/approval-action/:id" element={<ApprovalAction />} />
          <Route path="/gon-supervisor/supervisees" element={<Supervisees />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
