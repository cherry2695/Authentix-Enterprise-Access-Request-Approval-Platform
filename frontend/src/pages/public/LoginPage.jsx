import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('employee@accessflow.io');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div
              className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: '54px', height: '54px' }}
            >
              <i className="bi bi-shield-check fs-2"></i>
            </div>
            <h3 className="fw-bold text-dark">AccessFlow</h3>
            <p className="text-secondary small">Enterprise Identity Governance & Workflow Engine</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small d-flex align-items-center mb-3">
              <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Corporate Email</label>
              <input
                type="email"
                className="form-control rounded-3 py-2"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label small fw-semibold text-dark">Password</label>
              </div>
              <input
                type="password"
                className="form-control rounded-3 py-2"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Authenticating...
                </>
              ) : (
                'Sign In to AccessFlow'
              )}
            </button>
          </form>

          {/* DEMO ACCOUNTS QUICK-FILL */}
          <div className="mt-4 pt-3 border-top">
            <div className="text-muted small fw-semibold mb-2 text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
              One-Click Demo Credentials:
            </div>
            <div className="d-flex flex-column gap-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm text-start py-1 px-2 d-flex justify-content-between align-items-center"
                onClick={() => handleDemoFill('employee@accessflow.io')}
              >
                <span><i className="bi bi-person me-2"></i>Ethan Employee</span>
                <span className="badge bg-secondary-subtle text-secondary">EMPLOYEE</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm text-start py-1 px-2 d-flex justify-content-between align-items-center"
                onClick={() => handleDemoFill('manager@accessflow.io')}
              >
                <span><i className="bi bi-people me-2"></i>Mia Manager</span>
                <span className="badge bg-warning-subtle text-warning">MANAGER</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm text-start py-1 px-2 d-flex justify-content-between align-items-center"
                onClick={() => handleDemoFill('admin@accessflow.io')}
              >
                <span><i className="bi bi-shield me-2"></i>Ava Administrator</span>
                <span className="badge bg-primary-subtle text-primary">ADMIN</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <span className="text-secondary small">Need an account? </span>
            <Link to="/register" className="small fw-semibold text-primary text-decoration-none">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
