import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const AllRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionReq, setActionReq] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadRequests();
  }, [selectedStatus]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.requests.getAll(selectedStatus);
      const items = res.content || res;
      setRequests(Array.isArray(items) ? items : []);
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
          ? `Request #${actionReq.id} approved. Permission granted to ${actionReq.requesterName}.`
          : `Request #${actionReq.id} rejected.`
      );
      setActionReq(null);
      loadRequests();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Action failed.');
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '70px',
      render: r => <span className="fw-semibold text-secondary">#{r.id}</span>
    },
    {
      header: 'Requester',
      accessor: 'requesterName',
      render: r => (
        <div>
          <span className="fw-bold text-dark d-block">{r.requesterName}</span>
          <span className="text-secondary small">User #{r.requesterId}</span>
        </div>
      )
    },
    {
      header: 'Target Application & Role',
      accessor: 'applicationName',
      render: r => (
        <div>
          <span className="fw-semibold text-dark">{r.applicationName}</span>
          <span className="badge bg-light text-secondary border ms-2">{r.roleName}</span>
        </div>
      )
    },
    {
      header: 'Assigned Manager',
      accessor: 'assignedManagerName',
      render: r => <span className="text-secondary small">{r.assignedManagerName || '—'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: r => <StatusBadge status={r.status} />
    },
    {
      header: 'Submitted',
      accessor: 'submittedAt',
      render: r => <span className="text-secondary small">{new Date(r.submittedAt).toLocaleDateString()}</span>
    },
    {
      header: 'Action',
      accessor: 'action',
      render: r => (
        r.status === 'PENDING_ADMIN_APPROVAL' ? (
          <div className="d-flex gap-1">
            <button
              className="btn btn-success btn-sm px-2 py-1"
              style={{ fontSize: '0.75rem' }}
              onClick={() => { setActionReq(r); setActionType('APPROVE'); }}
            >
              Grant
            </button>
            <button
              className="btn btn-outline-danger btn-sm px-2 py-1"
              style={{ fontSize: '0.75rem' }}
              onClick={() => { setActionReq(r); setActionType('REJECT'); }}
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-muted small">—</span>
        )
      )
    }
  ];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Global Access Requests</h4>
          <p className="text-secondary small mb-0">Enterprise-wide audit trail of all access workflow requests and lifecycle states</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="small text-secondary fw-semibold">Filter Status:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: '220px' }}
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING_MANAGER_APPROVAL">Pending Manager</option>
            <option value="PENDING_ADMIN_APPROVAL">Pending Admin</option>
            <option value="ACCESS_GRANTED">Access Granted</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success alert-dismissible fade show py-2 small mb-3">
          <i className="bi bi-check-circle-fill me-2"></i> {feedback}
        </div>
      )}

      <div className="access-card p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={requests}
            searchPlaceholder="Search all requests by requester, application, or role..."
            emptyMessage="No access requests match the selected criteria."
          />
        )}
      </div>

      {/* ADMIN DECISION MODAL */}
      <ConfirmationModal
        show={!!actionReq}
        onClose={() => setActionReq(null)}
        onConfirm={handleDecision}
        title={actionType === 'APPROVE' ? 'Grant Access & Provision Permission' : 'Reject Access Request'}
        message={
          actionType === 'APPROVE'
            ? `Final Approval: Authorize ${actionReq?.roleName} access for ${actionReq?.requesterName} on ${actionReq?.applicationName}? An active UserPermission will be provisioned.`
            : `Reject request #${actionReq?.id}? Please provide the compliance reason.`
        }
        confirmText={actionType === 'APPROVE' ? 'Grant Access' : 'Reject'}
        confirmVariant={actionType === 'APPROVE' ? 'success' : 'danger'}
        requiresComment={actionType === 'REJECT'}
        commentPlaceholder={actionType === 'REJECT' ? 'Mandatory reason for rejection...' : 'Optional approval notes...'}
      />
    </div>
  );
};
