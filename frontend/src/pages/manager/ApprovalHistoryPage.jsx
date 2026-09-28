import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ApprovalHistoryPage = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.approvals.getTeam();
      setHistoryList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '70px',
      render: r => <span className="fw-semibold text-secondary">#{r.id}</span>
    },
    {
      header: 'Requester',
      accessor: 'requesterName',
      render: r => <span className="fw-bold text-dark">{r.requesterName}</span>
    },
    {
      header: 'Application',
      accessor: 'applicationName',
      render: r => (
        <div>
          <span className="fw-semibold text-dark d-block">{r.applicationName}</span>
          <span className="badge bg-light text-secondary border">{r.roleName}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: r => <StatusBadge status={r.status} />
    },
    {
      header: 'Justification',
      accessor: 'justification',
      render: r => (
        <div style={{ maxWidth: '300px' }} className="text-truncate text-secondary small" title={r.justification}>
          "{r.justification}"
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: 'submittedAt',
      render: r => <span className="text-secondary small">{new Date(r.submittedAt).toLocaleDateString()}</span>
    }
  ];

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Team Approval History</h4>
        <p className="text-secondary small mb-0">Historical log of all access requests and workflow decisions across your reporting chain</p>
      </div>

      <div className="access-card p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={historyList}
            searchPlaceholder="Search history by employee, application, or role..."
            emptyMessage="No team request history found."
          />
        )}
      </div>
    </div>
  );
};
