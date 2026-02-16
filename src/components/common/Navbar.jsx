import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaChartBar, FaUsers } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaHome /> CV Platform
        </Link>

        <div className="nav-menu">
          {isAuthenticated() ? (
            <>
              <Link to="/profile" className="nav-link">
                <FaUser /> {user?.nom || 'Profile'}
              </Link>

              {hasRole('ETUDIANT') && (
                <Link to="/etudiant/dashboard" className="nav-link">
                  <FaChartBar /> Dashboard
                </Link>
              )}

              {hasRole('ADMIN') && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">
                    <FaChartBar /> Dashboard
                  </Link>
                  <Link to="/admin/utilisateurs" className="nav-link">
                    <FaUsers /> Users
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="nav-logout">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;