import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const PendingApprovalsPage = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionReq, setActionReq] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await api.approvals.getPending();
      setPendingList(data);
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
      setFeedback(`Request #${actionReq.id} from ${actionReq.requesterName} was ${decision.toLowerCase()}.`);
      setActionReq(null);
      loadPending();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Action failed');
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
      header: 'Employee',
      accessor: 'requesterName',
      render: r => (
        <div>
          <div className="fw-bold text-dark">{r.requesterName}</div>
          <span className="text-secondary small">Direct Report</span>
        </div>
      )
    },
    {
      header: 'Requested System & Role',
      accessor: 'applicationName',
      render: r => (
        <div>
          <span className="fw-bold text-dark d-block">{r.applicationName}</span>
          <span className="badge bg-light text-secondary border">{r.roleName}</span>
        </div>
      )
    },
    {
      header: 'Justification',
      accessor: 'justification',
      render: r => (
        <div style={{ maxWidth: '280px' }} className="text-truncate text-secondary small" title={r.justification}>
          "{r.justification}"
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: 'submittedAt',
      render: r => <span className="text-secondary small">{new Date(r.submittedAt).toLocaleDateString()}</span>
    },
    {
      header: 'Review Actions',
      accessor: 'actions',
      render: r => (
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success btn-sm px-2 py-1"
            style={{ fontSize: '0.78rem' }}
            onClick={() => { setActionReq(r); setActionType('APPROVE'); }}
          >
            <i className="bi bi-check-lg me-1"></i> Approve
          </button>
          <button
            className="btn btn-outline-danger btn-sm px-2 py-1"
            style={{ fontSize: '0.78rem' }}
            onClick={() => { setActionReq(r); setActionType('REJECT'); }}
          >
            <i className="bi bi-x-lg me-1"></i> Reject
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Pending Manager Approvals</h4>
        <p className="text-secondary small mb-0">Evaluate business justifications and authorize access before administrative provisioning</p>
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
            data={pendingList}
            searchPlaceholder="Search pending approvals by employee or application..."
            emptyMessage="No pending requests awaiting your manager decision."
          />
        )}
      </div>

      <ConfirmationModal
        show={!!actionReq}
        onClose={() => setActionReq(null)}
        onConfirm={handleDecision}
        title={actionType === 'APPROVE' ? 'Approve Access Request' : 'Reject Access Request'}
        message={
          actionType === 'APPROVE'
            ? `Confirm approval for ${actionReq?.requesterName}'s request for ${actionReq?.roleName} access on ${actionReq?.applicationName}?`
            : `Reject access request for ${actionReq?.requesterName}? Please provide the rejection reason below.`
        }
        confirmText={actionType === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
        confirmVariant={actionType === 'APPROVE' ? 'success' : 'danger'}
        requiresComment={actionType === 'REJECT'}
        commentPlaceholder={actionType === 'REJECT' ? 'Mandatory reason for rejection...' : 'Optional comment...'}
      />
    </div>
  );
};
