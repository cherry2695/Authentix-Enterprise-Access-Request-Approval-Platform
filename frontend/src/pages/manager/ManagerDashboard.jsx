import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const ManagerDashboard = () => {
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
      const data = await api.dashboard.getManager();
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
      await api.approvals.managerDecision(actionReq.id, decision, comment);
      setFeedback(`Request #${actionReq.id} was successfully ${decision.toLowerCase()}.`);
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
          <h4 className="fw-bold text-dark mb-1">Manager Governance Hub</h4>
          <p className="text-secondary small mb-0">Review access requests submitted by your team and maintain audit compliance</p>
        </div>
        <Link to="/manager/approvals" className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm">
          <i className="bi bi-inbox"></i>
          <span>View Pending Approvals ({stats?.pendingApprovals || 0})</span>
        </Link>
      </div>

      {feedback && (
        <div className="alert alert-success alert-dismissible fade show py-2 small mb-3">
          <i className="bi bi-check-circle-fill me-2"></i> {feedback}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            icon="bi-hourglass-split"
            color="warning"
            subtitle="Awaiting your review"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Direct Reports"
            value={stats?.totalTeamMembers || 2}
            icon="bi-people"
            color="primary"
            subtitle="Assigned employees"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Approved Requests"
            value={stats?.approvedRequests || 0}
            icon="bi-check2-circle"
            color="success"
            subtitle="Forwarded to admin"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Rejected Requests"
            value={stats?.rejectedRequests || 0}
            icon="bi-x-circle"
            color="danger"
            subtitle="Declined at manager stage"
          />
        </div>
      </div>

      {/* PENDING APPROVALS ACTION TABLE */}
      <div className="access-card mb-4">
        <div className="access-card-header">
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold mb-0 text-dark">Action Required: Pending Approvals</h6>
            <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
              {stats?.pendingQueue?.length || 0} Pending
            </span>
          </div>
          <Link to="/manager/approvals" className="small text-decoration-none fw-semibold">
            Full Queue <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Application & Role</th>
                <th>Justification</th>
                <th>Submitted</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.pendingQueue || stats.pendingQueue.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted small">
                    <i className="bi bi-check-all fs-2 d-block mb-1 text-success"></i>
                    All caught up! No pending approvals awaiting your review.
                  </td>
                </tr>
              ) : (
                stats.pendingQueue.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div className="fw-bold text-dark">{req.requesterName}</div>
                      <span className="text-secondary small">ID: #{req.requesterId}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{req.applicationName}</div>
                      <span className="badge bg-light text-secondary border">{req.roleName}</span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div className="text-truncate text-secondary small" title={req.justification}>
                        "{req.justification}"
                      </div>
                    </td>
                    <td className="text-secondary small">
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-success btn-sm px-2 py-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => { setActionReq(req); setActionType('APPROVE'); }}
                        >
                          <i className="bi bi-check-lg me-1"></i> Approve
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

      {/* RECENT TEAM ACTIVITY */}
      <div className="access-card">
        <div className="access-card-header">
          <h6 className="fw-bold mb-0 text-dark">Recent Team Request Activity</h6>
          <Link to="/manager/history" className="small text-decoration-none fw-semibold">
            History Log <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Target App</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.recentTeamRequests || stats.recentTeamRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">No team activity yet.</td>
                </tr>
              ) : (
                stats.recentTeamRequests.map(r => (
                  <tr key={r.id}>
                    <td className="fw-semibold text-dark">{r.requesterName}</td>
                    <td>{r.applicationName}</td>
                    <td><span className="badge bg-light text-secondary border">{r.roleName}</span></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-secondary small">{new Date(r.submittedAt).toLocaleDateString()}</td>
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
        title={actionType === 'APPROVE' ? 'Approve Access Request' : 'Reject Access Request'}
        message={
          actionType === 'APPROVE'
            ? `Approve ${actionReq?.requesterName}'s request for ${actionReq?.roleName} access to ${actionReq?.applicationName}? This will advance the request to the Administrator for final security authorization.`
            : `Reject ${actionReq?.requesterName}'s request for ${actionReq?.roleName} access to ${actionReq?.applicationName}?`
        }
        confirmText={actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
        confirmVariant={actionType === 'APPROVE' ? 'success' : 'danger'}
        requiresComment={actionType === 'REJECT'}
        commentPlaceholder={actionType === 'REJECT' ? 'Mandatory reason for rejection...' : 'Optional approval comment...'}
      />
    </div>
  );
};
