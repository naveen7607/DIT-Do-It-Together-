import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, MessageSquare, User, LogOut, Sparkles, Shield } from 'lucide-react';
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
        <Outlet />
      </main>
    </div>
  );
};
