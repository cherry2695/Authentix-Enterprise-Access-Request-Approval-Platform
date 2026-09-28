import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const MyPermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeModalPerm, setRevokeModalPerm] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await api.permissions.getMy();
      setPermissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRevoke = async (reason) => {
    if (!revokeModalPerm) return;
    try {
      await api.permissions.revoke(revokeModalPerm.id, reason);
      setFeedback(`Access to ${revokeModalPerm.applicationName} (${revokeModalPerm.roleName}) was successfully revoked.`);
      setRevokeModalPerm(null);
      loadPermissions();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to revoke permission');
    }
  };

  const columns = [
    {
      header: 'Application',
      accessor: 'applicationName',
      render: row => (
        <div>
          <span className="fw-bold text-dark d-block">{row.applicationName}</span>
          <span className="text-secondary small">{row.applicationCategory || 'General'}</span>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      accessor: 'roleName',
      render: row => <span className="badge bg-light text-secondary border px-2 py-1">{row.roleName}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: row => <StatusBadge status={row.status} />
    },
    {
      header: 'Granted Date',
      accessor: 'grantedAt',
      render: row => <span className="text-secondary small">{new Date(row.grantedAt).toLocaleDateString()}</span>
    },
    {
      header: 'Granted By',
      accessor: 'grantedByName',
      render: row => <span className="text-secondary small">{row.grantedByName || 'Ava Administrator'}</span>
    },
    {
      header: 'Action',
      accessor: 'action',
      render: row => (
        row.status === 'ACTIVE' ? (
          <button
            className="btn btn-outline-danger btn-sm"
            style={{ fontSize: '0.78rem' }}
            onClick={() => setRevokeModalPerm(row)}
          >
            <i className="bi bi-shield-slash me-1"></i> Relinquish Access
          </button>
        ) : (
          <span className="text-muted small">Revoked {row.revokedAt ? new Date(row.revokedAt).toLocaleDateString() : ''}</span>
        )
      )
    }
  ];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">My Granted Permissions</h4>
          <p className="text-secondary small mb-0">Active enterprise entitlements provisioned through the governance workflow</p>
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
            data={permissions}
            searchPlaceholder="Search permissions by application or role..."
            emptyMessage="You do not have any permissions assigned."
          />
        )}
      </div>

      {/* RELINQUISH PERMISSION CONFIRMATION MODAL */}
      <ConfirmationModal
        show={!!revokeModalPerm}
        onClose={() => setRevokeModalPerm(null)}
        onConfirm={handleConfirmRevoke}
        title="Relinquish Application Access"
        message={`Are you sure you want to revoke your ${revokeModalPerm?.roleName} access to ${revokeModalPerm?.applicationName}? An audit log entry will be recorded.`}
        confirmText="Confirm Revocation"
        confirmVariant="danger"
        requiresComment={false}
        commentPlaceholder="Optional reason for relinquishing access (e.g. project completed)..."
      />
    </div>
  );
};
