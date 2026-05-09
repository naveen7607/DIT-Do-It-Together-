import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Target, Users, Star, ArrowRight, MessageSquare, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const { chats, requests, acceptRequest, rejectRequest, setActiveChat } = useChat();
  const navigate = useNavigate();

  if (!user) return null;

  // Calculate dynamic stats
  const activeSwapsCount = Object.keys(chats || {}).length;
  
  const incomingPending = requests.filter(r => r.to === user.username && r.status === 'pending');
  const recentAccepted = requests.filter(r => 
    (r.to === user.username || r.from === user.username) && r.status === 'accepted'
  ).slice(-3); // Get last 3 accepted

  // Find recent messages from others
  const recentMessages = Object.entries(chats || {})
    .map(([contact, messages]) => {
      // Find the last message from 'other'
      const lastOtherMsg = [...messages].reverse().find(m => m.sender === 'other');
      return { contact, msg: lastOtherMsg };
    })
    .filter(item => item.msg) // Only keep chats that have at least one message from them
    .sort((a, b) => b.msg.id - a.msg.id) // Sort by newest
    .slice(0, 3); // Take top 3

  const stats = [
    { label: 'Active Swaps', value: activeSwapsCount, icon: Target, color: 'var(--success)' },
    { label: 'Pending Requests', value: incomingPending.length, icon: Users, color: 'var(--accent-primary)' },
    { label: 'Rating', value: user.rating || '5.0', icon: Star, color: 'var(--warning)' },
  ];

  const handleMessageClick = (contactUsername) => {
    setActiveChat(contactUsername);
    navigate('/chat');
  };

  const aiSkillTarget = user.skillsLearning && user.skillsLearning.length > 0 
    ? user.skillsLearning[0] 
    : 'new skills';

  const aiSkillOffering = user.skillsTeaching && user.skillsTeaching.length > 0 
    ? user.skillsTeaching[0] 
    : 'your skills';

  return (
    <div className="container dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <h1>Welcome back, <span className="gradient-text">{user.name}</span>!</h1>
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
          <h2>Recent Activity</h2>
          <div className="activity-list">
            
            {incomingPending.length === 0 && recentAccepted.length === 0 && recentMessages.length === 0 && (
              <p className="text-muted" style={{padding: '20px 0'}}>No recent activity. Head over to Discover to find a partner!</p>
            )}

            {incomingPending.map(req => (
              <div key={req.id} className="activity-item">
                <div className="activity-details">
                  <div className="avatar">{req.from.charAt(0).toUpperCase()}</div>
                  <div>
                    <p><strong>{req.from.split('@')[0]}</strong> wants to swap skills with you!</p>
                    <p className="text-sm text-warning">Pending Approval</p>
                  </div>
                </div>
                <div className="activity-actions" style={{display: 'flex', gap: '8px'}}>
                  <button 
                    onClick={() => acceptRequest(req.id, req.from)}
                    style={{background: 'var(--success)', color: 'white', padding: '6px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => rejectRequest(req.id)}
                    style={{background: 'var(--danger)', color: 'white', padding: '6px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}

            {recentMessages.map(item => (
              <div key={item.msg.id} className="activity-item">
                <div className="activity-details">
                  <div className="avatar" style={{background: 'var(--accent-primary)'}}>{item.contact.charAt(0).toUpperCase()}</div>
                  <div>
                    <p>New message from <strong>{item.contact.split('@')[0]}</strong></p>
                    <p className="text-sm text-muted">"{item.msg.text.length > 30 ? item.msg.text.substring(0, 30) + '...' : item.msg.text}"</p>
                  </div>
                </div>
                <div className="activity-actions">
                  <button 
                    onClick={() => handleMessageClick(item.contact)}
                    className="btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={16} /> Reply
                  </button>
                </div>
              </div>
            ))}

            {recentAccepted.map(req => {
              const partnerUsername = req.to === user.username ? req.from : req.to;
              // Don't show the accepted notification if we already show a message from them
              if (recentMessages.some(m => m.contact === partnerUsername)) return null;

              return (
                <div key={req.id} className="activity-item">
                  <div className="activity-details">
                    <div className="avatar" style={{background: 'var(--success)'}}>{partnerUsername.charAt(0).toUpperCase()}</div>
                    <div>
                      <p>Swap accepted with <strong>{partnerUsername.split('@')[0]}</strong></p>
                      <p className="text-sm text-success">Ready to chat</p>
                    </div>
                  </div>
                  <div className="activity-actions">
                    <button 
                      onClick={() => handleMessageClick(partnerUsername)}
                      className="btn-secondary" 
                      style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={16} /> Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ai-suggestion-card glass-panel">
          <div className="card-header">
            <h2>AI Assistant</h2>
            <div className="sparkle-badge">Powered by Gemini</div>
          </div>
          <p>Based on your profile, we found people looking for <strong>{aiSkillOffering}</strong> who can teach you <strong>{aiSkillTarget}</strong>.</p>
          <Link to="/ai-assistant" className="btn-primary w-full mt-4">
            See AI Matches <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
