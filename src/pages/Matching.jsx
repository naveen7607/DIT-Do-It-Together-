import { useState } from 'react';
import { Search as SearchIcon, Filter, MapPin, Star } from 'lucide-react';
import './Matching.css';

export const Matching = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for matching
  const matches = [
    { id: 1, name: 'Priya Sharma', teaching: ['Python', 'Data Science'], learning: ['React', 'CSS'], rating: 4.9, location: 'Online', matchPercent: 95 },
    { id: 2, name: 'Arjun Reddy', teaching: ['UI/UX', 'Figma'], learning: ['JavaScript'], rating: 4.7, location: 'Hyderabad', matchPercent: 88 },
    { id: 3, name: 'Neha Gupta', teaching: ['English', 'Communication'], learning: ['Python'], rating: 4.5, location: 'Online', matchPercent: 70 },
  ];

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
            placeholder="Search by skill, name, or category..."
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
        {matches.map(match => (
          <div key={match.id} className="match-card glass-panel">
            <div className="match-header">
              <div className="match-user-info">
                <div className="avatar">{match.name.charAt(0)}</div>
                <div>
                  <h3>{match.name}</h3>
                  <div className="user-meta">
                    <span className="rating"><Star size={14} fill="var(--warning)" color="var(--warning)" /> {match.rating}</span>
                    <span className="location"><MapPin size={14} /> {match.location}</span>
                  </div>
                </div>
              </div>
              <div className="match-percentage">
                {match.matchPercent}% Match
              </div>
            </div>

            <div className="skills-section">
              <div className="skill-group">
                <h4>Teaches</h4>
                <div className="skill-tags">
                  {match.teaching.map(skill => (
                    <span key={skill} className="tag tag-primary">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="skill-group">
                <h4>Wants to Learn</h4>
                <div className="skill-tags">
                  {match.learning.map(skill => (
                    <span key={skill} className="tag tag-secondary">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="match-actions">
              <button className="btn-primary w-full">Request Swap</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
