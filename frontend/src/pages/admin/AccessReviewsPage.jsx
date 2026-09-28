import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AccessReviewsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [dueDate, setDueDate] = useState('2026-10-31');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.reviews.getAll();
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaign) {
        setSelectedCampaign(data[0]);
        loadItems(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (campaignId) => {
    try {
      const itemList = await api.reviews.getItems(campaignId);
      setItems(itemList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCampaign = (c) => {
    setSelectedCampaign(c);
    loadItems(c.id);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newCamp = await api.reviews.create({
        campaignName,
        description: campaignDesc,
        startDate,
        dueDate
      });
      setFeedback(`Campaign "${campaignName}" initiated with ${newCamp.totalItems} active entitlements.`);
      setShowCreateModal(false);
      setCampaignName('');
      setCampaignDesc('');
      loadCampaigns();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to initiate campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemDecision = async (itemId, decision) => {
    if (!selectedCampaign) return;
    const comment = prompt(`Enter review comment for ${decision === 'APPROVED_RETAIN' ? 'retaining' : 'revoking'} this access:`) || 'Reviewed in access certification';
    try {
      await api.reviews.submitDecision(selectedCampaign.id, itemId, decision, comment);
      setFeedback(`Decision submitted: ${decision}`);
      loadItems(selectedCampaign.id);
      loadCampaigns();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to record decision');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Access Review Campaigns</h4>
          <p className="text-secondary small mb-0">Periodic certification of employee entitlements for security compliance and audit readiness</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-calendar-plus"></i>
          <span>Initiate Review Campaign</span>
        </button>
      </div>

      {feedback && (
        <div className="alert alert-success alert-dismissible fade show py-2 small mb-3">
          <i className="bi bi-check-circle-fill me-2"></i> {feedback}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {/* CAMPAIGNS LIST */}
          <div className="col-12 col-lg-4">
            <h6 className="fw-bold text-dark mb-3">Certification Campaigns</h6>
            <div className="d-flex flex-column gap-3">
              {campaigns.map(c => {
                const total = c.totalItems || 1;
                const completed = (c.approvedItems || 0) + (c.revokedItems || 0);
                const percent = Math.round((completed / total) * 100) || 0;
                const isSelected = selectedCampaign?.id === c.id;

                return (
                  <div
                    key={c.id}
                    className={`access-card p-3 cursor-pointer ${isSelected ? 'border-primary shadow-sm bg-light-subtle' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelectCampaign(c)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold text-dark mb-0">{c.campaignName}</h6>
                      <span className={`badge ${c.status === 'COMPLETED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-secondary small mb-3">{c.description}</p>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between small text-secondary mb-1">
                        <span>Progress</span>
                        <span>{percent}% ({completed}/{total})</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                    <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      Due: {c.dueDate} · Initiated by {c.createdByName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CAMPAIGN ITEMS AUDIT WORKBENCH */}
          <div className="col-12 col-lg-8">
            {selectedCampaign ? (
              <div className="access-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">{selectedCampaign.campaignName}</h5>
                    <span className="text-secondary small">Review items for active permissions in scope</span>
                  </div>
                  <span className="badge bg-light text-dark border">
                    {items.length} Entitlements in Campaign
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table table-custom align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Application & Role</th>
                        <th>Decision</th>
                        <th className="text-end">Certification Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted small">No items in this campaign.</td>
                        </tr>
                      ) : (
                        items.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div className="fw-bold text-dark">{item.userName}</div>
                              <span className="text-secondary small">{item.userEmail}</span>
                            </td>
                            <td>
                              <span className="fw-semibold text-dark">{item.applicationName}</span>
                              <span className="badge bg-light text-secondary border ms-2">{item.roleName}</span>
                            </td>
                            <td>
                              <StatusBadge status={item.decision} />
                            </td>
                            <td className="text-end">
                              {item.decision === 'PENDING' ? (
                                <div className="d-flex justify-content-end gap-2">
                                  <button
                                    className="btn btn-outline-success btn-sm px-2 py-1"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => handleItemDecision(item.id, 'APPROVED_RETAIN')}
                                  >
                                    <i className="bi bi-check-lg me-1"></i> Retain
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm px-2 py-1"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => handleItemDecision(item.id, 'FLAGGED_FOR_REVOCATION')}
                                  >
                                    <i className="bi bi-x-lg me-1"></i> Revoke
                                  </button>
                                </div>
                              ) : (
                                <span className="text-secondary small">
                                  Reviewed {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="access-card p-5 text-center text-muted">
                Select a campaign on the left to inspect certification items.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Initiate Access Certification Campaign</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCampaign}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Campaign Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Q4 2026 SOC 2 Access Certification"
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Audit goals and compliance scope..."
                      value={campaignDesc}
                      onChange={e => setCampaignDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-text small">
                    This will automatically populate review items for all currently ACTIVE permissions enterprise-wide.
                  </div>
                </div>
                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4" disabled={submitting}>
                    {submitting ? 'Initiating...' : 'Launch Campaign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
