import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Star, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import './Matching.css';

export const Matching = () => {
  const { user } = useAuth();
  const { requests, sendRequest } = useChat();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // Fetch real users from local DB
    const dbData = localStorage.getItem('dit_users_db');
    if (dbData) {
      setAllUsers(JSON.parse(dbData));
    }
  }, []);

  // Calculate dynamic match percent
  const calculateMatch = (otherUser) => {
    if (!user || !user.skillsLearning || user.skillsLearning.length === 0) return 0;
    if (!otherUser.skillsTeaching || otherUser.skillsTeaching.length === 0) return 0;
    
    // Intersection of what I want to learn and what they teach
    const matchCount = user.skillsLearning.filter(skill => 
      otherUser.skillsTeaching.map(s => s.toLowerCase()).includes(skill.toLowerCase())
    ).length;

    // Base percentage from direct matches (Max 70%)
    let percent = Math.min((matchCount / user.skillsLearning.length) * 70, 70);

    // Give a 30% baseline if they teach something, otherwise random bump to avoid zero
    percent += 30; 

    return Math.floor(percent);
  };

  const displayUsers = useMemo(() => {
    if (!user) return [];
    
    return allUsers
      .filter(u => u.username !== user.username) // Hide myself
      .filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   u.skillsTeaching?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
      .map(u => ({
        ...u,
        matchPercent: calculateMatch(u)
      }))
      .sort((a, b) => b.matchPercent - a.matchPercent); // Sort highest match first
  }, [allUsers, searchTerm, user]);

  const handleRequest = (targetUsername) => {
    sendRequest(targetUsername);
  };

  const getRequestStatus = (targetUsername) => {
    if (!user) return null;
    const req = requests.find(r => r.from === user.username && r.to === targetUsername);
    return req ? req.status : null; // 'pending', 'accepted', 'rejected'
  };

  return (
    <div className="container matching-container animate-fade-in">
      <header className="matching-header">
        <h1>Discover Skills</h1>
        <p>Find the perfect partner to exchange skills with.</p>
      </header>

      <div className="search-bar glass-panel">
        <div className="search-input-wrapper">
          <SearchIcon className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by skill, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn-secondary filter-btn">
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      <div className="matches-grid">
        {displayUsers.length === 0 ? (
          <div className="empty-state">No other users found matching your criteria.</div>
        ) : (
          displayUsers.map(matchUser => {
            const status = getRequestStatus(matchUser.username);

            return (
              <div key={matchUser.id} className="match-card glass-panel">
                <div className="match-header">
                  <div className="match-user-info">
                    <div className="avatar">{matchUser.name.charAt(0)}</div>
                    <div>
                      <h3>{matchUser.name}</h3>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>@{matchUser.username.split('@')[0]}</p>
                      <div className="user-meta">
                        <span className="rating"><Star size={14} fill="var(--warning)" color="var(--warning)" /> {matchUser.rating || 5.0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="match-percentage">
                    {matchUser.matchPercent}% Match
                  </div>
                </div>

                <div className="skills-section">
                  <div className="skill-group">
                    <h4>Teaches</h4>
                    <div className="skill-tags">
                      {matchUser.skillsTeaching?.length > 0 ? matchUser.skillsTeaching.map(skill => (
                        <span key={skill} className="tag tag-primary">{skill}</span>
                      )) : <span className="text-muted text-sm">No skills listed yet</span>}
                    </div>
                  </div>
                  <div className="skill-group">
                    <h4>Wants to Learn</h4>
                    <div className="skill-tags">
                      {matchUser.skillsLearning?.length > 0 ? matchUser.skillsLearning.map(skill => (
                        <span key={skill} className="tag tag-secondary">{skill}</span>
                      )) : <span className="text-muted text-sm">No skills listed yet</span>}
                    </div>
                  </div>
                </div>

                <div className="match-actions">
                  {status === 'pending' ? (
                    <button className="btn-secondary w-full" disabled>
                      <Check size={16} style={{marginRight: '8px'}} /> Requested
                    </button>
                  ) : status === 'accepted' ? (
                    <button className="btn-primary w-full" onClick={() => navigate('/chat')}>
                      Chat Now
                    </button>
                  ) : (
                    <button className="btn-primary w-full" onClick={() => handleRequest(matchUser.username)}>
                      <UserPlus size={16} style={{marginRight: '8px'}} /> Request Swap
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
