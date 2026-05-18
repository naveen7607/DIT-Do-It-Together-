import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, UserX, MessageSquare, Check, Trash2 } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Load reports from localStorage
    const savedReports = localStorage.getItem('dit_reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      // Seed default mock reports for presentation
      const defaultReports = [
        { id: 'r_seed1', user: 'rahul@dit.com', reason: 'Used inappropriate tone in skill exchange chat', reportedBy: 'sneha@dit.com', status: 'pending', time: new Date().toLocaleDateString() },
        { id: 'r_seed2', user: 'amit@dit.com', reason: 'Repeatedly cancelled scheduled skill swaps without notice', reportedBy: 'priya@dit.com', status: 'pending', time: new Date().toLocaleDateString() },
      ];
      localStorage.setItem('dit_reports', JSON.stringify(defaultReports));
      setReports(defaultReports);
    }
  }, []);

  const handleAction = (id, action) => {
    // Update report list and save to localStorage
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        applyUserPenalty(report.user, action, report.reason);
        return { ...report, status: action };
      }
      return report;
    });
    setReports(updatedReports);
    localStorage.setItem('dit_reports', JSON.stringify(updatedReports));
  };

  const applyUserPenalty = (username, action, reason) => {
    const db = localStorage.getItem('dit_users_db');
    if (!db) return;
    
    let users = JSON.parse(db);
    
    if (action === 'warned') {
      // Set warned flags on the user in the database
      users = users.map(u => {
        if (u.username === username) {
          return {
            ...u,
            warned: true,
            warningReason: reason,
            warnings: (u.warnings || 0) + 1
          };
        }
        return u;
      });
      localStorage.setItem('dit_users_db', JSON.stringify(users));
      alert(`User @${username.split('@')[0]} has been warned successfully.`);
    } else if (action === 'banned') {
      // Ban/Delete user from database
      users = users.filter(u => u.username !== username);
      localStorage.setItem('dit_users_db', JSON.stringify(users));
      alert(`User @${username.split('@')[0]} has been permanently banned and removed.`);
    }
  };

  const clearResolved = () => {
    const pendingOnly = reports.filter(r => r.status === 'pending');
    setReports(pendingOnly);
    localStorage.setItem('dit_reports', JSON.stringify(pendingOnly));
    alert('Cleared all resolved safety reports.');
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
          {reports.some(r => r.status !== 'pending') && (
            <button className="btn-secondary" onClick={clearResolved} style={{ marginLeft: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={16} /> Clear Resolved
            </button>
          )}
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h3>{report.user.split('@')[0]}</h3>
                    <span className="user-email-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{report.user}</span>
                  </div>
                </div>
                <span className={`status-badge ${report.status}`}>{report.status}</span>
              </div>
              
              <div className="report-details">
                <p><strong>Reason:</strong> {report.reason}</p>
                <p><strong>Reported by:</strong> {report.reportedBy.split('@')[0]}</p>
                {report.time && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><strong>Date:</strong> {report.time}</p>}
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
          {reports.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No safety reports currently on file.</p>}
        </div>
      </div>
    </div>
  );
};
