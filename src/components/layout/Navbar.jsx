import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ChevronDown, Menu, X, PlusCircle } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏙️</span>
          <div className="logo-text">
            <h1>CivicWatch</h1>
            <span>Bangalore</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-desktop">
          <Link to="/" className="nav-link">Home</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link">Dashboard</Link>
          )}
          {user?.role === 'department_official' && (
            <Link to="/officer" className="nav-link">Officer Dashboard</Link>
          )}
          
          <div className="navbar-actions">
            <Link to="/report" className="btn btn-accent">
              <PlusCircle size={18} />
              Report Issue
            </Link>

            {user ? (
              <div className="profile-dropdown-container">
                <button 
                  className="profile-trigger"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={16} className={isProfileOpen ? 'rotate' : ''} />
                </button>

                {isProfileOpen && (
                  <div className="profile-dropdown animate-fade-in">
                    <div className="dropdown-header">
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/my-issues" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <PlusCircle size={16} /> My Issues
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline">Login</Link>
            )}
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="navbar-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="navbar-mobile animate-fade-in">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
          )}
          {user?.role === 'department_official' && (
            <Link to="/officer" onClick={() => setIsMenuOpen(false)}>Officer Dashboard</Link>
          )}
          <Link to="/my-issues" onClick={() => setIsMenuOpen(false)}>My Issues</Link>
          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
          <Link to="/report" className="btn btn-accent" onClick={() => setIsMenuOpen(false)}>Report Issue</Link>
          {user ? (
            <button onClick={handleLogout} className="text-danger">Logout</button>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
