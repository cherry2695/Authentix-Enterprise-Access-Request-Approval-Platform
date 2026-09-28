import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const CatalogPage = () => {
  const [applications, setApplications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const data = await api.applications.getAll(selectedCategory, searchQuery);
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequestModal = (app) => {
    setSelectedApp(app);
    setSelectedRoleId(app.roles && app.roles.length > 0 ? app.roles[0].id : '');
    setJustification('');
    setSubmitError('');
    setSubmitSuccess('');
    setShowModal(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedRoleId) {
      setSubmitError('Please select an access role.');
      return;
    }
    if (!justification.trim()) {
      setSubmitError('Business justification is required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await api.requests.create({
        applicationId: selectedApp.id,
        applicationRoleId: Number(selectedRoleId),
        justification: justification.trim()
      });
      setSubmitSuccess('Access request submitted successfully! Routed to your manager.');
      setTimeout(() => {
        setShowModal(false);
        navigate('/employee/requests');
      }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', 'Sales', 'HR', 'Finance', 'Operations'];

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Application Catalog</h4>
          <p className="text-secondary small mb-0">Browse organizational systems and request authorized access credentials</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="access-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                type="text"
                className="form-control ps-5 py-2 rounded-3 border"
                placeholder="Search applications by name or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-7">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm rounded-pill px-3 ${
                    (cat === 'All' && !selectedCategory) || selectedCategory === cat
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* APPLICATIONS GRID */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="access-card p-5 text-center text-muted">
          <i className="bi bi-search fs-1 mb-2 d-block"></i>
          <h6>No applications found</h6>
          <p className="small mb-0">Try changing your search term or category filter.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredApps.map(app => (
            <div key={app.id} className="col-12 col-md-6 col-xl-4">
              <div className="access-card h-100 d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
                      {app.category}
                    </span>
                    <h5 className="fw-bold text-dark mb-1">{app.name}</h5>
                  </div>
                  <div
                    className="rounded-3 bg-light text-primary d-flex align-items-center justify-content-center p-2 border"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="bi bi-window fs-5"></i>
                  </div>
                </div>

                <p className="text-secondary small flex-grow-1 mb-3" style={{ minHeight: '44px' }}>
                  {app.description}
                </p>

                <div className="border-top pt-3 mt-auto">
                  <div className="text-muted small fw-semibold mb-2" style={{ fontSize: '0.75rem' }}>
                    AVAILABLE ROLES:
                  </div>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {app.roles && app.roles.length > 0 ? (
                      app.roles.map(r => (
                        <span key={r.id} className="badge bg-light text-secondary border">
                          {r.roleName}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">Standard Viewer</span>
                    )}
                  </div>

                  <button
                    className="btn btn-outline-primary w-100 py-2 rounded-3 small fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleOpenRequestModal(app)}
                  >
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Request Access</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUEST ACCESS MODAL */}
      {showModal && selectedApp && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Request Access: {selectedApp.name}</h5>
                  <span className="text-secondary small">{selectedApp.category} Application</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmitRequest}>
                <div className="modal-body p-4">
                  {submitError && (
                    <div className="alert alert-danger py-2 small mb-3">
                      {submitError}
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="alert alert-success py-2 small mb-3">
                      {submitSuccess}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Target Access Role</label>
                    <select
                      className="form-select rounded-3 py-2"
                      value={selectedRoleId}
                      onChange={e => setSelectedRoleId(e.target.value)}
                      required
                    >
                      {selectedApp.roles?.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.roleName} — {role.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Business Justification <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Explain why this access is required for your project or operational responsibilities..."
                      value={justification}
                      onChange={e => setJustification(e.target.value)}
                      required
                    ></textarea>
                    <div className="form-text small">
                      Your assigned manager will review this justification before administrative provisioning.
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
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
