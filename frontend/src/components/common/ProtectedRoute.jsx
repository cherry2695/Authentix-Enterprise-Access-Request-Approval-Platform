import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const RoleGuard = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return (
      <div className="alert alert-warning p-4 m-4 rounded shadow-sm text-center">
        <i className="bi bi-shield-exclamation fs-1 text-warning mb-2 d-block"></i>
        <h5>Access Restricted</h5>
        <p className="text-secondary mb-0">Your current role (<strong>{role}</strong>) does not have authorization to view this resource.</p>
      </div>
    );
  }

  return children;
};
