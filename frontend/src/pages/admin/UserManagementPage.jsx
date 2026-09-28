import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState('EMPLOYEE');
  const [managerId, setManagerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll();
      setUsers(data);
      const mgrList = await api.users.getManagers();
      setManagers(mgrList);
      if (mgrList.length > 0 && !managerId) {
        setManagerId(mgrList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.users.create({
        fullName,
        email,
        password,
        role,
        managerId: managerId ? Number(managerId) : null
      });
      setFeedback(`User ${fullName} (${email}) created successfully.`);
      setShowCreateModal(false);
      setFullName('');
      setEmail('');
      loadUsers();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.users.toggleStatus(user.id);
      setFeedback(`Status for ${user.fullName} updated to ${!user.active ? 'ACTIVE' : 'DEACTIVATED'}.`);
      loadUsers();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update user status');
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'fullName',
      render: r => (
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
          >
            {r.fullName.charAt(0)}
          </div>
          <div>
            <div className="fw-bold text-dark">{r.fullName}</div>
            <span className="text-secondary small">{r.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: r => (
        <span className={`badge ${
          r.role === 'ADMIN' ? 'bg-primary-subtle text-primary border border-primary-subtle' :
          r.role === 'MANAGER' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
          'bg-secondary-subtle text-secondary border'
        }`}>
          {r.role}
        </span>
      )
    },
    {
      header: 'Reporting Manager',
      accessor: 'managerName',
      render: r => <span className="text-secondary small">{r.managerName || '—'}</span>
    },
    {
      header: 'Status',
      accessor: 'active',
      render: r => (
        <span className={`badge ${r.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
          {r.active ? 'Active' : 'Deactivated'}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: r => (
        <button
          className={`btn btn-sm ${r.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
          onClick={() => handleToggleStatus(r)}
        >
          {r.active ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">User & Identity Management</h4>
          <p className="text-secondary small mb-0">Manage enterprise directory identities, role assignments, and reporting lines</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-person-plus"></i>
          <span>Create New User</span>
        </button>
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
            data={users}
            searchPlaceholder="Search users by name, email, or role..."
          />
        )}
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Add New Directory User</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Jane Smith"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Corporate Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jane.smith@accessflow.io"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Temporary Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Assigned Role</label>
                      <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Reporting Manager</label>
                      <select className="form-select" value={managerId} onChange={e => setManagerId(e.target.value)}>
                        <option value="">None / Self</option>
                        {managers.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Save User'}
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
