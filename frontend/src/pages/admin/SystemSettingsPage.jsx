import React, { useState } from 'react';

export const SystemSettingsPage = () => {
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [requireCommentOnReject, setRequireCommentOnReject] = useState(true);
  const [autoExpireDays, setAutoExpireDays] = useState('90');
  const [notificationEmailEnabled, setNotificationEmailEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">System Governance Settings & Policies</h4>
        <p className="text-secondary small mb-0">Configure authentication parameters, security workflow thresholds, and compliance controls</p>
      </div>

      {saved && (
        <div className="alert alert-success alert-dismissible fade show py-2 small mb-3">
          <i className="bi bi-check-circle-fill me-2"></i> System policies updated successfully.
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="access-card p-4">
              <h6 className="fw-bold text-dark mb-3">Approval Workflow Policy Rules</h6>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requireComment"
                  checked={requireCommentOnReject}
                  onChange={e => setRequireCommentOnReject(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold" htmlFor="requireComment">
                  Enforce Mandatory Comments on Request Rejection
                </label>
                <div className="text-muted small">
                  Prevents managers and administrators from declining requests without an explicit justification.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Default Permission Expiration (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={autoExpireDays}
                  onChange={e => setAutoExpireDays(e.target.value)}
                />
                <div className="form-text small">
                  Leave empty or set to 0 for non-expiring permanent entitlements.
                </div>
              </div>

              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotif"
                  checked={notificationEmailEnabled}
                  onChange={e => setNotificationEmailEnabled(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold" htmlFor="emailNotif">
                  In-App & Email Event Dispatches
                </label>
                <div className="text-muted small">
                  Notify requesters and approvers via internal notification hub upon state transitions.
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="access-card p-4">
              <h6 className="fw-bold text-dark mb-3">Authentication & Security Telemetry</h6>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">JWT Token Expiration Window (Hours)</label>
                <input
                  type="number"
                  className="form-control"
                  value={sessionTimeout}
                  onChange={e => setSessionTimeout(e.target.value)}
                />
                <div className="form-text small">
                  Standard enterprise duration before re-authentication is mandated.
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 border small mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Password Hashing:</span>
                  <span className="fw-semibold text-dark">BCrypt (10 rounds)</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Audit Integrity:</span>
                  <span className="badge bg-success-subtle text-success">Append-Only Immutability</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">CORS Whitelist:</span>
                  <span className="font-monospace text-dark">http://localhost:5173</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Database Engine:</span>
                  <span className="fw-semibold text-dark">MySQL 8 InnoDB</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm px-4">
                Save Governance Policies
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
