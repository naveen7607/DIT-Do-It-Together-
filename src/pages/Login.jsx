import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('EMAIL'); // EMAIL or OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.sendOTP(email);
      setStep('OTP');
    } catch (err) {
      setError('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, otp);

    if (result.success) {
      navigate('/learning', { replace: true });
    } else {
      setError(result.error || 'Invalid OTP');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <h1 className="gradient-text">Welcome to DIT</h1>
          <p>Skill exchange platform</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOTP} className="login-form">
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                className="input-field with-icon"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Send OTP'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <p className="otp-sent-text">OTP sent to {email}</p>
            <div className="input-group">
              <KeyRound className="input-icon" size={20} />
              <input
                type="text"
                className="input-field with-icon"
                placeholder="Enter 6-digit OTP (Try 123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20} /> : 'Verify & Login'}
            </button>

            <button
              type="button"
              className="btn-link"
              onClick={() => setStep('EMAIL')}
            >
              Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
