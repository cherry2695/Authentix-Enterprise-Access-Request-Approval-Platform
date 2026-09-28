import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalReq, setCancelModalReq] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.requests.getMy();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalReq) return;
    try {
      await api.requests.cancel(cancelModalReq.id);
      setFeedbackMsg(`Request #${cancelModalReq.id} was successfully cancelled.`);
      setCancelModalReq(null);
      loadRequests();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to cancel request');
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '70px',
      render: row => <span className="fw-semibold text-secondary">#{row.id}</span>
    },
    {
      header: 'Application',
      accessor: 'applicationName',
      render: row => (
        <div>
          <span className="fw-bold text-dark d-block">{row.applicationName}</span>
          <span className="text-secondary small">{row.roleName} Access</span>
        </div>
      )
    },
    {
      header: 'Assigned Manager',
      accessor: 'assignedManagerName',
      render: row => <span className="text-secondary small">{row.assignedManagerName || 'Mia Manager'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: row => <StatusBadge status={row.status} />
    },
    {
      header: 'Submitted',
      accessor: 'submittedAt',
      render: row => <span className="text-secondary small">{new Date(row.submittedAt).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: row => (
        <div className="d-flex align-items-center gap-2">
          <Link to={`/employee/requests/${row.id}`} className="btn btn-outline-primary btn-sm px-2 py-1" style={{ fontSize: '0.78rem' }}>
            <i className="bi bi-eye me-1"></i> Timeline
          </Link>
          {(row.status === 'PENDING_MANAGER_APPROVAL' || row.status === 'PENDING_ADMIN_APPROVAL') && (
            <button
              className="btn btn-outline-danger btn-sm px-2 py-1"
              style={{ fontSize: '0.78rem' }}
              onClick={() => setCancelModalReq(row)}
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">My Access Requests</h4>
          <p className="text-secondary small mb-0">Track lifecycle progression and manager/admin approvals for your requests</p>
        </div>
        <Link to="/employee/catalog" className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm">
          <i className="bi bi-plus-lg"></i>
          <span>New Request</span>
        </Link>
      </div>

      {feedbackMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 small mb-3">
          <i className="bi bi-check-circle-fill me-2"></i>
          {feedbackMsg}
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
            searchPlaceholder="Search requests by app, role, or status..."
            emptyMessage="You have not submitted any access requests yet."
          />
        )}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      <ConfirmationModal
        show={!!cancelModalReq}
        onClose={() => setCancelModalReq(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Access Request"
        message={`Are you sure you want to cancel request #${cancelModalReq?.id} for ${cancelModalReq?.applicationName} (${cancelModalReq?.roleName})? This action cannot be undone.`}
        confirmText="Yes, Cancel Request"
        confirmVariant="danger"
      />
    </div>
  );
};
