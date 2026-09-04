import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import '../Login/AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending email api call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <span className="auth-logo">🔑</span>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  required
                  placeholder="namma@bangalore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Sending Link...' : (
                <>
                  Send Reset Link <KeyRound size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#059669', fontWeight: '600', marginBottom: '8px' }}>✓ Reset Link Sent!</p>
            <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
              We have sent a secure password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
          </div>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
