import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">User Profile & Identity Details</h4>
        <p className="text-secondary small mb-0">Your enterprise directory identity and authorization profile</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="access-card p-4">
            <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">{user?.fullName}</h5>
                <span className="text-secondary small">{user?.email}</span>
                <div className="mt-1">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                    {role}
                  </span>
                </div>
              </div>
            </div>

            <h6 className="fw-bold text-dark mb-3">Identity Attributes</h6>
            <div className="d-flex flex-column gap-3 small">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Account Status</span>
                <span className="badge bg-success-subtle text-success">Active & Compliant</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Assigned Reporting Manager</span>
                <span className="fw-semibold text-dark">{user?.managerName || 'Mia Manager (manager@accessflow.io)'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Authentication Standard</span>
                <span className="text-dark">BCrypt Password + JWT Authorization</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Enterprise Directory Sync</span>
                <span className="text-success"><i className="bi bi-shield-check me-1"></i> Synchronized</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="access-card p-4 h-100">
            <h6 className="fw-bold text-dark mb-3">Identity Governance Policies</h6>
            <ul className="text-secondary small ps-3 mb-0" style={{ lineHeight: '1.8' }}>
              <li><strong>Principle of Least Privilege:</strong> Only request permissions specifically necessary for your active project assignments.</li>
              <li><strong>Two-Stage Validation:</strong> Every access elevation requires sign-off from both your direct reporting manager and an enterprise administrator.</li>
              <li><strong>Append-Only Audit:</strong> All submission, cancellation, approval, and revocation events are irrevocably logged with correlation IDs.</li>
              <li><strong>Periodic Access Certifications:</strong> Administrative reviews are conducted quarterly; inactive or unneeded entitlements will be flagged for revocation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
