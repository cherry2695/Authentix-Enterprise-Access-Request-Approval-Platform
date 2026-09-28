import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const PermissionManagementPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [revokeModalPerm, setRevokeModalPerm] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadPermissions();
  }, [statusFilter]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await api.permissions.getAll(statusFilter);
      setPermissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (reason) => {
    if (!revokeModalPerm) return;
    try {
      await api.permissions.revoke(revokeModalPerm.id, reason);
      setFeedback(`Permission #${revokeModalPerm.id} for ${revokeModalPerm.userName} was revoked.`);
      setRevokeModalPerm(null);
      loadPermissions();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Revocation failed.');
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
      header: 'Identity (User)',
      accessor: 'userName',
      render: r => (
        <div>
          <span className="fw-bold text-dark d-block">{r.userName}</span>
          <span className="text-secondary small">{r.userEmail}</span>
        </div>
      )
    },
    {
      header: 'Application & Role',
      accessor: 'applicationName',
      render: r => (
        <div>
          <span className="fw-semibold text-dark">{r.applicationName}</span>
          <span className="badge bg-light text-secondary border ms-2">{r.roleName}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: r => <StatusBadge status={r.status} />
    },
    {
      header: 'Granted At',
      accessor: 'grantedAt',
      render: r => <span className="text-secondary small">{new Date(r.grantedAt).toLocaleDateString()}</span>
    },
    {
      header: 'Granted By',
      accessor: 'grantedByName',
      render: r => <span className="text-secondary small">{r.grantedByName || 'Ava Administrator'}</span>
    },
    {
      header: 'Action',
      accessor: 'action',
      render: r => (
        r.status === 'ACTIVE' ? (
          <button
            className="btn btn-outline-danger btn-sm px-2 py-1"
            style={{ fontSize: '0.78rem' }}
            onClick={() => setRevokeModalPerm(r)}
          >
            <i className="bi bi-shield-x me-1"></i> Revoke
          </button>
        ) : (
          <span className="text-muted small">Revoked {r.revokedAt ? new Date(r.revokedAt).toLocaleDateString() : ''}</span>
        )
      )
    }
  ];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Global Permissions & Entitlements</h4>
          <p className="text-secondary small mb-0">Active enterprise entitlements, privilege governance, and manual revocation</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="small text-secondary fw-semibold">Status:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
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
            data={permissions}
            searchPlaceholder="Search permissions by user, application, or role..."
            emptyMessage="No permissions match the selected filter."
          />
        )}
      </div>

      <ConfirmationModal
        show={!!revokeModalPerm}
        onClose={() => setRevokeModalPerm(null)}
        onConfirm={handleRevoke}
        title="Revoke Enterprise Permission"
        message={`Revoke ${revokeModalPerm?.userName}'s access to ${revokeModalPerm?.applicationName} (${revokeModalPerm?.roleName})? This immediately disables the privilege.`}
        confirmText="Revoke Permission"
        confirmVariant="danger"
        requiresComment={true}
        commentPlaceholder="Mandatory compliance reason for revoking access..."
      />
    </div>
  );
};
