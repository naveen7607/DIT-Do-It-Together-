import { useState } from 'react';
import { Shield, AlertTriangle, UserX, MessageSquare, Check } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [reports, setReports] = useState([
    { id: 1, user: 'John Doe', reason: 'Spamming messages', reportedBy: 'Rahul', status: 'pending' },
    { id: 2, user: 'FakeUser99', reason: 'Inappropriate language', reportedBy: 'Sneha', status: 'pending' },
  ]);

  const handleAction = (id, action) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, status: action } : report
    ));
    // In real app, this would update the backend/DB
  };

  return (
    <div className="container admin-container animate-fade-in">
      <div className="admin-header glass-panel">
        <div className="header-title">
          <Shield size={32} className="text-primary" />
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage platform safety and user reports.</p>
          </div>
        </div>
        <div className="admin-stats">
          <div className="stat">
            <span className="stat-value text-warning">{reports.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pending Reports</span>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <h2>Recent Reports</h2>
        <div className="reports-grid">
          {reports.map(report => (
            <div key={report.id} className={`report-card glass-panel ${report.status !== 'pending' ? 'resolved' : ''}`}>
              <div className="report-header">
                <div className="reported-user">
                  <AlertTriangle size={20} className={report.status === 'pending' ? 'text-danger' : 'text-success'} />
                  <h3>{report.user}</h3>
                </div>
                <span className={`status-badge ${report.status}`}>{report.status}</span>
              </div>
              
              <div className="report-details">
                <p><strong>Reason:</strong> {report.reason}</p>
                <p><strong>Reported by:</strong> {report.reportedBy}</p>
              </div>

              {report.status === 'pending' && (
                <div className="report-actions">
                  <button className="btn-secondary w-full" onClick={() => handleAction(report.id, 'warned')}>
                    <MessageSquare size={16} /> Send Warning
                  </button>
                  <button className="btn-danger w-full" onClick={() => handleAction(report.id, 'banned')}>
                    <UserX size={16} /> Ban User
                  </button>
                  <button className="btn-success w-full" onClick={() => handleAction(report.id, 'dismissed')}>
                    <Check size={16} /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
          {reports.length === 0 && <p>No reports to show.</p>}
        </div>
      </div>
    </div>
  );
};
