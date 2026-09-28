import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  switch (status) {
    case 'PENDING_MANAGER_APPROVAL':
      return (
        <span className="badge-status badge-pending-manager">
          <i className="bi bi-hourglass-split"></i> Awaiting Manager
        </span>
      );
    case 'PENDING_ADMIN_APPROVAL':
      return (
        <span className="badge-status badge-pending-admin">
          <i className="bi bi-shield-check"></i> Awaiting Admin
        </span>
      );
    case 'ACCESS_GRANTED':
    case 'ACTIVE':
    case 'APPROVED':
    case 'APPROVED_RETAIN':
      return (
        <span className="badge-status badge-granted">
          <i className="bi bi-check-circle-fill"></i> {status === 'APPROVED_RETAIN' ? 'Retain' : (status === 'ACTIVE' ? 'Active' : 'Granted')}
        </span>
      );
    case 'REJECTED':
    case 'FLAGGED_FOR_REVOCATION':
      return (
        <span className="badge-status badge-rejected">
          <i className="bi bi-x-circle-fill"></i> {status === 'FLAGGED_FOR_REVOCATION' ? 'Revoke Flagged' : 'Rejected'}
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="badge-status badge-cancelled">
          <i className="bi bi-slash-circle"></i> Cancelled
        </span>
      );
    case 'REVOKED':
      return (
        <span className="badge-status badge-revoked">
          <i className="bi bi-dash-circle"></i> Revoked
        </span>
      );
    default:
      return <span className="badge bg-light text-dark border">{status}</span>;
  }
};
