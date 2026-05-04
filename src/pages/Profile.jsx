import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Edit2, Save, MapPin, Globe, Book, Code, Link as LinkIcon, Briefcase } from 'lucide-react';
import './Profile.css';

export const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || 'I love teaching and learning new things.',
    location: 'Hyderabad, India',
    language: 'English, Hindi',
    teaching: user?.skillsTeaching?.join(', ') || 'React, JavaScript',
    learning: user?.skillsLearning?.join(', ') || 'UI/UX, Python',
    experience: 'Intermediate',
    github: 'https://github.com/username',
    portfolio: 'https://myportfolio.com'
  });

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Mock save to local storage/backend
    setIsEditing(false);
  };

  return (
    <div className="container profile-container animate-fade-in">
      <div className="profile-header glass-panel">
        <div className="profile-cover">
          <button className="edit-cover-btn"><Camera size={16} /> Edit Cover</button>
        </div>
        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {profileData.name.charAt(0) || 'U'}
            </div>
            <button className="edit-avatar-btn"><Camera size={14} /></button>
          </div>
          
          <div className="profile-title-area">
            <div className="title-left">
              {isEditing ? (
                <input 
                  type="text" 
                  name="name" 
                  value={profileData.name} 
                  onChange={handleChange} 
                  className="edit-input title-input"
                />
              ) : (
                <h1>{profileData.name}</h1>
              )}
              <div className="profile-meta">
                <span><MapPin size={16} /> {profileData.location}</span>
                <span><Globe size={16} /> {profileData.language}</span>
              </div>
            </div>
            <div className="title-right">
              {isEditing ? (
                <button className="btn-primary" onClick={handleSave}>
                  <Save size={16} /> Save Profile
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-main-col">
          <div className="glass-panel profile-card">
            <h2>About Me</h2>
            {isEditing ? (
              <textarea 
                name="bio" 
                value={profileData.bio} 
                onChange={handleChange}
                className="edit-textarea"
                rows="4"
              />
            ) : (
              <p>{profileData.bio}</p>
            )}
          </div>

          <div className="glass-panel profile-card">
            <h2>Skills Exchange</h2>
            
            <div className="skills-section-edit">
              <div className="skill-group-edit">
                <h3><Book size={18} className="text-primary" /> What I can teach</h3>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="teaching" 
                    value={profileData.teaching} 
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="skill-tags">
                    {profileData.teaching.split(',').map(s => (
                      <span key={s} className="tag tag-primary">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="skill-group-edit mt-4">
                <h3><Book size={18} className="text-secondary" /> What I want to learn</h3>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="learning" 
                    value={profileData.learning} 
                    onChange={handleChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="skill-tags">
                    {profileData.learning.split(',').map(s => (
                      <span key={s} className="tag tag-secondary">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-side-col">
          <div className="glass-panel profile-card">
            <h2>Professional Links</h2>
            <div className="link-row mt-4">
              <Code size={18} className="text-secondary" />
              {isEditing ? (
                <input type="text" name="github" value={profileData.github} onChange={handleChange} className="edit-input m-0" />
              ) : (
                <a href={profileData.github} target="_blank" rel="noreferrer" className="profile-link">{profileData.github}</a>
              )}
            </div>
            <div className="link-row">
              <LinkIcon size={18} className="text-primary" />
              {isEditing ? (
                <input type="text" name="portfolio" value={profileData.portfolio} onChange={handleChange} className="edit-input m-0" />
              ) : (
                <a href={profileData.portfolio} target="_blank" rel="noreferrer" className="profile-link">{profileData.portfolio}</a>
              )}
            </div>
            <div className="link-row">
              <Briefcase size={18} className="text-warning" />
              {isEditing ? (
                <select name="experience" value={profileData.experience} onChange={handleChange} className="edit-input m-0">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              ) : (
                <span>{profileData.experience}</span>
              )}
            </div>
          </div>

          <div className="glass-panel profile-card">
            <h2>Stats</h2>
            <div className="stat-row">
              <span>Rating</span>
              <strong>{user?.rating || '4.8'} ⭐</strong>
            </div>
            <div className="stat-row">
              <span>Sessions Completed</span>
              <strong>12</strong>
            </div>
            <div className="stat-row">
              <span>Hours Taught</span>
              <strong>24h</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
