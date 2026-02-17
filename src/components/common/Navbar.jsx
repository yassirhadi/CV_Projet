import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaHome, FaChartBar, FaUsers, FaUserShield } from 'react-icons/fa';

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
                <FaUser /> Mon profil
                {user?.nom ? <span className="nav-profile-name">({user.nom})</span> : null}
              </Link>

              {hasRole('ETUDIANT') && (
                <Link to="/etudiant/dashboard" className="nav-link">
                  <FaChartBar /> Tableau de bord
                </Link>
              )}

              {hasRole('ADMIN') && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">
                    <FaChartBar /> Tableau de bord
                  </Link>
                  <Link to="/admin/utilisateurs" className="nav-link">
                    <FaUsers /> Utilisateurs
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="nav-logout">
                <FaSignOutAlt /> Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/admin/login" className="nav-link">
                <FaUserShield /> Admin
              </Link>
              <Link to="/login" className="nav-link">Connexion</Link>
              <Link to="/register" className="nav-link">Inscription</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;