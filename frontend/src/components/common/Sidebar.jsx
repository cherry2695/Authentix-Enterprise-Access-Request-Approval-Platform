import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { role } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <i className="bi bi-shield-check text-primary me-2 fs-4"></i>
        <span>Access<span className="text-primary">Flow</span></span>
      </div>

      <ul className="sidebar-nav">
        {/* EMPLOYEE SECTION */}
        <li className="nav-section-title">Employee Portal</li>
        <li>
          <NavLink to="/employee/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-grid-1x2"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/employee/catalog" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-collection"></i>
            <span>App Catalog</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/employee/requests" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-send-check"></i>
            <span>My Requests</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/employee/permissions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-key"></i>
            <span>My Permissions</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/employee/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-bell"></i>
            <span>Notifications</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/employee/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-person-gear"></i>
            <span>Profile & Manager</span>
          </NavLink>
        </li>

        {/* MANAGER SECTION */}
        {(role === 'MANAGER' || role === 'ADMIN') && (
          <>
            <li className="nav-section-title mt-3">Manager Workspace</li>
            <li>
              <NavLink to="/manager/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-bar-chart"></i>
                <span>Manager Hub</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/approvals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-inbox"></i>
                <span>Pending Approvals</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/team" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-people"></i>
                <span>Team Access</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/manager/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-clock-history"></i>
                <span>Approval Log</span>
              </NavLink>
            </li>
          </>
        )}

        {/* ADMIN SECTION */}
        {role === 'ADMIN' && (
          <>
            <li className="nav-section-title mt-3">Administration</li>
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-speedometer2"></i>
                <span>Admin Overview</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-person-badge"></i>
                <span>User Accounts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-app-indicator"></i>
                <span>Applications & Roles</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/requests" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-check2-all"></i>
                <span>All Requests</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/permissions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-shield-lock"></i>
                <span>Global Permissions</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-journal-text"></i>
                <span>Audit Trail</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/reviews" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-calendar-check"></i>
                <span>Access Reviews</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <i className="bi bi-sliders"></i>
                <span>Governance Policies</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="sidebar-footer text-secondary small">
        <div className="d-flex align-items-center justify-content-between">
          <span>v1.0.0 Enterprise</span>
          <span className="badge bg-success-subtle text-success">Online</span>
        </div>
      </div>
    </aside>
  );
};
