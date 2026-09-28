import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApprovalTimeline } from '../../components/common/ApprovalTimeline';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

export const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadRequestDetails();
  }, [id]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const reqData = await api.requests.getById(id);
      setRequest(reqData);

      const histData = await api.approvals.getHistory(id);
      setHistory(histData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.requests.cancel(id);
      setShowCancelModal(false);
      loadRequestDetails();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="alert alert-danger">
        Request not found. <Link to="/employee/requests">Back to requests</Link>
      </div>
    );
  }

  const isPending = request.status === 'PENDING_MANAGER_APPROVAL' || request.status === 'PENDING_ADMIN_APPROVAL';

  return (
    <div>
      <div className="mb-4">
        <Link to="/employee/requests" className="text-decoration-none text-secondary small d-inline-flex align-items-center gap-1 mb-2">
          <i className="bi bi-arrow-left"></i> Back to My Requests
        </Link>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-3">
              <h4 className="fw-bold text-dark mb-0">Request #{request.id}</h4>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-secondary small mb-0 mt-1">
              {request.applicationName} — Role: <strong>{request.roleName}</strong>
            </p>
          </div>

          {isPending && (
            <button className="btn btn-outline-danger btn-sm px-3" onClick={() => setShowCancelModal(true)}>
              <i className="bi bi-x-circle me-1"></i> Cancel Request
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: REQUEST METADATA & JUSTIFICATION */}
        <div className="col-12 col-lg-5">
          <div className="access-card p-4 mb-4">
            <h6 className="fw-bold text-dark mb-3">Request Metadata</h6>
            <div className="d-flex flex-column gap-3 small">
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Application</span>
                <span className="fw-semibold text-dark">{request.applicationName}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Requested Role</span>
                <span className="badge bg-light text-secondary border">{request.roleName}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Requester</span>
                <span className="fw-semibold text-dark">{request.requesterName}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Assigned Approver</span>
                <span className="fw-semibold text-dark">{request.assignedManagerName || 'Mia Manager'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2">
                <span className="text-secondary">Submission Date</span>
                <span className="text-dark">{new Date(request.submittedAt).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Last Modified</span>
                <span className="text-dark">{new Date(request.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="access-card p-4">
            <h6 className="fw-bold text-dark mb-2">Business Justification</h6>
            <div className="bg-light p-3 rounded-3 border text-secondary small">
              "{request.justification}"
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: APPROVAL WORKFLOW TIMELINE */}
        <div className="col-12 col-lg-7">
          <div className="access-card p-4 h-100">
            <h6 className="fw-bold text-dark mb-3">Multi-Level Approval Pipeline</h6>
            <ApprovalTimeline request={request} history={history} />
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this pending access request?"
        confirmText="Cancel Request"
        confirmVariant="danger"
      />
    </div>
  );
};
