import React from 'react';

export const ApprovalTimeline = ({ request, history = [] }) => {
  if (!request) return null;

  const managerDecision = history.find(h => h.approvalStage === 'MANAGER');
  const adminDecision = history.find(h => h.approvalStage === 'ADMIN');

  const isCancelled = request.status === 'CANCELLED';
  const isManagerRejected = managerDecision && managerDecision.decision === 'REJECTED';
  const isAdminRejected = adminDecision && adminDecision.decision === 'REJECTED';
  const isGranted = request.status === 'ACCESS_GRANTED';

  return (
    <div className="timeline-stepper">
      {/* STEP 1: Submission */}
      <div className="timeline-step completed">
        <div className="timeline-circle">
          <i className="bi bi-check-lg"></i>
        </div>
        <div className="timeline-content">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h6 className="mb-0 fw-bold">Request Submitted</h6>
            <span className="text-secondary small">{request.submittedAt ? new Date(request.submittedAt).toLocaleString() : ''}</span>
          </div>
          <p className="text-secondary small mb-1">
            Submitted by <strong>{request.requesterName}</strong> for <strong>{request.applicationName}</strong> ({request.roleName})
          </p>
          <div className="bg-light p-2 rounded small text-muted border">
            <em>"{request.justification}"</em>
          </div>
        </div>
      </div>

      {/* STEP 2: Manager Review */}
      <div className={`timeline-step ${
        managerDecision?.decision === 'APPROVED' ? 'completed' :
        isManagerRejected ? 'rejected' :
        request.status === 'PENDING_MANAGER_APPROVAL' ? 'current' : ''
      }`}>
        <div className="timeline-circle">
          {managerDecision?.decision === 'APPROVED' ? <i className="bi bi-check-lg"></i> :
           isManagerRejected ? <i className="bi bi-x-lg"></i> :
           <i className="bi bi-person"></i>}
        </div>
        <div className="timeline-content">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h6 className="mb-0 fw-bold">Manager Review</h6>
            {managerDecision && (
              <span className="text-secondary small">{new Date(managerDecision.decidedAt).toLocaleString()}</span>
            )}
          </div>
          <p className="text-secondary small mb-1">
            Assigned Manager: <strong>{request.assignedManagerName || 'Assigned Manager'}</strong>
          </p>
          {managerDecision ? (
            <div className={`p-2 rounded small border ${managerDecision.decision === 'APPROVED' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
              <strong>Decision: {managerDecision.decision}</strong>
              {managerDecision.comments && <div>Comment: "{managerDecision.comments}"</div>}
            </div>
          ) : request.status === 'PENDING_MANAGER_APPROVAL' ? (
            <div className="badge bg-warning-subtle text-warning border border-warning-subtle p-2">
              <i className="bi bi-hourglass-split me-1"></i> Awaiting manager decision
            </div>
          ) : isCancelled ? (
            <div className="text-muted small">Request was cancelled before manager review.</div>
          ) : null}
        </div>
      </div>

      {/* STEP 3: Administrator Review */}
      {!isManagerRejected && !isCancelled && (
        <div className={`timeline-step ${
          adminDecision?.decision === 'APPROVED' ? 'completed' :
          isAdminRejected ? 'rejected' :
          request.status === 'PENDING_ADMIN_APPROVAL' ? 'current' : ''
        }`}>
          <div className="timeline-circle">
            {adminDecision?.decision === 'APPROVED' ? <i className="bi bi-check-lg"></i> :
             isAdminRejected ? <i className="bi bi-x-lg"></i> :
             <i className="bi bi-shield"></i>}
          </div>
          <div className="timeline-content">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h6 className="mb-0 fw-bold">Administrator Review</h6>
              {adminDecision && (
                <span className="text-secondary small">{new Date(adminDecision.decidedAt).toLocaleString()}</span>
              )}
            </div>
            {adminDecision ? (
              <div className={`p-2 rounded small border ${adminDecision.decision === 'APPROVED' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                <strong>Decision: {adminDecision.decision}</strong> by {adminDecision.approverName}
                {adminDecision.comments && <div>Comment: "{adminDecision.comments}"</div>}
              </div>
            ) : request.status === 'PENDING_ADMIN_APPROVAL' ? (
              <div className="badge bg-primary-subtle text-primary border border-primary-subtle p-2">
                <i className="bi bi-hourglass-split me-1"></i> Awaiting final administrator authorization
              </div>
            ) : (
              <div className="text-muted small">Pending manager approval first.</div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Fulfillment / Permission Granted */}
      {!isManagerRejected && !isAdminRejected && !isCancelled && (
        <div className={`timeline-step ${isGranted ? 'completed' : ''}`}>
          <div className="timeline-circle">
            {isGranted ? <i className="bi bi-key-fill"></i> : <i className="bi bi-lock"></i>}
          </div>
          <div className="timeline-content">
            <h6 className="mb-0 fw-bold">Access Provisioned</h6>
            <p className="text-secondary small mb-0">
              {isGranted
                ? `Role "${request.roleName}" active on ${request.applicationName}. Permission record created.`
                : 'Will be activated automatically once administrator approval is signed off.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
