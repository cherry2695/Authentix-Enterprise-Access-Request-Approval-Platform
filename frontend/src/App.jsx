import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedLayout, RoleGuard } from './components/common/ProtectedRoute';

// Public Pages
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { CatalogPage } from './pages/employee/CatalogPage';
import { MyRequestsPage } from './pages/employee/MyRequestsPage';
import { RequestDetailsPage } from './pages/employee/RequestDetailsPage';
import { MyPermissionsPage } from './pages/employee/MyPermissionsPage';
import { NotificationsPage } from './pages/employee/NotificationsPage';
import { ProfilePage } from './pages/employee/ProfilePage';

// Manager Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { PendingApprovalsPage } from './pages/manager/PendingApprovalsPage';
import { TeamOverviewPage } from './pages/manager/TeamOverviewPage';
import { ApprovalHistoryPage } from './pages/manager/ApprovalHistoryPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ApplicationManagementPage } from './pages/admin/ApplicationManagementPage';
import { AllRequestsPage } from './pages/admin/AllRequestsPage';
import { PermissionManagementPage } from './pages/admin/PermissionManagementPage';
import { AuditLogExplorerPage } from './pages/admin/AuditLogExplorerPage';
import { AccessReviewsPage } from './pages/admin/AccessReviewsPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Layout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />

            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/catalog" element={<CatalogPage />} />
            <Route path="/employee/requests" element={<MyRequestsPage />} />
            <Route path="/employee/requests/:id" element={<RequestDetailsPage />} />
            <Route path="/employee/permissions" element={<MyPermissionsPage />} />
            <Route path="/employee/notifications" element={<NotificationsPage />} />
            <Route path="/employee/profile" element={<ProfilePage />} />

            {/* Manager Routes */}
            <Route
              path="/manager/dashboard"
              element={
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <ManagerDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/manager/approvals"
              element={
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <PendingApprovalsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/manager/team"
              element={
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <TeamOverviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/manager/history"
              element={
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
                  <ApprovalHistoryPage />
                </RoleGuard>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <UserManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <ApplicationManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AllRequestsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PermissionManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AuditLogExplorerPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AccessReviewsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <SystemSettingsPage />
                </RoleGuard>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
