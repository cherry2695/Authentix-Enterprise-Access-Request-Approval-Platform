import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(fullName, email, password);
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div
              className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: '50px', height: '50px' }}
            >
              <i className="bi bi-person-plus-fill fs-3"></i>
            </div>
            <h4 className="fw-bold text-dark">Create Account</h4>
            <p className="text-secondary small">Join AccessFlow Enterprise Governance</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Full Name</label>
              <input
                type="text"
                className="form-control rounded-3 py-2"
                placeholder="Jane Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Corporate Email</label>
              <input
                type="email"
                className="form-control rounded-3 py-2"
                placeholder="jane.doe@accessflow.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Password</label>
              <input
                type="password"
                className="form-control rounded-3 py-2"
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm mb-3"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-secondary small">Already registered? </span>
            <Link to="/login" className="small fw-semibold text-primary text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
