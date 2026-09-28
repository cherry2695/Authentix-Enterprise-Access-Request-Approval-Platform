import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const ApplicationManagementPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for New App
  const [showAppModal, setShowAppModal] = useState(false);
  const [appName, setAppName] = useState('');
  const [appCategory, setAppCategory] = useState('Sales');
  const [appDesc, setAppDesc] = useState('');

  // Modal State for New Role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetApp, setTargetApp] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');

  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.applications.getAll();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    try {
      await api.applications.create({
        name: appName,
        category: appCategory,
        description: appDesc,
        ownerId: 1
      });
      setFeedback(`Application "${appName}" created successfully.`);
      setShowAppModal(false);
      setAppName('');
      setAppDesc('');
      loadApplications();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create application');
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!targetApp) return;
    try {
      await api.applications.addRole(targetApp.id, {
        roleName: roleName.toUpperCase().trim(),
        description: roleDesc
      });
      setFeedback(`Role "${roleName.toUpperCase()}" added to ${targetApp.name}.`);
      setShowRoleModal(false);
      setRoleName('');
      setRoleDesc('');
      loadApplications();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to add role');
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Application Catalog & Role Configuration</h4>
          <p className="text-secondary small mb-0">Define organizational systems, entitlement levels, and access boundaries</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm" onClick={() => setShowAppModal(true)}>
          <i className="bi bi-plus-lg"></i>
          <span>Add New Application</span>
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
          {applications.map(app => (
            <div key={app.id} className="col-12 col-lg-6">
              <div className="access-card h-100 p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-1">
                      {app.category}
                    </span>
                    <h5 className="fw-bold text-dark mb-0">{app.name}</h5>
                  </div>
                  <span className={`badge ${app.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {app.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-secondary small mb-3 flex-grow-1">{app.description}</p>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small fw-semibold" style={{ fontSize: '0.75rem' }}>
                      CONFIGURED ROLES ({app.roles?.length || 0}):
                    </span>
                    <button
                      className="btn btn-link btn-sm text-primary text-decoration-none p-0"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => { setTargetApp(app); setShowRoleModal(true); }}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Add Role
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {app.roles?.map(r => (
                      <div key={r.id} className="p-2 border rounded bg-light-subtle d-flex justify-content-between align-items-center small">
                        <div>
                          <strong className="text-dark me-2">{r.roleName}</strong>
                          <span className="text-secondary">{r.description}</span>
                        </div>
                        <span className="badge bg-light text-success border">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE APP MODAL */}
      {showAppModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Register Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowAppModal(false)}></button>
              </div>
              <form onSubmit={handleCreateApp}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Application Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ERP Cloud, Workday"
                      value={appName}
                      onChange={e => setAppName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Category</label>
                    <select className="form-select" value={appCategory} onChange={e => setAppCategory(e.target.value)}>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Purpose of this application..."
                      value={appDesc}
                      onChange={e => setAppDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setShowAppModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Save Application</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {showRoleModal && targetApp && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Add Role to {targetApp.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowRoleModal(false)}></button>
              </div>
              <form onSubmit={handleAddRole}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Role Name</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="e.g. AUDITOR, MANAGER, SUPPORT"
                      value={roleName}
                      onChange={e => setRoleName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Role Description & Capabilities</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Describe what access this level permits..."
                      value={roleDesc}
                      onChange={e => setRoleDesc(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setShowRoleModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Add Role</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
