import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data.slice(0, 5));
      const unread = data.filter(n => !n.readStatus).length;
      setUnreadCount(unread);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <span className="text-secondary fw-medium small d-none d-md-inline">
          Enterprise Identity Governance & Workflow Engine
        </span>

        {/* Demo Fast Switcher */}
        <div className="d-none d-lg-flex align-items-center gap-1 bg-light border rounded px-2 py-1">
          <span className="text-muted small me-1">Demo Role:</span>
          <button
            className={`btn btn-sm ${role === 'EMPLOYEE' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
            onClick={() => switchDemoRole('EMPLOYEE')}
          >
            Employee
          </button>
          <button
            className={`btn btn-sm ${role === 'MANAGER' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
            onClick={() => switchDemoRole('MANAGER')}
          >
            Manager
          </button>
          <button
            className={`btn btn-sm ${role === 'ADMIN' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
            onClick={() => switchDemoRole('ADMIN')}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell */}
        <div className="position-relative">
          <button
            className="btn btn-light rounded-circle border-0 p-2 position-relative"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Notifications"
          >
            <i className="bi bi-bell fs-5 text-secondary"></i>
            {unreadCount > 0 && (
              <span className="badge bg-danger rounded-pill notification-bell-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              className="dropdown-menu dropdown-menu-end show shadow-lg border p-0 position-absolute"
              style={{ width: '320px', right: 0, top: '48px', zIndex: 1050 }}
            >
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold small">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-link btn-sm text-decoration-none p-0"
                    style={{ fontSize: '0.75rem' }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted small">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2 border-bottom ${!n.readStatus ? 'bg-light-subtle' : ''}`}
                      style={{ fontSize: '0.82rem' }}
                    >
                      <div className="fw-semibold text-dark">{n.title}</div>
                      <div className="text-secondary">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 text-center bg-light border-top">
                <Link
                  to="/employee/notifications"
                  className="small text-decoration-none fw-semibold"
                  onClick={() => setShowNotifDropdown(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="d-flex align-items-center gap-2 border-start ps-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="d-none d-sm-block text-start">
            <div className="fw-semibold" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
              {user?.fullName}
            </div>
            <span
              className="badge bg-primary-subtle text-primary border border-primary-subtle"
              style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}
            >
              {role}
            </span>
          </div>
          <button
            className="btn btn-outline-danger btn-sm ms-2"
            onClick={handleLogout}
            title="Sign Out"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </header>
  );
};
