import React from 'react';

export const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  return (
    <div className="stat-card">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-secondary small fw-medium text-uppercase tracking-wider">{title}</span>
        <div className={`stat-icon bg-${color}-subtle text-${color}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      <div className="fs-2 fw-bold text-dark">{value}</div>
      {subtitle && <div className="text-secondary small mt-1">{subtitle}</div>}
    </div>
  );
};
