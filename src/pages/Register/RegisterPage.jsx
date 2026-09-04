import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';
import '../Login/AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'citizen',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register(formData);
    setIsSubmitting(false);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <span className="auth-logo">🏛️</span>
          <h2>Join CivicWatch</h2>
          <p>Help us make Bangalore a smarter city</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User size={18} />
              <input 
                name="name"
                type="text" 
                required 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input 
                name="email"
                type="email" 
                required 
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone size={18} />
              <input 
                name="phone"
                type="tel" 
                required 
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Account Type</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', marginBottom: '6px' }}>
              <button
                type="button"
                className={`btn ${formData.role === 'citizen' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '10px', fontSize: '14px', borderRadius: '8px' }}
                onClick={() => setFormData({ ...formData, role: 'citizen' })}
              >
                👤 Citizen
              </button>
              <button
                type="button"
                className={`btn ${formData.role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '10px', fontSize: '14px', borderRadius: '8px' }}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                🛠️ Administrator
              </button>
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input 
                name="password"
                type="password" 
                required 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : (
              <>
                Register <UserPlus size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
