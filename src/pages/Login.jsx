import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Mail, KeyRound, ArrowRight, Loader2, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'SIGNUP' : 'LOGIN';
  
  const [mode, setMode] = useState(initialMode); // LOGIN, SIGNUP, FORGOT_PASSWORD
  const [step, setStep] = useState('FORM'); // FORM or OTP (for signup and forgot_password)
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState(''); // personalEmail for signup
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // also acts as newPassword in forgot flow
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { loginWithPassword, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await loginWithPassword(username, password);
    if (result.success) {
      navigate('/learning', { replace: true });
    } else {
      setError(result.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleSignupInit = async (e) => {
    e.preventDefault();
    if (!email || !username || !password) {
      setError('Please fill all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await authService.sendOTP(email);
      setStep('OTP');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signup(email, otp, username, password);

    if (result.success) {
      navigate('/learning', { replace: true });
    } else {
      setError(result.error || 'Invalid OTP');
      setLoading(false);
    }
  };

  const handleForgotInit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter your @dit.com username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.sendForgotPasswordOTP(username);
      setSuccessMsg(`OTP sent to ${res.email}`);
      setStep('OTP');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgot = async (e) => {
    e.preventDefault();
    if (!otp || !password) {
      setError('Please enter OTP and new password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await resetPassword(username, otp, password);

    if (result.success) {
      setSuccessMsg('Password reset successful! You can now login.');
      setMode('LOGIN');
      setStep('FORM');
      setPassword('');
      setOtp('');
    } else {
      setError(result.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setStep('FORM');
    setError('');
    setSuccessMsg('');
    setEmail('');
    setUsername('');
    setPassword('');
    setOtp('');
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <h1 className="gradient-text">
            {mode === 'LOGIN' ? 'Welcome Back' : mode === 'SIGNUP' ? 'Create Account' : 'Reset Password'}
          </h1>
          <p>
            {mode === 'LOGIN' ? 'Login to continue exchanging skills' : mode === 'SIGNUP' ? 'Join the skill exchange platform' : 'Enter your username to reset your password'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="otp-sent-text" style={{marginBottom: '20px'}}>{successMsg}</div>}

        {mode !== 'FORGOT_PASSWORD' && (
          <div className="mode-toggle">
            <button 
              className={`toggle-btn ${mode === 'LOGIN' ? 'active' : ''}`}
              onClick={() => toggleMode('LOGIN')}
            >
              Login
            </button>
            <button 
              className={`toggle-btn ${mode === 'SIGNUP' ? 'active' : ''}`}
              onClick={() => toggleMode('SIGNUP')}
            >
              Sign Up
            </button>
          </div>
        )}

        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <UserIcon className="input-icon" size={20} />
              <input
                type="text"
                className="input-field with-icon"
                placeholder="Username (e.g. rahul@dit.com)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="input-group password-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field with-icon password-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Login'}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => toggleMode('FORGOT_PASSWORD')}
            >
              Forgot Password?
            </button>
          </form>
        )}

        {mode === 'SIGNUP' && step === 'FORM' && (
          <form onSubmit={handleSignupInit} className="login-form">
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                className="input-field with-icon"
                placeholder="Personal Gmail (for OTP)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group username-group">
              <UserIcon className="input-icon" size={20} />
              <input
                type="text"
                className="input-field with-icon"
                placeholder="Desired Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
              />
              <span className="domain-suffix">@dit.com</span>
            </div>

            <div className="input-group password-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field with-icon password-input"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Send OTP'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        )}

        {mode === 'SIGNUP' && step === 'OTP' && (
          <form onSubmit={handleVerifySignup} className="login-form">
            <p className="otp-sent-text">OTP sent to {email}</p>
            <div className="input-group">
              <KeyRound className="input-icon" size={20} />
              <input
                type="text"
                className="input-field with-icon"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => setStep('FORM')}
            >
              Back
            </button>
          </form>
        )}

        {mode === 'FORGOT_PASSWORD' && step === 'FORM' && (
          <form onSubmit={handleForgotInit} className="login-form">
            <div className="input-group">
              <UserIcon className="input-icon" size={20} />
              <input
                type="text"
                className="input-field with-icon"
                placeholder="Your @dit.com Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Send Reset OTP'}
              {!loading && <ArrowRight size={20} />}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => toggleMode('LOGIN')}
            >
              Back to Login
            </button>
          </form>
        )}

        {mode === 'FORGOT_PASSWORD' && step === 'OTP' && (
          <form onSubmit={handleVerifyForgot} className="login-form">
            <div className="input-group">
              <KeyRound className="input-icon" size={20} />
              <input
                type="text"
                className="input-field with-icon"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="input-group password-group">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field with-icon password-input"
                placeholder="Enter New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Reset Password'}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => toggleMode('LOGIN')}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
