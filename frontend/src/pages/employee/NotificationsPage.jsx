import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const displayedList = filterUnread ? notifications.filter(n => !n.readStatus) : notifications;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Notifications Center</h4>
          <p className="text-secondary small mb-0">Security alerts, approval updates, and workflow notifications</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn btn-sm ${filterUnread ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterUnread(!filterUnread)}
          >
            {filterUnread ? 'Showing Unread' : 'Filter Unread'}
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllRead}>
            Mark All Read
          </button>
        </div>
      </div>

      <div className="access-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <i className="bi bi-bell-slash fs-1 d-block mb-2"></i>
            <h6>No notifications to show</h6>
            <p className="small mb-0">You are all caught up with your access workflows.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush rounded-3">
            {displayedList.map(n => (
              <div
                key={n.id}
                className={`list-group-item p-3 d-flex justify-content-between align-items-start ${!n.readStatus ? 'bg-light-subtle' : ''}`}
              >
                <div className="d-flex gap-3 align-items-start">
                  <div
                    className={`rounded-circle p-2 mt-1 d-flex align-items-center justify-content-center ${
                      n.notificationType === 'ACCESS_GRANTED' ? 'bg-success-subtle text-success' :
                      n.notificationType === 'REQUEST_REJECTED' || n.notificationType === 'ACCESS_REVOKED' ? 'bg-danger-subtle text-danger' :
                      'bg-primary-subtle text-primary'
                    }`}
                    style={{ width: '38px', height: '38px' }}
                  >
                    <i className={`bi ${
                      n.notificationType === 'ACCESS_GRANTED' ? 'bi-check-circle-fill' :
                      n.notificationType === 'REQUEST_REJECTED' ? 'bi-x-circle-fill' :
                      n.notificationType === 'ACCESS_REVOKED' ? 'bi-shield-x' : 'bi-bell-fill'
                    }`}></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0 fw-bold text-dark">{n.title}</h6>
                      {!n.readStatus && <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>NEW</span>}
                    </div>
                    <p className="text-secondary small mb-1 mt-1">{n.message}</p>
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {n.referenceId && (
                        <Link to={`/employee/requests/${n.referenceId}`} className="small text-decoration-none fw-semibold">
                          View Request #{n.referenceId}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!n.readStatus && (
                  <button
                    className="btn btn-link btn-sm text-secondary p-0"
                    title="Mark as read"
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <i className="bi bi-check2"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
