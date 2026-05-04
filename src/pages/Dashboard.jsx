import { useAuth } from '../context/AuthContext';
import { Target, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Skills Learned', value: '2', icon: Target, color: 'var(--success)' },
    { label: 'People Helped', value: '5', icon: Users, color: 'var(--accent-primary)' },
    { label: 'Rating', value: user?.rating || 'New', icon: Star, color: 'var(--warning)' },
  ];

  return (
    <div className="container dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <h1>Welcome back, <span className="gradient-text">{user?.name}</span>!</h1>
        <p>Ready to learn something new today?</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card glass-panel">
            <div className="stat-icon" style={{ color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-activity glass-panel">
          <h2>Recent Requests</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-details">
                <div className="avatar">R</div>
                <div>
                  <p><strong>Rahul</strong> wants to learn <strong>React</strong></p>
                  <p className="text-sm">He can teach you <strong>Python</strong></p>
                </div>
              </div>
              <div className="activity-actions">
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Accept</button>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-details">
                <div className="avatar">S</div>
                <div>
                  <p><strong>Sneha</strong> accepted your request for <strong>UI/UX</strong></p>
                  <p className="text-sm text-success">Ready to chat</p>
                </div>
              </div>
              <div className="activity-actions">
                <Link to="/chat" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Message</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="ai-suggestion-card glass-panel">
          <div className="card-header">
            <h2>AI Assistant</h2>
            <div className="sparkle-badge">Powered by Gemini</div>
          </div>
          <p>Based on your profile, we found 3 people looking for React who can teach you Python.</p>
          <Link to="/ai-assistant" className="btn-primary w-full mt-4">
            See AI Matches <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
