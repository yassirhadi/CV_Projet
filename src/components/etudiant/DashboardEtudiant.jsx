import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaFileAlt, FaChartLine, FaStar, FaLock } from 'react-icons/fa';

const DashboardEtudiant = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Bienvenue, {user?.nom} !</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <FaFileAlt className="stat-icon" />
          <div className="stat-info"><h3>Total CVs</h3><p>3</p></div>
        </div>
        <div className="stat-card">
          <FaChartLine className="stat-icon" />
          <div className="stat-info"><h3>Analyses</h3><p>5</p></div>
        </div>
        <div className="stat-card">
          <FaStar className="stat-icon" />
          <div className="stat-info"><h3>Score moyen</h3><p>72%</p></div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <div className="action-icon">
            <FaLock />
          </div>
          <div className="action-content">
            <h3>Mot de passe</h3>
            <p>Vous pouvez modifier votre mot de passe depuis votre profil.</p>
          </div>
          <Link to="/profile" className="action-link">Changer maintenant</Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardEtudiant;