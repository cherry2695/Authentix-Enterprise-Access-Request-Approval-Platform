import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionReq, setActionReq] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getAdmin();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (comment) => {
    if (!actionReq) return;
    try {
      const decision = actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      await api.approvals.adminDecision(actionReq.id, decision, comment);
      setFeedback(
        actionType === 'APPROVE'
          ? `Request #${actionReq.id} approved! Access granted and permission record created.`
          : `Request #${actionReq.id} rejected.`
      );
      setActionReq(null);
      loadDashboard();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Action failed.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Administrator Governance Center</h4>
          <p className="text-secondary small mb-0">Identity lifecycle oversight, pending administrative authorizations, and compliance telemetry</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/reviews" className="btn btn-outline-primary btn-sm px-3 py-2 rounded-3">
            <i className="bi bi-calendar-check me-1"></i> Access Reviews
          </Link>
          <Link to="/admin/requests" className="btn btn-primary btn-sm px-3 py-2 rounded-3 shadow-sm">
            <i className="bi bi-list-check me-1"></i> All Requests
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success alert-dismissible fade show py-2 small mb-3">
          <i className="bi bi-check-circle-fill me-2"></i> {feedback}
        </div>
      )}

      {/* STAT CARDS ROW */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 4}
            icon="bi-people"
            color="primary"
            subtitle="Directory identities"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Admin Queue"
            value={stats?.pendingAdminApprovals || 0}
            icon="bi-shield-exclamation"
            color="warning"
            subtitle="Awaiting final signoff"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Entitlements"
            value={stats?.activePermissions || 0}
            icon="bi-key"
            color="success"
            subtitle="Granted permissions"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Reviews"
            value={stats?.activeReviewCampaigns || 0}
            icon="bi-card-checklist"
            color="info"
            subtitle="Ongoing certification"
          />
        </div>
      </div>

      {/* ADMIN PENDING QUEUE TABLE */}
      <div className="access-card mb-4">
        <div className="access-card-header">
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold mb-0 text-dark">Administrative Signoff Queue</h6>
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
              {stats?.pendingAdminQueue?.length || 0} Required
            </span>
          </div>
          <span className="text-secondary small">Requires Admin privilege to provision</span>
        </div>

        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Application & Role</th>
                <th>Manager Signoff</th>
                <th>Justification</th>
                <th className="text-end">Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.pendingAdminQueue || stats.pendingAdminQueue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted small">
                    <i className="bi bi-shield-check fs-2 d-block mb-1 text-success"></i>
                    No requests currently awaiting administrative signoff.
                  </td>
                </tr>
              ) : (
                stats.pendingAdminQueue.map(req => (
                  <tr key={req.id}>
                    <td className="fw-semibold text-secondary">#{req.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{req.requesterName}</div>
                      <span className="text-secondary small">ID: #{req.requesterId}</span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{req.applicationName}</span>
                      <span className="badge bg-light text-secondary border ms-2">{req.roleName}</span>
                    </td>
                    <td>
                      <span className="text-success small fw-medium">
                        <i className="bi bi-check-circle me-1"></i> {req.assignedManagerName || 'Mia Manager'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div className="text-truncate text-secondary small" title={req.justification}>
                        "{req.justification}"
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-success btn-sm px-2 py-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => { setActionReq(req); setActionType('APPROVE'); }}
                        >
                          <i className="bi bi-key me-1"></i> Grant Access
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm px-2 py-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => { setActionReq(req); setActionType('REJECT'); }}
                        >
                          <i className="bi bi-x-lg me-1"></i> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT AUDIT TRAIL FEED */}
      <div className="access-card">
        <div className="access-card-header">
          <h6 className="fw-bold mb-0 text-dark">Recent Immutable Audit Activity</h6>
          <Link to="/admin/audit-logs" className="small text-decoration-none fw-semibold">
            Full Audit Log <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.recentAuditEvents || stats.recentAuditEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">No audit logs recorded yet.</td>
                </tr>
              ) : (
                stats.recentAuditEvents.map(log => (
                  <tr key={log.id}>
                    <td className="text-secondary small">{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <span className="fw-semibold text-dark">{log.actorName}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.75rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td className="text-secondary small">{log.entityType} #{log.entityId}</td>
                    <td className="text-secondary small" style={{ maxWidth: '280px' }}>
                      <span className="text-truncate d-inline-block" style={{ maxWidth: '280px' }} title={log.reason || log.newValue}>
                        {log.reason || log.newValue || 'Workflow transition'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        show={!!actionReq}
        onClose={() => setActionReq(null)}
        onConfirm={handleDecision}
        title={actionType === 'APPROVE' ? 'Grant Enterprise Permission' : 'Reject Access Request'}
        message={
          actionType === 'APPROVE'
            ? `Final Approval: Grant ${actionReq?.roleName} permission to ${actionReq?.requesterName} on ${actionReq?.applicationName}? A permanent UserPermission record will be atomically generated.`
            : `Reject request #${actionReq?.id}? Please specify the security or compliance reason.`
        }
        confirmText={actionType === 'APPROVE' ? 'Authorize & Grant Access' : 'Confirm Rejection'}
        confirmVariant={actionType === 'APPROVE' ? 'success' : 'danger'}
        requiresComment={actionType === 'REJECT'}
        commentPlaceholder={actionType === 'REJECT' ? 'Mandatory rejection justification...' : 'Optional approval notes...'}
      />
    </div>
  );
};
