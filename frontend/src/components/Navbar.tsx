import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏛️</span>
          <span>E-County Kisii</span>
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/" className="navbar-link">
                Home
              </Link>

              {user?.role === 'citizen' && (
                <>
                  <Link to="/report-issue" className="navbar-link">
                    Report Issue
                  </Link>
                  <Link to="/dashboard/citizen" className="navbar-link">
                    My Dashboard
                  </Link>
                </>
              )}

              {user?.role === 'officer' && (
                <>
                  <Link to="/dashboard/officer" className="navbar-link">
                    Officer Dashboard
                  </Link>
                  <Link to="/announcements/create" className="navbar-link">
                    Create Announcement
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link to="/dashboard/admin" className="navbar-link">
                    Admin Dashboard
                  </Link>
                </>
              )}

              <Link to="/announcements" className="navbar-link">
                Announcements
              </Link>

              <div className="navbar-user">
                <span className="user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="navbar-link">
                Home
              </Link>
              <Link to="/announcements" className="navbar-link">
                Announcements
              </Link>
              <Link to="/login" className="navbar-link btn-login">
                Sign In
              </Link>
              <Link to="/register" className="navbar-link btn-register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
