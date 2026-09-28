import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';

export const AuditLogExplorerPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('');
  const [inspectLog, setInspectLog] = useState(null);

  useEffect(() => {
    loadAuditLogs();
  }, [selectedAction]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.audit.search({ action: selectedAction });
      const items = res.content || res;
      setLogs(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const actionsList = [
    'ALL',
    'USER_LOGIN',
    'ACCESS_REQUEST_CREATED',
    'ACCESS_REQUEST_CANCELLED',
    'MANAGER_APPROVED',
    'MANAGER_REJECTED',
    'ADMIN_APPROVED',
    'ADMIN_REJECTED',
    'PERMISSION_GRANTED',
    'PERMISSION_REVOKED',
    'USER_ROLE_UPDATED',
    'APPLICATION_CREATED',
    'ACCESS_REVIEW_COMPLETED'
  ];

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      width: '160px',
      render: r => <span className="text-secondary small">{new Date(r.createdAt).toLocaleString()}</span>
    },
    {
      header: 'Actor',
      accessor: 'actorName',
      render: r => (
        <div>
          <span className="fw-semibold text-dark d-block">{r.actorName}</span>
          <span className="text-muted small" style={{ fontSize: '0.72rem' }}>{r.actorEmail}</span>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: r => (
        <span className="badge bg-light text-primary border font-monospace" style={{ fontSize: '0.75rem' }}>
          {r.action}
        </span>
      )
    },
    {
      header: 'Target Entity',
      accessor: 'entityType',
      render: r => <span className="text-secondary small">{r.entityType} #{r.entityId}</span>
    },
    {
      header: 'Details / Justification',
      accessor: 'reason',
      render: r => (
        <div style={{ maxWidth: '280px' }} className="text-truncate text-secondary small" title={r.reason || r.newValue}>
          {r.reason || (r.newValue ? `Transition to ${r.newValue}` : '—')}
        </div>
      )
    },
    {
      header: 'Correlation ID',
      accessor: 'correlationId',
      render: r => (
        <span className="font-monospace text-muted small" style={{ fontSize: '0.72rem' }}>
          {r.correlationId || '—'}
        </span>
      )
    },
    {
      header: 'Inspect',
      accessor: 'inspect',
      render: r => (
        <button
          className="btn btn-outline-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          onClick={() => setInspectLog(r)}
        >
          <i className="bi bi-search"></i>
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Audit Trail Explorer</h4>
          <p className="text-secondary small mb-0">Append-only compliance log for regulatory, SOC 2, and security governance tracking</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="small text-secondary fw-semibold">Action:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: '220px' }}
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value === 'ALL' ? '' : e.target.value)}
          >
            {actionsList.map(a => (
              <option key={a} value={a === 'ALL' ? '' : a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="alert alert-info py-2 small d-flex align-items-center mb-4">
        <i className="bi bi-shield-lock-fill me-2 fs-5"></i>
        <div>
          <strong>Append-Only Integrity Guarantee:</strong> Audit events are generated strictly by backend service boundaries. No modifications or deletions are permitted through the API.
        </div>
      </div>

      <div className="access-card p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            searchPlaceholder="Search audit events by actor, action, target, or correlation ID..."
            emptyMessage="No audit logs found matching criteria."
          />
        )}
      </div>

      {/* INSPECT AUDIT ENTRY MODAL */}
      {inspectLog && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Audit Record #{inspectLog.id}</h5>
                <button type="button" className="btn-close" onClick={() => setInspectLog(null)}></button>
              </div>
              <div className="modal-body p-4 small">
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span className="text-secondary">Action Type:</span>
                  <span className="badge bg-primary-subtle text-primary border font-monospace">{inspectLog.action}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span className="text-secondary">Actor:</span>
                  <span className="fw-semibold text-dark">{inspectLog.actorName} ({inspectLog.actorEmail})</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span className="text-secondary">Target Entity:</span>
                  <span className="text-dark">{inspectLog.entityType} (ID: {inspectLog.entityId})</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span className="text-secondary">Timestamp:</span>
                  <span className="text-dark">{new Date(inspectLog.createdAt).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span className="text-secondary">Previous State:</span>
                  <span className="text-muted font-monospace">{inspectLog.oldValue || 'null'}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span className="text-secondary">New State:</span>
                  <span className="text-success font-monospace">{inspectLog.newValue || 'null'}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                  <span className="text-secondary">Correlation ID:</span>
                  <span className="font-monospace text-muted">{inspectLog.correlationId || '—'}</span>
                </div>
                <div className="mt-3">
                  <label className="text-secondary d-block mb-1">Reason / Context:</label>
                  <div className="p-2 bg-light border rounded text-dark">
                    {inspectLog.reason || 'None provided'}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light rounded-bottom-4">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setInspectLog(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
