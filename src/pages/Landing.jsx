import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Users, Zap } from 'lucide-react';
import './Landing.css';

export const Landing = () => {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav glass-panel animate-fade-down">
        <div className="nav-brand">
          <span className="brand-logo gradient-text">DIT</span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/login?mode=signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <Sparkles size={16} className="text-primary" />
            <span>A new way to learn</span>
          </div>
          
          <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <span className="full-name">Do It Together</span><br />
            Exchange Skills, <span className="gradient-text">Not Money.</span>
          </h1>
          
          <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.3s' }}>
            I teach React → you teach Photoshop. I teach English → you teach Coding. 
            Join the ultimate skill exchange platform and grow together.
          </p>
          
          <div className="hero-cta animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/login?mode=signup" className="btn-primary btn-large">
              Start Swapping Skills <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card glass-panel animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="feature-icon"><BookOpen size={24} /></div>
          <h3>Learn Anything</h3>
          <p>Find experts in any field willing to teach you in exchange for your knowledge.</p>
        </div>
        <div className="feature-card glass-panel animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="feature-icon"><Users size={24} /></div>
          <h3>Build Connections</h3>
          <p>Create meaningful relationships with passionate learners and mentors globally.</p>
        </div>
        <div className="feature-card glass-panel animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="feature-icon"><Zap size={24} /></div>
          <h3>AI Matchmaking</h3>
          <p>Our intelligent AI assistant finds the perfect skill swap partner for you instantly.</p>
        </div>
      </section>
    </div>
  );
};
