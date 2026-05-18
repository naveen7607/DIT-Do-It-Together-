import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, MessageSquare, User, LogOut, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import './Layout.css';
import { CallPopup } from '../components/CallPopup';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      {user && (
        <nav className="navbar glass-panel">
          <div className="nav-brand">
            <Link to="/" className="brand-logo gradient-text">DIT</Link>
          </div>
          <div className="nav-links">
            <Link to="/learning" className="nav-item">
              <Home size={20} />
              <span>My Learning</span>
            </Link>
            <Link to="/matching" className="nav-item">
              <Search size={20} />
              <span>Discover</span>
            </Link>
            <Link to="/ai-assistant" className="nav-item">
              <Sparkles size={20} className="sparkle-icon" />
              <span>AI Match</span>
            </Link>
            <Link to="/chat" className="nav-item">
              <MessageSquare size={20} />
              <span>Chat</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <User size={20} />
              <span>Profile</span>
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-item">
                <Shield size={20} className="text-danger" />
                <span>Admin</span>
              </Link>
            )}
          </div>
          <div className="nav-actions">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
            </button>
          </div>
        </nav>
      )}
      {/* Global Call Popup appears on all pages */}
      <CallPopup />
      <main className="main-content">
        {user?.warned && (
          <div className="admin-warning-banner animate-fade-in" style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
            backdropFilter: 'blur(8px)'
          }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Account Warning from Administrator</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.4' }}>
                Your account was flagged for: <strong>"{user.warningReason || 'Terms of Service Violation'}"</strong>. Continued violations will result in permanent suspension.
              </p>
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};
