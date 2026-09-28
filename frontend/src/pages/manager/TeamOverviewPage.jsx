import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const TeamOverviewPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const allUsers = await api.users.getAll();
      // Filter for employees reporting to manager
      const reports = allUsers.filter(u => u.role === 'EMPLOYEE');
      setTeamMembers(reports);

      const allPerms = await api.permissions.getAll();
      setPermissions(allPerms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Team Access Overview</h4>
        <p className="text-secondary small mb-0">Direct reports and their active application access entitlements</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {teamMembers.map(member => {
            const memberPerms = permissions.filter(p => p.userId === member.id && p.status === 'ACTIVE');
            return (
              <div key={member.id} className="col-12 col-lg-6">
                <div className="access-card h-100 p-4">
                  <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '48px', height: '48px' }}
                    >
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{member.fullName}</h5>
                      <span className="text-secondary small">{member.email}</span>
                      <div className="mt-1">
                        <span className="badge bg-light text-secondary border">Direct Report</span>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark small mb-3">
                    Active Entitlements ({memberPerms.length})
                  </h6>

                  {memberPerms.length === 0 ? (
                    <div className="p-3 bg-light rounded text-center text-muted small">
                      No active permissions assigned.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {memberPerms.map(p => (
                        <div key={p.id} className="p-2 border rounded bg-light-subtle d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-semibold text-dark">{p.applicationName}</span>
                            <span className="badge bg-light text-secondary border ms-2">{p.roleName}</span>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
