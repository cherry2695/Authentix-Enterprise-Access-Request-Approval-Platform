import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.dashboard.getEmployee();
      setStats(data);
    } catch (err) {
      console.error('Failed to load employee dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-secondary small mt-2">Loading your governance dashboard...</div>
      </div>
    );
  }

  const chartData = [
    { name: 'Pending', value: Number(stats?.pendingRequests || 0), color: '#f59e0b' },
    { name: 'Approved', value: Number(stats?.approvedRequests || 0), color: '#10b981' },
    { name: 'Rejected', value: Number(stats?.rejectedRequests || 0), color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Employee Access Center</h4>
          <p className="text-secondary small mb-0">
            Request, track, and manage your enterprise application permissions
          </p>
        </div>
        <Link to="/employee/catalog" className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3">
          <i className="bi bi-plus-circle"></i>
          <span>Request New Access</span>
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Requests"
            value={stats?.totalRequests || 0}
            icon="bi-send"
            color="primary"
            subtitle="Lifetime access requests"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingRequests || 0}
            icon="bi-hourglass-split"
            color="warning"
            subtitle="Awaiting manager or admin"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Granted Access"
            value={stats?.approvedRequests || 0}
            icon="bi-check-circle"
            color="success"
            subtitle="Successfully approved"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Permissions"
            value={stats?.activePermissions || 0}
            icon="bi-key"
            color="info"
            subtitle="Current live entitlements"
          />
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="row g-4 mb-4">
        {/* RECENT REQUESTS TABLE */}
        <div className="col-12 col-lg-8">
          <div className="access-card h-100">
            <div className="access-card-header">
              <h6 className="fw-bold mb-0 text-dark">Recent Access Requests</h6>
              <Link to="/employee/requests" className="small text-decoration-none fw-semibold">
                View All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="p-0 table-responsive">
              <table className="table table-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!stats?.recentRequests || stats.recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        No access requests found. Browse the catalog to request access.
                      </td>
                    </tr>
                  ) : (
                    stats.recentRequests.map(req => (
                      <tr key={req.id}>
                        <td className="fw-semibold text-dark">{req.applicationName}</td>
                        <td><span className="badge bg-light text-secondary border">{req.roleName}</span></td>
                        <td><StatusBadge status={req.status} /></td>
                        <td className="text-secondary small">
                          {new Date(req.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="text-end">
                          <Link to={`/employee/requests/${req.id}`} className="btn btn-outline-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* REQUESTS STATUS CHART */}
        <div className="col-12 col-lg-4">
          <div className="access-card h-100 p-3">
            <h6 className="fw-bold mb-3 text-dark">Request Status Breakdown</h6>
            {chartData.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center h-75 text-muted small">
                No request statistics yet
              </div>
            ) : (
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="border-top pt-3 mt-2 text-center text-secondary small">
              Real-time synchronization with multi-level approval pipeline
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT ACTIVE PERMISSIONS */}
      <div className="access-card">
        <div className="access-card-header">
          <h6 className="fw-bold mb-0 text-dark">Active Entitlements & Permissions</h6>
          <Link to="/employee/permissions" className="small text-decoration-none fw-semibold">
            Manage Permissions <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div className="p-3">
          {!stats?.activePermissionsList || stats.activePermissionsList.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              You currently do not have any active permissions assigned.
            </div>
          ) : (
            <div className="row g-3">
              {stats.activePermissionsList.map(perm => (
                <div key={perm.id} className="col-12 col-md-6 col-lg-4">
                  <div className="p-3 border rounded-3 bg-light-subtle d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold text-dark">{perm.applicationName}</div>
                      <div className="text-secondary small">Access Level: <strong>{perm.roleName}</strong></div>
                      <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                        Granted: {new Date(perm.grantedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
