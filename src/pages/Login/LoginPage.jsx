import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('citizen');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      if (loginRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="role-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`btn ${loginRole === 'citizen' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            onClick={() => {
              setLoginRole('citizen');
              setEmail('');
              setPassword('');
            }}
          >
            👤 Citizen
          </button>
          <button
            type="button"
            className={`btn ${loginRole === 'admin' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            onClick={() => {
              setLoginRole('admin');
              setEmail('');
              setPassword('');
            }}
          >
            🛠️ Admin
          </button>
        </div>

        <div className="auth-header">
          <span className="auth-logo">{loginRole === 'admin' ? '🛠️' : '🏙️'}</span>
          <h2>{loginRole === 'admin' ? 'Admin Portal' : 'Welcome Back'}</h2>
          <p>{loginRole === 'admin' ? 'Sign in with administrator credentials' : 'Login to track your reported issues'}</p>
        </div>
        
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
          
          <div className="input-group">
            <div className="label-row">
              <label>Password</label>
              <Link to="/forgot-password">Forgot?</Link>
            </div>
            <div className="input-wrapper">
              <Lock size={18} />
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : (
              <>
                Login <LogIn size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create one <ArrowRight size={14} /></Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
